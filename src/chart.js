import View from './view.js'
import Renderer from './renderer.js'
import Navigation from './navigation.js'

class Chart {
  constructor (element, graph) {
    this.graph = graph
    this.navigation = new Navigation(graph)
    this.view = new View(element, graph)
    this.renderer = new Renderer(this.view.canvas, this.navigation)
    this.subscribe()
  }

  subscribe () {
    this.view.el.addEventListener('change', this)
  }

  handleEvent (e) {
    switch (e.type) {
      case 'change': return this.handleChange(e)
    }
  }

  handleChange (e) {
    var target = e.target
    var name = target.name

    var series = this.graph.seriesIndex[name]

    if (series) {
      series.setActive(target.checked)
      this.renderer.enqueue()
    }
  }

  redraw (dt) {
    this.renderer.redraw()
  }
}

export default Chart
