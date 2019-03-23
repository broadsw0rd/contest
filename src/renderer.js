var pixelRatio = window.devicePixelRatio || 1

class Renderer {
  constructor (canvas, navigation) {
    this.ctx = canvas.getContext('2d')
    this.el = canvas.parentNode
    this.navigation = navigation
    this.graph = navigation.graph
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

      this.graph.yScale.setRange(this.height - 2, this.height - navHeight)
      this.navigation.yScale.setRange(this.height - navHeight, 0)

      this.graph.xScale.setRange(0, this.width - 2)
      this.navigation.xScale.setRange(0, this.width - 2)

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

  draw () {
    this.drawNav()
    this.drawSeries()
    this.drawOverlay()

    this.dequeue()
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

      if (!current.active) continue

      var yData = current.yData

      if (xData.length) {
        ctx.beginPath()
        ctx.moveTo(xScale.get(xData[0]), yScale.get(yData[0]))
      }

      for (var j = 1; j < xData.length; j++) {
        var xDatum = xData[j]
        ctx.lineTo(xScale.get(xDatum), yScale.get(yData[j]))

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

      ctx.strokeStyle = current.color
      ctx.stroke()
    }
  }

  drawNav () {
    var ctx = this.ctx
    var graph = this.graph
    var xScale = graph.xScale
    var yScale = graph.yScale
    var min = graph.min.position.x
    var max = graph.max.position.x
    var x0 = xScale.get(min)
    var x1 = xScale.get(max)
    var [y1, y0] = yScale.range
    var height = y1 - y0

    // window
    ctx.strokeStyle = '#ddeaf3'
    ctx.lineWidth = 2

    ctx.strokeRect(x0, y0 + 1, x1 - x0, height - 2)

    // handles
    ctx.fillStyle = '#ddeaf3'
    ctx.beginPath()
    ctx.rect(x0, y0, 6, height)
    ctx.rect(x1 - 6, y0, 6, height)
    ctx.fill()
  }

  drawOverlay () {
    var ctx = this.ctx
    var graph = this.graph
    var xScale = graph.xScale
    var yScale = graph.yScale
    var min = graph.min.position.x
    var max = graph.max.position.x
    var x0 = xScale.get(min)
    var x1 = xScale.get(max)
    var [y1, y0] = yScale.range
    var height = y1 - y0

    ctx.fillStyle = 'rgba(245, 249, 251, 0.8)'
    ctx.beginPath()
    ctx.rect(0, y0, x0, height)
    ctx.rect(x1, y0, xScale.range[1] - x1, height)
    ctx.fill()
  }
}

export default Renderer
