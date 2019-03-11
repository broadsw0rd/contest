class Series {
  constructor (options = {}) {
    this.name = options.name || ''
    this.color = options.color || '#000'
    this.yData = options.yData || []
    this.active = options.active || true
    this.chart = options.chart || null
  }

  setActive (active) {
    this.active = active
  }

  setChart (chart) {
    this.chart = chart
  }
}

export default Series
