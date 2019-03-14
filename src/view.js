var document = window.document

class View {
  constructor (root, chart) {
    this.root = root
    this.el = document.createElement('div')
    this.chart = chart
    this.render()
    this.canvas = this.el.querySelector('canvas')
  }

  render () {
    var body = [
      `<div class="cell container"><div class="canvas"><canvas></canvas></div></div>`,
      this.chart.series.map(this.renderSeries, this).join('')
    ].join('')

    this.el.classList.add('chart')
    this.el.innerHTML = body

    this.root.appendChild(this.el)
  }

  renderSeries (series) {
    return [
      `<div class="cell">`,
      `<label>`,
      `<input type="checkbox" checked/>`,
      `<span class="icon" style="color:${series.color}"></span>`,
      `<span class="text">${series.name}</span>`,
      `</label>`,
      `</div>`
    ].join('')
  }
}

export default View
