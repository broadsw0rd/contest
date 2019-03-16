import Scale from './scale.js'

class Graph {
  constructor () {
    this.xData = []
    this.series = []
    this.seriesIndex = {}
    this.xScale = new Scale()
    this.yScale = new Scale()
  }

  addSeries (series) {
    series.setChart(this)
    this.series.push(series)
    this.seriesIndex[series.name] = series
    this.updateYExremes(series)
  }

  setXData (data) {
    this.xData = data
    this.xScale.setDomain(data[0], data[data.length - 1])
  }

  updateYExremes (series) {
    var yData = series.yData
    var yScale = this.yScale
    var min = yScale.domain[0]
    var max = yScale.domain[1]

    for (var i = 0; i < yData.length; i++) {
      var datum = yData[i]

      min = min || datum
      max = max || datum

      if (datum < min) {
        min = datum
      } else if (datum > max) {
        max = datum
      }
    }

    var range = max - min
    var padding = range * 0.1

    yScale.setDomain(min - padding, max + padding)
  }
}

export default Graph
