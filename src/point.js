import Vector from './vector.js'

class Point {
  constructor (x, y) {
    this.position = new Vector(x, y)
    this.target = new Vector(x, y)
    this.velocity = new Vector(0, 0)
    this.active = false
  }

  accelerate (target) {
    this.target = target
    this.velocity = Vector.sub(this.target, this.position)
    this.active = true
  }

  simulate (dt) {
    if (!this.active) return

    if (this.position === this.target) {
      this.active = false
    } else {
      var dist = Vector.sub(this.target, this.position)
      var velocity = this.velocity.clone()

      velocity.scale(dt / 200)
      if (dist.mag() <= velocity.mag()) {
        this.position = this.target
      } else {
        this.position.add(velocity)
      }
    }
  }
}

export default Point
