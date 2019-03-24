import * as dom from './dom.js'

class View {
  constructor (root, graph) {
    this.root = root
    this.el = dom.create('div')
    this.graph = graph
    this.init()
    this.canvas = dom.select(this.el, 'canvas')
    this.placeholder = dom.select(this.el, '.placeholder')
  }

  init () {
    var body = [
      `<div class="cell container">`,
      `<div class="graph">`,
      `<canvas></canvas>`,
      `<div class="placeholder">No data</div>`,
      `</div>`,
      `</div>`,
      this.graph.series.map(this.initSeries, this).join('')
    ].join('')

    dom.addClass(this.el, 'chart')
    dom.addClass(this.el, 'cell')
    dom.html(this.el, body)

    dom.append(this.root, this.el)
  }

  initSeries (series) {
    return [
      `<div class="cell">`,
      `<label>`,
      `<input type="checkbox" name="${series.name}" checked/>`,
      `<span class="icon" style="color:${series.color}"></span>`,
      `<span class="text">${series.name}</span>`,
      `</label>`,
      `</div>`
    ].join('')
  }
}

export default View
