import { format } from './date.js'
import * as dom from './dom.js'

class Tooltip {
  constructor (root, navigation) {
    this.root = root
    this.el = dom.create('div')
    this.navigation = navigation
    this.idx = 0
    this.dots = {}
    this.values = {}
    this.items = {}
    this.body = null
    this.date = null
    this.hide()
    this.init()
  }

  init () {
    var series = this.navigation.graph.series
    var body = [
      `<div class="body cell">`,
      `<div class="date"></div>`,
      `<div class="series">`,
      series.map(this.initSeries, this).join(''),
      `</div>`,
      `</div>`,
      series.map(this.initDot, this).join('')
    ].join('')

    dom.addClass(this.el, 'tooltip')
    dom.html(this.el, body)

    dom.append(this.root, this.el)

    this.collect()
    this.render()
  }

  initSeries (series) {
    return [
      `<div class="item" id="${series.name}" style="color:${series.color}">`,
      `<div class="value" id="${series.name}"></div>`,
      `<div class="name">${series.name}</div>`,
      `</div>`
    ].join('')
  }

  initDot (series) {
    return `<div class="dot" id="${series.name}" style="color:${series.color}"></div>`
  }

  collect () {
    var items = dom.selectAll(this.el, '.item')
    var values = dom.selectAll(this.el, '.value')
    var dots = dom.selectAll(this.el, '.dot')

    for (var i = 0; i < items.length; i++) {
      this.items[items[i].id] = items[i]
      this.values[values[i].id] = values[i]
      this.dots[dots[i].id] = dots[i]
    }

    this.body = dom.select(this.el, '.body')
    this.date = dom.select(this.el, '.date')
  }

  render () {
    var nav = this.navigation
    var graph = nav.graph
    var yScale = nav.yScale
    var xData = graph.xData

    graph.series.forEach(series => {
      this.renderSeries(series)
      this.renderDot(series)
    })
    this.renderDate()

    var xScale = nav.xScale
    var width = this.body.clientWidth
    var r1 = xScale.range[1]
    var offset = xScale.get(xData[this.idx])
    var shift = -12

    if (offset + width + shift > r1) {
      shift = r1 - offset - width + 16
    } else if (offset + shift < -16) {
      shift = offset - 16
    }

    dom.css(this.body, 'transform', `translate(${shift}px)`)

    dom.css(this.el, 'transform', `translate(${offset}px)`)
    dom.css(this.el, 'height', `${yScale.range[0] - 1}px`)
  }

  renderDate () {
    dom.text(this.date, format(this.navigation.graph.xData[this.idx]))
  }

  renderSeries (series) {
    var item = this.items[series.name]

    if (series.active) {
      dom.show(item)
    } else {
      dom.hide(item)
    }

    dom.text(this.values[series.name], series.yData[this.idx].toLocaleString())
  }

  renderDot (series) {
    var navigation = this.navigation
    var yScale = navigation.yScale
    var value = series.yData[this.idx]
    var dot = this.dots[series.name]

    if (series.active) {
      dom.show(dot)
    } else {
      dom.hide(dot)
    }

    dom.css(dot, 'transform', `translateY(${yScale.get(value)}px)`)
  }

  setIndex (idx) {
    this.idx = idx
    this.render()
  }

  show (x) {
    var nav = this.navigation
    var [min, max] = nav.xScale.domain
    var value = nav.xScale.invert(x)
    var idx = nav.graph.findXIndex(value)

    value = nav.graph.xData[idx]

    if (min <= value && value <= max && idx !== -1) {
      dom.show(this.el)
      this.setIndex(idx)
    } else {
      this.hide()
    }
  }

  hide () {
    dom.hide(this.el)
  }
}

export default Tooltip
