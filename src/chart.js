import View from './view.js'
import Renderer from './renderer.js'
import Navigation from './navigation.js'
import Tooltip from './tooltip.js'
import * as dom from './dom.js'
import Vector from './vector.js'

const METHOD_RESIZE_LEFT = 1
const METHOD_RESIZE_RIGHT = 2
const METHOD_DRAG = 3

class Chart {
  constructor (element, graph) {
    this.graph = graph
    this.navigation = new Navigation(graph)
    this.view = new View(element, graph)
    this.renderer = new Renderer(this.view.canvas, this.navigation)
    this.tooltip = new Tooltip(this.view.canvas.parentNode, this.navigation)
    this.offset = new Vector(0, 0)
    this.subscribe()

    this.pressed = false
    this.longTap = false
    this.prevX = 0
    this.method = 0
  }

  updateOffset () {
    var rect = this.view.canvas.getBoundingClientRect()
    this.offset.x = rect.left
    this.offset.y = rect.top
  }

  updateYExtremes () {
    var { min, max } = this.navigation
    var graph = this.graph
    var [x0, x1] = [min.position.x, max.position.x]
    var [y0, y1] = this.graph.getYExtremes(x0, x1)

    min.accelerate(new Vector(x0, y0))
    max.accelerate(new Vector(x1, y1))
  }

  simulate (dt) {
    var nav = this.navigation
    nav.simulate(dt)
    if (nav.min.active || nav.max.active) {
      this.renderer.enqueue()
    }
  }

  validate (x, y) {
    var graph = this.graph
    var xScale = graph.xScale
    var yScale = graph.yScale
    var [x0, x1] = xScale.range
    var [y1, y0] = yScale.range

    return x >= x0 && x <= x1 && y >= y0 && y <= y1
  }

  prepare (x, y) {
    x = x - this.offset.x
    y = y - this.offset.y

    return { x, y }
  }

  tap (x) {
    var canvas = this.view.canvas
    var navigation = this.navigation
    var xScale = navigation.graph.xScale
    var start = xScale.get(navigation.min.position.x)
    var end = xScale.get(navigation.max.position.x)

    if (Math.abs(start - x) < 10) {
      this.method = METHOD_RESIZE_LEFT
    } else if (Math.abs(end - x) < 10) {
      this.method = METHOD_RESIZE_RIGHT
    } else if (start < x && end > x) {
      this.method = METHOD_DRAG
    } else {
      this.method = METHOD_MOVE
    }
  }

  drag (x) {
    var navigation = this.navigation
    var xScale = navigation.graph.xScale
    var delta = x - this.prevX
    var start = xScale.get(navigation.min.position.x)
    var end = xScale.get(navigation.max.position.x)

    if (this.method === METHOD_RESIZE_LEFT) {
      navigation.min.position.x = xScale.invert(start + delta)
    } else if (this.method === METHOD_RESIZE_RIGHT) {
      navigation.max.position.x = xScale.invert(end + delta)
    } else {
      navigation.min.position.x = xScale.invert(start + delta)
      navigation.max.position.x = xScale.invert(end + delta)
    }

    this.updateYExtremes()

    this.prevX = x
  }

  subscribe () {
    var canvas = this.view.canvas

    dom.on(this.view.el, 'change', this)

    dom.on(canvas, 'mousedown', this)
    dom.on(canvas, 'mouseup', this)
    dom.on(canvas, 'touchstart', this)
    dom.on(canvas, 'touchend', this)
    dom.on(canvas, 'mousemove', this)
    dom.on(canvas, 'touchmove', this)
    dom.on(canvas, 'mouseleave', this)
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
      case 'mouseleave': return this.handleMouseleave(e)
    }
  }

  handleChange (e) {
    var target = e.target
    var name = target.name

    var series = this.graph.seriesIndex[name]

    if (series) {
      series.setActive(target.checked)

      this.updateYExtremes()

      var graph = this.graph
      var nav = this.navigation

      graph.min.accelerate(nav.min.target)
      graph.max.accelerate(nav.max.target)
    }
  }

  handleMousedown (e) {
    var { x, y } = this.prepare(e.pageX, e.pageY)

    if (this.validate(x, y)) {
      this.pressed = true
      this.prevX = x
      this.tap(x)
    }
  }

  handleMouseup (e) {
    this.pressed = false
  }

  handleMousemove (e) {
    var { x, y } = this.prepare(e.pageX, e.pageY)

    if (this.validate(x, y)) {
      this.tooltip.hide()
      if (this.pressed) {
        this.drag(x)
      }
    } else {
      this.tooltip.show(x)
    }
  }

  handleTouchstart (e) {
    var [touch] = e.targetTouches
    var { x, y } = this.prepare(touch.pageX, touch.pageY)

    if (this.validate(x, y)) {
      e.preventDefault()
      this.pressed = true
      this.prevX = x
      this.tap(x)
    } else {
      this.longTapTimeout = setTimeout(() => {
        this.longTap = true
        this.tooltip.show(x)
      }, 125)
    }
  }

  handleTouchmove (e) {
    var [touch] = e.targetTouches

    var { x, y } = this.prepare(e.pageX, e.pageY)

    if (this.pressed && this.validate(x, y)) {
      e.preventDefault()
      this.drag(x)
    } else if (this.longTap) {
      e.preventDefault()
      this.tooltip.show(x)
    }
  }

  handleTouchend (e) {
    e.preventDefault()
    this.pressed = false
    this.longTap = false
    clearTimeout(this.longTapTimeout)
    this.tooltip.hide()
  }

  handleMouseleave (e) {
    this.tooltip.hide()
  }

  redraw (dt) {
    this.simulate(dt)
    this.renderer.redraw()
  }
}

export default Chart
