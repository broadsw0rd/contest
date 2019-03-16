var pixelRatio = window.devicePixelRatio || 1

class Renderer {
  constructor (canvas, navigation) {
    this.ctx = canvas.getContext('2d')
    this.el = canvas.parentNode
    this.navigation = navigation
    this.graph = navigation.graph
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

      var navHeight = this.height * 0.1

      this.graph.yScale.setRange(this.height - navHeight, 0)
      this.navigation.yScale.setRange(this.height, this.height - navHeight)

      this.graph.xScale.setRange(0, this.width)
      this.navigation.xScale.setRange(0, this.width)

      this.enqueue()
    }
  }

  draw () {
    var graph = this.graph
    var navigation = this.navigation
    var series = graph.series
    var xData = graph.xData
    var xScale = graph.xScale
    var yScale = graph.yScale
    var navXScale = navigation.xScale
    var navYScale = navigation.yScale
    var ctx = this.ctx

    for (var i = 0; i < series.length; i++) {
      var current = series[i]

      if (!current.active) continue

      var yData = current.yData

      if (xData.length) {
        ctx.beginPath()
        ctx.moveTo(xScale.get(xData[0]), yScale.get(yData[0]))
      }

      for (var j = 1; j < xData.length; j++) {
        ctx.lineTo(xScale.get(xData[j]), yScale.get(yData[j]))
      }

      if (xData.length) {
        ctx.moveTo(navXScale.get(xData[0]), navYScale.get(yData[0]))
      }

      for (j = 1; j < xData.length; j++) {
        ctx.lineTo(navXScale.get(xData[j]), navYScale.get(yData[j]))
      }

      ctx.strokeStyle = current.color
      ctx.lineWidth = 2
      ctx.stroke()
    }

    this.dequeue()
  }

  redraw () {
    this.scale()
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
}

export default Renderer
