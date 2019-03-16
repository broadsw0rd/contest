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
  }

  setXData (data) {
    this.xData = data
  }
}

export default Graph
