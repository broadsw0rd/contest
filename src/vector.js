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

  mag () {
    return this.x * this.x + this.y * this.y
  }

  clone () {
    return new Vector(this.x, this.y)
  }
}

export default Vector
