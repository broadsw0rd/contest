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

    this.offsetX = 0
    this.prevX = 0
  }

  subscribe () {
    this.view.el.addEventListener('change', this)
    this.view.canvas.addEventListener('mousedown', this)
    this.view.canvas.addEventListener('mouseup', this)
    this.view.canvas.addEventListener('touchstart', this)
    this.view.canvas.addEventListener('touchend', this)
  }

  tap (x, y) {
    var navigation = this.navigation
    var xScale = navigation.xScale
    var yScale = navigation.yScale
    var [x0, x1] = xScale.range
    var [y1, y0] = yScale.range
    var canvas = this.view.canvas
    var offsetLeft = canvas.offsetLeft
    var offsetTop = canvas.offsetTop

    x = x - offsetLeft
    y = y - offsetTop

    this.offsetX = offsetLeft

    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
      this.view.canvas.addEventListener('mousemove', this)
      this.view.canvas.addEventListener('touchmove', this)
      this.prevX = x
    }
  }

  drag (x) {
    var navigation = this.navigation
    var xScale = navigation.xScale
    var xData = navigation.graph.xData
    var delta = x - this.prevX

    var cur = xScale.get(navigation.offset)
    var offset = xScale.invert(cur + delta)

    offset = Math.max(xData[0], offset)
    offset = Math.min(xData[xData.length - 1] - navigation.range, offset)

    navigation.navigate(offset, navigation.range)

    this.renderer.enqueue()
    this.prevX = x
  }

  handleEvent (e) {
    switch (e.type) {
      case 'change': return this.handleChange(e)
      case 'mousedown': return this.handleMousedown(e)
      case 'touchstart': return this.handleTouchstart(e)
      case 'mouseup': return this.handleMouseup(e)
      case 'touchmove': return this.handleTouchmove(e)
      case 'mousemove': return this.handleMousemove(e)
      case 'touchend':
      case 'touchcancel': return this.handleTouchend(e)
    }
  }

  handleChange (e) {
    var target = e.target
    var name = target.name

    var series = this.graph.seriesIndex[name]

    if (series) {
      series.setActive(target.checked)
      this.navigation.updateYExtremes()
      this.renderer.enqueue()
    }
  }

  handleMousedown (e) {
    this.tap(e.pageX, e.pageY)
  }

  handleMouseup (e) {
    this.view.canvas.removeEventListener('mousemove', this)
  }

  handleMousemove (e) {
    this.drag(e.pageX - this.offsetX)
  }

  handleTouchstart (e) {
    var [touch] = e.targetTouches
    this.tap(touch.pageX, touch.pageY)
  }

  handleTouchmove (e) {
    e.preventDefault()
    var [touch] = e.targetTouches
    this.drag(touch.pageX - this.offsetX)
  }

  handleTouchend (e) {
    e.preventDefault()
    this.view.canvas.removeEventListener('touchmove', this)
  }

  redraw (dt) {
    this.renderer.redraw()
  }
}

export default Chart
