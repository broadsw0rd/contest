import Series from './series.js'
import Graph from './graph.js'
import Chart from './chart.js'
import * as dom from './dom.js'

class App {
  constructor (element) {
    this.element = element
    this.charts = []
    this.prevTime = 0

    this.subscribe()
  }

  addChart (chart) {
    this.charts.push(chart)
  }

  load () {
    var xhr = new window.XMLHttpRequest()
    xhr.open('GET', './data/chart_data.json')
    xhr.onload = () => {
      this.parse(JSON.parse(xhr.response))
    }
    xhr.send()
  }

  parse (response) {
    response.forEach(row => {
      var graph = new Graph()

      row.columns.forEach(col => {
        var [id, ...data] = col

        if (row.types[id] === 'x') {
          graph.setXData(data)
        } else {
          var series = new Series({
            name: row.names[id],
            color: row.colors[id],
            yData: data
          })
          graph.addSeries(series)
        }
      })

      var chart = new Chart(this.element, graph)

      this.addChart(chart)
    })

    this.handleScroll()
    this.handleResize()
  }

  subscribe () {
    dom.on(window.document.body, 'scroll', this)
    dom.on(window, 'resize', this)
    dom.on(window, 'orientationchange', this)
  }

  handleEvent (e) {
    switch (e.type) {
      case 'scroll': return this.handleScroll(e)
      case 'resize': return this.handleResize(e)
      case 'orientationchange': return this.handleResize(e)
    }
  }

  handleScroll () {
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].updateOffset()
    }
  }

  handleResize () {
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].renderer.scale()
    }
  }

  digest (time) {
    this.prevTime = this.prevTime || time
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].redraw(time - this.prevTime)
    }
    this.prevTime = time
  }
}

export default App
