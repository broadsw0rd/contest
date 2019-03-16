import View from './view.js'
import Renderer from './renderer.js'

class Chart {
  constructor (element, graph) {
    this.graph = graph
    this.view = new View(element, graph)
    this.renderer = new Renderer(this.view.canvas, graph)
  }

  redraw (dt) {
    this.renderer.redraw()
  }
}

export default Chart
