class Series {
  constructor (options = {}) {
    this.name = options.name || ''
    this.color = options.color || '#000'
    this.yData = options.yData || []
    this.active = options.active || true
    this.graph = options.graph || null
  }

  setActive (active) {
    this.active = active
  }

  setChart (graph) {
    this.graph = graph
  }
}

export default Series
