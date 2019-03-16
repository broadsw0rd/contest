import Series from './series.js'
import Graph from './graph.js'
import Chart from './chart.js'

class App {
  constructor (element) {
    this.element = element
    this.charts = []
    this.prevTime = 0
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
