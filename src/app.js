import Series from './series.js'
import Chart from './chart.js'
import View from './view.js'

var requestAnimationFrame = window.requestAnimationFrame

class App {
  constructor (element) {
    this.element = element
    this.charts = []
    this.views = []
    this.renderers = []
  }

  addChart (chart) {
    var view = new View(this.element, chart)
    this.charts.push(chart)
    this.views.push(view)
    view.render()
  }

  load () {
    var xhr = new window.XMLHttpRequest()
    xhr.open('GET', './data/chart_data.json')
    xhr.onload = () => {
      this.parse(JSON.parse(xhr.response))
      this.render()
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

  render () {

  }

  digest (t = 0) {
    requestAnimationFrame(t => this.digest(t))
  }
}

export default App
