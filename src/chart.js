class Chart {
  constructor () {
    this.xData = []
    this.series = []
    this.seriesIndex = {}
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

export default Chart
