import Scale from './scale.js'
import Vector from './vector.js'
import Point from './point.js'

class Navigation {
  constructor (graph) {
    this.graph = graph
    this.xScale = new Scale()
    this.yScale = new Scale()
    this.setExtremes()
  }

  simulate (dt) {
    var graph = this.graph

    var min = this.min
    var max = this.max

    graph.simulate(dt)

    min.simulate(dt)
    max.simulate(dt)

    this.xScale.setDomain(min.position.x, max.position.x)
    this.yScale.setDomain(min.position.y, max.position.y)
  }

  setExtremes () {
    var xData = this.graph.xData

    var minX = xData[ 0 ]
    var maxX = xData[ xData.length - 1 ]

    var [minY, maxY] = this.graph.getYExtremes(minX, maxX)

    this.min = new Point(minX, minY)
    this.max = new Point(maxX, maxY)

    this.graph.min = new Point(minX, minY)
    this.graph.max = new Point(maxX, maxY)

    this.simulate(0)
  }
}

export default Navigation
