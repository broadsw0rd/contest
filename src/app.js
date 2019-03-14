import Series from './series.js'
import Chart from './chart.js'
import View from './view.js'
import Renderer from './renderer.js'

class App {
  constructor (element) {
    this.element = element
    this.charts = []
    this.views = []
    this.renderers = []
    this.prevTime = 0
  }

  addChart (chart) {
    var view = new View(this.element, chart)
    var renderer = new Renderer(view.canvas, chart)
    this.charts.push(chart)
    this.views.push(view)
    this.renderers.push(renderer)
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
      var chart = new Chart()

      row.columns.forEach(col => {
        var [id, ...data] = col

        if (row.types[id] === 'x') {
          chart.setXData(data)
        } else {
          var series = new Series({
            name: row.names[id],
            color: row.colors[id],
            yData: data
          })
          chart.addSeries(series)
        }
      })

      this.addChart(chart)
    })
  }

  digest (time) {
    this.prevTime = this.prevTime || time
    for (var i = 0; i < this.renderers.length; i++) {
      this.renderers[i].redraw(time - this.prevTime)
    }
    this.prevTime = time
  }
}

export default App
