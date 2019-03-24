import Series from './series.js'
import Graph from './graph.js'
import Chart from './chart.js'
import * as dom from './dom.js'
import themes from './themes.js'

class App {
  constructor (element) {
    this.element = element
    this.charts = []
    this.prevTime = 0
    this.switcher = dom.select(this.element, '.switcher')
    this.theme = 0

    this.subscribe()
  }

  addChart (chart) {
    this.charts.push(chart)
    chart.renderer.setTheme(themes[this.theme])
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
    dom.on(this.switcher, 'click', this)
    dom.on(window.document.body, 'scroll', this)
    dom.on(window, 'resize', this)
    dom.on(window, 'orientationchange', this)
  }

  handleEvent (e) {
    switch (e.type) {
      case 'click': return this.handlerColorSwitch()
      case 'scroll': return this.handleScroll(e)
      case 'resize': return this.handleResize(e)
      case 'orientationchange': return this.handleResize(e)
    }
  }

  handlerColorSwitch () {
    this.theme = Number(!this.theme)

    if (this.theme) {
      dom.addClass(this.element, 'dark')
    } else {
      dom.removeClass(this.element, 'dark')
    }

    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].renderer.setTheme(themes[this.theme])
    }
  }

  handleScroll () {
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].kinetic.updateOffset()
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
      this.charts[i].update(time - this.prevTime, time)
    }
    this.prevTime = time
  }
}

export default App
