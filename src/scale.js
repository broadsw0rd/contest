function normalize (x, a, b) {
  return (x - a) / (b - a)
}

function interpolate (a, b, t) {
  return a + (b - a) * t
}

class Scale {
  constructor () {
    this.range = []
    this.domain = []
  }

  setRange (from, to) {
    this.range = [from, to]
    return this
  }

  setDomain (from, to) {
    this.domain = [from, to]
    return this
  }

  get (value) {
    var [d0, d1] = this.domain
    var [r0, r1] = this.range

    var t = normalize(value, d0, d1)

    return interpolate(r0, r1, t)
  }

  invert (value) {
    var [d0, d1] = this.domain
    var [r0, r1] = this.range

    var t = normalize(value, r0, r1)

    return interpolate(d0, d1, t)
  }
}

export default Scale
