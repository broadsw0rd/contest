import * as date from './date.js'
import * as number from './number.js'

var pixelRatio = window.devicePixelRatio || 1

class Renderer {
  constructor (canvas, navigation, theme) {
    this.ctx = canvas.getContext('2d')
    this.el = canvas.parentNode
    this.navigation = navigation
    this.graph = navigation.graph
    this.setTheme(theme)
    this.scale()
  }

  clear () {
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.restore()
  }

  scale () {
    var width = this.el.clientWidth
    var height = this.el.clientHeight
    var canvas = this.ctx.canvas
    if (width !== this.width || height !== this.height) {
      this.width = width
      this.height = height

      canvas.style.width = `${this.width}px`
      canvas.style.height = `${this.height}px`
      canvas.width = this.width * pixelRatio
      canvas.height = this.height * pixelRatio
      this.ctx.scale(pixelRatio, pixelRatio)
      this.ctx.translate(0.5, 0.5)

      var navHeight = this.height * 0.15
      var xGridHeight = 40

      this.graph.yScale.setRange(this.height, this.height - navHeight)
      this.navigation.yScale.setRange(this.height - navHeight - xGridHeight, 0)

      this.graph.xScale.setRange(0, this.width)
      this.navigation.xScale.setRange(0, this.width)

      this.enqueue()
    }
  }

  redraw () {
    if (this.inQueue) {
      this.clear()
      this.draw()
    }
  }

  enqueue () {
    this.inQueue = true
  }

  dequeue () {
    this.inQueue = false
  }

  setTheme (theme) {
    this.theme = theme
    this.enqueue()
  }

  draw () {
    if (this.graph.hasData()) {
      this.drawGrid()
      this.drawNav()
      this.drawSeries()
      this.drawOverlay()
    }

    this.dequeue()
  }

  drawGrid () {
    var ctx = this.ctx
    var width = this.width
    var graph = this.graph
    var navigation = this.navigation
    var xData = graph.xData
    var xScale = navigation.xScale
    var yScale = navigation.yScale
    var y = graph.yScale.range[1] - 20
    var [start, end] = xScale.domain
    var divider = 6

    ctx.fillStyle = this.theme.gridTextColor
    ctx.textBaseline = 'middle'
    ctx.font = '12px Tahoma, Helvetica, sans-serif'

    if (width <= 480) {
      divider = 3
    }

    var range = Math.floor((end - start) / divider)
    var count = Math.floor(range / date.DAY)

    if (count % 2) {
      count += 1
    }

    for (var i = 0; i < xData.length; i += 2) {
      var datum = xData[i]

      if (!(start <= datum && datum <= end)) {
        continue
      }

      if (i % count !== 0) {
        continue
      }

      var align = 'center'

      if (i === 0) {
        align = 'left'
      } else if (i === xData.length - 1) {
        align = 'right'
      }

      ctx.textAlign = align
      ctx.fillText(date.formatShort(datum), xScale.get(datum), y)
    }

    var [min, max] = yScale.domain
    var step = Math.pow(10, Math.floor(max - min).toString().length - 1)

    if ((max - min) / step < 4) {
      step /= 2
    }

    var bot = yScale.range[0]

    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.beginPath()

    for (i = min - min % step; i < max; i += step) {
      var position = yScale.get(i)
      if (position < bot) {
        ctx.moveTo(0, position)
        ctx.lineTo(width, position)
        ctx.fillText(number.abbreviate(i), 0, position)
      }
    }

    ctx.lineWidth = 1
    ctx.strokeStyle = this.theme.gridColor
    ctx.stroke()

    ctx.beginPath()

    ctx.moveTo(0, bot)
    ctx.lineTo(width, bot)

    ctx.strokeStyle = this.theme.borderColor
    ctx.stroke()
  }

  drawSeries () {
    var ctx = this.ctx
    var graph = this.graph
    var navigation = this.navigation
    var min = navigation.min.position.x
    var max = navigation.max.position.x
    var series = graph.series
    var xData = graph.xData
    var xScale = graph.xScale
    var yScale = graph.yScale
    var navXScale = navigation.xScale
    var navYScale = navigation.yScale
    var start
    var end

    for (var i = 0; i < series.length; i++) {
      var current = series[i]
      var opaque = true

      if (!current.active) continue

      var yData = current.yData

      if (xData.length) {
        ctx.beginPath()
        ctx.moveTo(xScale.get(xData[0]), yScale.get(yData[0]))
      }

      for (var j = 1; j < xData.length; j++) {
        var xDatum = xData[j]
        var yDatum = yData[j]

        if (yDatum < yScale.domain[0] || yDatum > yScale.domain[1]) {
          opaque = false
        }

        ctx.lineTo(xScale.get(xDatum), yScale.get(yDatum))

        if (start == null && xDatum >= min) {
          start = j - 1
        }

        if (end == null && xDatum >= max) {
          end = j + 1
        }
      }

      if (xData.length) {
        ctx.moveTo(navXScale.get(xData[start]), navYScale.get(yData[start]))
      }

      for (j = start + 1; j <= end; j++) {
        ctx.lineTo(navXScale.get(xData[j]), navYScale.get(yData[j]))
      }

      ctx.globalAlpha = Number(opaque)
      ctx.lineJoin = 'round'
      ctx.strokeStyle = current.color
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  drawNav () {
    var ctx = this.ctx
    var graph = this.graph
    var navigation = this.navigation
    var xScale = graph.xScale
    var yScale = graph.yScale
    var min = navigation.min.position.x
    var max = navigation.max.position.x
    var x0 = xScale.get(min)
    var x1 = xScale.get(max)
    var [y1, y0] = yScale.range
    var height = y1 - y0

    // window
    ctx.strokeStyle = this.theme.navigationColor
    ctx.lineWidth = 2

    ctx.strokeRect(x0, y0 + 1, x1 - x0, height - 2)

    // handles
    ctx.fillStyle = this.theme.navigationColor
    ctx.beginPath()
    ctx.rect(x0, y0, 6, height)
    ctx.rect(x1 - 6, y0, 6, height)
    ctx.fill()
  }

  drawOverlay () {
    var ctx = this.ctx
    var graph = this.graph
    var navigation = this.navigation
    var xScale = graph.xScale
    var yScale = graph.yScale
    var min = navigation.min.position.x
    var max = navigation.max.position.x
    var x0 = xScale.get(min)
    var x1 = xScale.get(max)
    var [y1, y0] = yScale.range
    var height = y1 - y0

    ctx.fillStyle = this.theme.overlayColor
    ctx.beginPath()
    ctx.rect(0, y0, x0, height)
    ctx.rect(x1, y0, xScale.range[1] - x1, height)
    ctx.fill()
  }
}

export default Renderer
