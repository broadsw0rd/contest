import * as dom from './dom.js'

class View {
  constructor (root, chart) {
    this.root = root
    this.el = dom.create('div')
    this.canvas = dom.create('canvas')
    this.chart = chart
  }

  render () {
    var container = dom.create('div')
    dom.addClass(container, 'cell')
    dom.addClass(container, 'canvas')

    dom.append(container, this.canvas)
    dom.append(this.el, container)

    this.chart.series.forEach(this.renderSeries, this)

    dom.addClass(this.el, 'chart')
    dom.append(this.root, this.el)
  }

  renderSeries (series) {
    var container = dom.create('div')
    dom.addClass(container, 'cell')

    var label = dom.create('label')

    var input = dom.create('input')
    dom.attr(input, 'type', 'checkbox')
    input.checked = series.active

    var icon = dom.create('span')
    dom.addClass(icon, 'icon')
    dom.style(icon, 'color', series.color)

    var txt = dom.create('span')
    dom.addClass(txt, 'text')
    dom.text(txt, series.name)

    dom.append(container, label)
    dom.append(label, input)
    dom.append(label, icon)
    dom.append(label, txt)

    dom.append(this.el, container)
  }
}

export default View
