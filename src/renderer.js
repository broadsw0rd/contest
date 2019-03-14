var pixelRatio = window.devicePixelRatio || 1

class Renderer {
  constructor (canvas, chart) {
    this.ctx = canvas.getContext('2d')
    this.el = canvas.parentNode
    this.chart = chart
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

      this.chart.yScale.setRange(this.height, 0)
      this.chart.xScale.setRange(0, this.width)

      this.inQueue = true
    }
  }

  draw () {
    var chart = this.chart
    var series = chart.series
    var xData = chart.xData
    var xScale = chart.xScale
    var yScale = chart.yScale
    var ctx = this.ctx

    for (var i = 0; i < series.length; i++) {
      var current = series[i]
      var yData = current.yData

      if (xData.length) {
        ctx.beginPath()
        ctx.moveTo(xScale.get(xData[0]), yScale.get(yData[0]))
      }

      for (var j = 1; j < xData.length; j++) {
        ctx.lineTo(xScale.get(xData[j]), yScale.get(yData[j]))
      }

      ctx.strokeStyle = current.color
      ctx.lineWidth = 2
      ctx.stroke()
    }

    this.inQueue = false
  }

  redraw () {
    this.scale()
    if (this.inQueue) {
      this.clear()
      this.draw()
    }
  }
}

export default Renderer
