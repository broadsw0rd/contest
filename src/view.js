var document = window.document

class View {
  constructor (root, graph) {
    this.root = root
    this.el = document.createElement('div')
    this.graph = graph
    this.render()
    this.canvas = this.el.querySelector('canvas')
  }

  render () {
    var body = [
      `<div class="cell container"><div class="graph"><canvas></canvas></div></div>`,
      this.graph.series.map(this.renderSeries, this).join('')
    ].join('')

    this.el.classList.add('chart')
    this.el.innerHTML = body

    this.root.appendChild(this.el)
  }

  renderSeries (series) {
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
