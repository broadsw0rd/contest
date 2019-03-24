import Vector from './vector.js'
import Pointer from './pointer.js'
import * as dom from './dom.js'

// iOS decelerationRate = normal
const DECELERATION_RATE = 325
const VELOCITY_THRESHOLD = 100
const AMPLITUDE_FACTOR = 0.8
const DELTA_THRESHOLD = 0.5
const MOVING_AVARAGE_FILTER = 200

function activated (pointer) {
  return pointer.activated
}

function pressed (pointer) {
  return pointer.pressed
}

function alive (pointer) {
  return pointer.activated || pointer.pressed
}

var mouseEventId = -1

class Kinetic {
  constructor (el) {
    this.el = el

    this.pointers = []
    this.events = []

    this.swiped = false
    this.offset = new Vector(0, 0)

    this.handleEvents()
  }

  position (e) {
    return new Vector(e.clientX, e.clientY)
  }

  subscribe (handler) {
    this.events.push(handler)
  }

  unsubscribe (handler) {
    var idx = this.events.indexOf(handler)
    if (idx !== -1) {
      this.events.splice(idx, 1)
    }
  }

  track (time) {
    for (var i = 0; i < this.pointers.length; i++) {
      var pointer = this.pointers[i]
      if (pointer.pressed) {
        pointer.track(time, MOVING_AVARAGE_FILTER)
      }
    }
  }

  notify () {
    for (var i = 0; i < this.events.length; i++) {
      var pointers = this.pointers.filter(activated)
      if (pointers.length) {
        this.events[i](pointers)
      }
    }
  }

  deactivate () {
    for (var i = 0; i < this.pointers.length; i++) {
      this.pointers[i].deactivate()
    }
  }

  swipe (time) {
    for (var i = 0; i < this.pointers.length; i++) {
      var pointer = this.pointers[i]
      if (pointer.swiped) {
        pointer.swipe(time, DECELERATION_RATE, DELTA_THRESHOLD)
      }
    }
  }

  collect () {
    this.pointers = this.pointers.filter(alive)
  }

  digest (time) {
    this.track(time)
    this.notify()
    this.deactivate()
    this.swipe(time)
    this.collect()
  }

  find (id) {
    var result = null
    for (var i = 0; i < this.pointers.length; i++) {
      var pointer = this.pointers[i]
      if (pointer.id === id) {
        result = pointer
      }
    }
    if (!result) {
      if (this.pointers.length === 1 && this.pointers[0].swiped) {
        result = this.pointers[0]
        result.id = id
      }
    }
    return result
  }

  add (pointer) {
    this.pointers.push(pointer)
  }

  handleEvents () {
    dom.on(this.el, 'mousedown', this)
    dom.on(this.el, 'touchstart', this)
    dom.on(this.el, 'touchmove', this)
    dom.on(this.el, 'touchend', this)
    dom.on(this.el, 'touchcancel', this)
  }

  handleEvent (e) {
    switch (e.type) {
      case 'mousedown': return this.mousedownHandler(e)
      case 'mousemove': return this.mousemoveHandler(e)
      case 'mouseup': return this.mouseupHandler(e)
      case 'touchstart': return this.touchstartHandler(e)
      case 'touchmove': return this.touchmoveHandler(e)
      case 'touchend':
      case 'touchcancel': return this.touchendHandler(e)
    }
  }

  getId (e) {
    if (e.identifier) {
      return e.identifier
    } else {
      return mouseEventId
    }
  }

  updateOffset () {
    var clientRect = this.el.getBoundingClientRect()
    this.offset = new Vector(clientRect.left, clientRect.top)
  }

  tap (e, event) {
    var id = this.getId(e)
    var pointer = this.find(id)
    if (!pointer) {
      pointer = new Pointer(id)
      this.add(pointer)
    }
    pointer.tap(this.position(e).sub(this.offset), event)

    this.ontap(pointer)
  }

  drag (e, event) {
    var position = this.position(e).sub(this.offset)
    var id = this.getId(e)
    var pointer = this.find(id)
    pointer.drag(position, event)
  }

  release (e) {
    var id = this.getId(e)
    var pointer = this.find(id)
    pointer.launch(VELOCITY_THRESHOLD, AMPLITUDE_FACTOR)
  }

  mousedownHandler (e) {
    document.addEventListener('mousemove', this, true)
    document.addEventListener('mouseup', this, true)

    this.tap(e, e)
  }

  mousemoveHandler (e) {
    if (e.type === 'mousemove' || this.pointers.filter(pressed).length) {
      this.drag(e, e)
    }
  }

  mouseupHandler (e) {
    document.removeEventListener('mousemove', this, true)
    document.removeEventListener('mouseup', this, true)

    this.release(e)
  }

  touchstartHandler (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      this.tap(e.changedTouches[i], e)
    }
  }

  touchmoveHandler (e) {
    for (var i = 0; i < e.targetTouches.length; i++) {
      this.drag(e.targetTouches[i], e)
    }
  }

  touchendHandler (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      this.release(e.changedTouches[i])
    }
  }
}

export default Kinetic
