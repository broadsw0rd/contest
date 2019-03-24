class Vector {
  static sub (v1, v2) {
    return v1.clone().sub(v2)
  }

  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  add (vector) {
    this.x += vector.x
    this.y += vector.y
    return this
  }

  sub (vector) {
    this.x -= vector.x
    this.y -= vector.y
    return this
  }

  scale (factor) {
    this.x *= factor
    this.y *= factor
    return this
  }

  zero () {
    this.x = 0
    this.y = 0
    return this
  }

  mag () {
    return this.x * this.x + this.y * this.y
  }

  clone () {
    return new Vector(this.x, this.y)
  }

  lerp (vector, t) {
    var x = (1 - t) * this.x + t * vector.x
    var y = (1 - t) * this.y + t * vector.y
    return new Vector(x, y)
  }
}

export default Vector
