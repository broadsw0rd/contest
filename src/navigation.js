import Scale from './scale.js'

class Navigation {
  constructor (graph) {
    this.graph = graph
    this.xScale = new Scale()
    this.yScale = new Scale()

    var xData = graph.xData
    var start = xData[0]
    var end = xData[xData.length - 1]
    var range = end - start
    this.navigate(start + range / 2, range / 2)
    this.xScale.setDomain(start, end)

    var yDomain = graph.yScale.domain
    this.yScale.setDomain(yDomain[0], yDomain[1])
  }

  navigate (offset, range) {
    this.offset = offset
    this.range = range
    this.graph.xScale.setDomain(offset, offset + range)
    this.updateYExtremes()
  }

  updateYExtremes () {
    var series = this.graph.series
    var xData = this.graph.xData
    var start = this.offset
    var end = start + this.range
    var min
    var max

    for (var i = 0; i < series.length; i++) {
      var current = series[i]

      if (!current.active) continue

      var yData = current.yData
      for (var j = 0; j < xData.length; j++) {
        var xDatum = xData[j]
        if (xDatum >= start && xDatum <= end) {
          var yDatum = yData[j]

          min = min || yDatum
          max = max || yDatum

          if (yDatum < min) {
            min = yDatum
          } else if (yDatum > max) {
            max = yDatum
          }
        }
      }
    }

    var range = max - min
    var padding = range * 0.05

    this.graph.yScale.setDomain(min - padding, max + padding)
  }
}

export default Navigation
