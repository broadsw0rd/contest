import Scale from './scale.js'
import Point from './point.js'

class Graph {
  constructor () {
    this.xData = []
    this.series = []
    this.seriesIndex = {}
    this.xScale = new Scale()
    this.yScale = new Scale()
    this.min = new Point(0, 0)
    this.max = new Point(0, 0)
  }

  addSeries (series) {
    series.setChart(this)
    this.series.push(series)
    this.seriesIndex[series.name] = series
  }

  setXData (data) {
    this.xData = data
  }

  hasData () {
    return this.series.some(series => series.active)
  }

  simulate (dt) {
    var min = this.min
    var max = this.max

    min.simulate(dt)
    max.simulate(dt)

    this.xScale.setDomain(min.position.x, max.position.x)
    this.yScale.setDomain(min.position.y, max.position.y)
  }

  getYExtremes (start, end) {
    var series = this.series
    var xData = this.xData

    var min
    var max

    for (var i = 0; i < series.length; i++) {
      var current = series[i]

      if (!current.active) continue

      var yData = current.yData

      for (var j = 0; j < xData.length; j++) {
        var xDatum = xData[j]

        if (start <= xDatum && xDatum <= end) {
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

    min = min || 0
    max = max || 0

    var range = max - min
    var padding = range * 0.2

    max += padding

    return [min, max]
  }

  findXIndex (value) {
    var xData = this.xData

    for (var i = 0; i < xData.length - 1; i++) {
      var low = xData[i]
      var high = xData[i + 1]
      if (value >= low && value <= high) {
        if (value - low < high - value) {
          return i
        } else {
          return i + 1
        }
      }
    }

    return -1
  }
}

export default Graph
