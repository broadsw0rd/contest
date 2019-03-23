class Vector {
  static min (v1, v2) {
    return v1.mag() < v2.mag() ? v1 : v2
  }

  static max (v1, v2) {
    return v1.mag() > v2.mag() ? v1 : v2
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
}

export default Vector
