import Vector from './vector.js'

class Point {
  constructor (x, y) {
    this.position = new Vector(x, y)
    this.previous = new Vector(x, y)
    this.acceleration = new Vector(0, 0)
  }

  accelerate (vector) {
    this.acceleration.add(vector)
  }

  simulate (dt) {
    this.acceleration.scale(dt * dt)

    var position = this.position
      .clone()
      .scale(2)
      .sub(this.previous)
      .add(this.acceleration)

    this.previous = this.position
    this.position = position
    this.acceleration.zero()
  }
}

export default Point
