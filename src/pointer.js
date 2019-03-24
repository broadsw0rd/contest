import Vector from './vector.js'

var TRACK_THRESHOLD = 100

class Pointer {
  constructor (id) {
    this.id = id
    this.position = new Vector(0, 0)
    this.delta = new Vector(0, 0)
    this.velocity = new Vector(0, 0)
    this.amplitude = new Vector(0, 0)
    this.startPosition = new Vector(0, 0)
    this.pressed = false
    this.activated = false
    this.swiped = false
    this.timestamp = 0
    this.trackTime = 0
    this.elapsed = 0
    this.event = null
  }

  tap (position, e) {
    this.velocity = new Vector(0, 0)
    this.amplitude = new Vector(0, 0)
    this.startPosition = position
    this.timestamp = 0
    this.trackTime = 0
    this.elapsed = 0
    this.pressed = true
    this.swiped = false
    this.event = e
  }

  drag (position, e) {
    this.position = position
    this.delta.add(this.position.clone().sub(this.startPosition))
    this.startPosition = this.position
    this.activated = true
    this.event = e
  }

  launch (velocityThreshold, amplitudeFactor) {
    if (this.velocity.mag() > velocityThreshold) {
      this.amplitude = this.velocity.scale(amplitudeFactor)
      this.swiped = true
    }
    this.pressed = false
    this.trackTime = 0
  }

  track (time, movingAvarageFilter) {
    this.timestamp = this.timestamp || time
    this.trackTime = this.trackTime || time
    if (time - this.trackTime >= TRACK_THRESHOLD) {
      this.elapsed = time - this.timestamp
      this.timestamp = time
      this.trackTime = 0

      var v = this.delta.clone().scale(movingAvarageFilter).scale(1 / (1 + this.elapsed))
      this.velocity = v.lerp(this.velocity, 0.2)
    }
  }

  swipe (time, decelerationRate, deltaThreshold) {
    this.elapsed = time - this.timestamp
    this.delta = this.amplitude.clone().scale(Math.exp(-this.elapsed / decelerationRate))
    if (this.delta.mag() > deltaThreshold) {
      this.activated = true
    } else {
      this.swiped = false
    }
  }

  deactivate () {
    this.delta.zero()
    this.activated = false
  }
}

export default Pointer
