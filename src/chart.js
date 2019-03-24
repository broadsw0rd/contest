import View from './view.js'
import Renderer from './renderer.js'
import Navigation from './navigation.js'
import Tooltip from './tooltip.js'
import Kinetic from './kinetic.js'
import * as dom from './dom.js'
import Vector from './vector.js'

const METHOD_RESIZE_LEFT = 1
const METHOD_RESIZE_RIGHT = 2
const METHOD_DRAG = 3
const METHOD_MOVE = 4

class Chart {
  constructor (element, graph) {
    this.graph = graph
    this.navigation = new Navigation(graph)
    this.view = new View(element, graph)
    this.renderer = new Renderer(this.view.canvas, this.navigation)
    this.kinetic = new Kinetic(this.view.canvas)
    this.tooltip = new Tooltip(this.view.canvas.parentNode, this.navigation)

    this.subscribe()

    this.longTap = false
    this.method = 0
  }

  updateYExtremes ({ min, max }) {
    var graph = this.graph
    var [x0, x1] = [min.position.x, max.position.x]
    var [y0, y1] = graph.getYExtremes(x0, x1)

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

  validate ({ x, y }) {
    var graph = this.graph
    var xScale = graph.xScale
    var yScale = graph.yScale
    var [x0, x1] = xScale.range
    var [y1, y0] = yScale.range

    return x >= x0 && x <= x1 && y >= y0 && y <= y1
  }

  tap (pointer) {
    if (this.validate(pointer.startPosition)) {
      pointer.event.preventDefault()
    } else {
      this.longTap = setTimeout(() => {
        pointer.event.preventDefault()
        this.tooltip.show(pointer.startPosition.x)
      }, 125)
    }

    var { x } = pointer.startPosition
    var navigation = this.navigation
    var xScale = navigation.graph.xScale
    var minPos = navigation.min.position
    var maxPos = navigation.max.position
    var start = xScale.get(minPos.x)
    var end = xScale.get(maxPos.x)

    if (Math.abs(start - x) < 10) {
      this.method = METHOD_RESIZE_LEFT
    } else if (Math.abs(end - x) < 10) {
      this.method = METHOD_RESIZE_RIGHT
    } else if (start < x && end > x) {
      this.method = METHOD_DRAG
      this.range = maxPos.x - minPos.x
    } else {
      this.method = METHOD_MOVE
    }
  }

  drag (x) {
    var navigation = this.navigation
    var xScale = navigation.graph.xScale
    var [min, max] = xScale.domain
    var range = (max - min) * 0.1
    var minPos = navigation.min.position
    var maxPos = navigation.max.position
    var start = xScale.get(minPos.x)
    var end = xScale.get(maxPos.x)
    var value

    if (this.method === METHOD_DRAG) {
      value = xScale.invert(start + x)
      value = Math.max(min, Math.min(value, max - this.range))
      minPos.x = value
      maxPos.x = value + this.range
    } else if (this.method === METHOD_RESIZE_LEFT) {
      value = xScale.invert(start + x)
      value = Math.max(min, Math.min(maxPos.x - range, value))
      minPos.x = value
    } else if (this.method === METHOD_RESIZE_RIGHT) {
      value = xScale.invert(end + x)
      value = Math.max(minPos.x + range, Math.min(max, value))
      maxPos.x = value
    }

    this.updateYExtremes(this.navigation)
  }

  subscribe () {
    var canvas = this.view.canvas

    dom.on(this.view.el, 'change', this)
    dom.on(canvas, 'mousemove', this)
    dom.on(canvas, 'mouseleave', this)
    dom.on(canvas, 'touchend', this)
    dom.on(canvas, 'touchcancel', this)
    this.kinetic.subscribe(this.navigate.bind(this))
    this.kinetic.ontap = this.tap.bind(this)
  }

  handleEvent (e) {
    switch (e.type) {
      case 'change': return this.handleChange(e)
      case 'mousemove': return this.showTooltip(e)
      case 'mouseleave':
      case 'touchend':
      case 'touchcancel': return this.hideTooltip(e)
    }
  }

  handleChange (e) {
    var target = e.target
    var name = target.name

    var series = this.graph.seriesIndex[name]

    if (series) {
      series.setActive(target.checked)

      this.updateYExtremes(this.navigation)
      this.updateYExtremes(this.graph)

      if (this.graph.hasData()) {
        dom.hide(this.view.placeholder)
      } else {
        dom.show(this.view.placeholder)
      }
    }
  }

  showTooltip (e) {
    var pos = this.kinetic.position(e).sub(this.kinetic.offset)
    if (!this.validate(pos) && this.graph.hasData()) {
      this.tooltip.show(pos.x)
    } else {
      this.hideTooltip()
    }
  }

  hideTooltip () {
    clearTimeout(this.longTap)
    this.longTap = null
    this.tooltip.hide()
  }

  navigate (pointers) {
    if (pointers.length === 1) {
      var [pointer] = pointers

      if (this.validate(pointer.startPosition)) {
        pointer.event.preventDefault()
        this.hideTooltip()
        this.drag(pointer.delta.x)
      } else if (this.longTap) {
        pointer.event.preventDefault()
        this.tooltip.show(pointer.position.x)
      } else {
        this.hideTooltip()
      }
    }
  }

  update (dt, time) {
    this.kinetic.digest(time)
    this.simulate(dt)
    this.renderer.redraw()
  }
}

export default Chart
