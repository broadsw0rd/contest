class Vector {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  add (vector) {
    this.x += vector.x
    this.y += vector.y
  }

  sub (vector) {
    this.x -= vector.x
    this.y -= vector.y
  }

  scale (factor) {
    this.x *= factor
    this.y *= factor
  }

  clone () {
    return new Vector(this.x, this.y)
  }
}

export default Vector
