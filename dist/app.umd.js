(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.app = factory());
}(this, function () { 'use strict';

  var Series = function Series (options) {
    if ( options === void 0 ) options = {};

    this.name = options.name || '';
    this.color = options.color || '#000';
    this.yData = options.yData || [];
    this.active = options.active || true;
    this.graph = options.graph || null;
  };

  Series.prototype.setActive = function setActive (active) {
    this.active = active;
  };

  Series.prototype.setChart = function setChart (graph) {
    this.graph = graph;
  };

  function normalize (x, a, b) {
    return (x - a) / (b - a)
  }

  function interpolate (a, b, t) {
    return a + (b - a) * t
  }

  var Scale = function Scale () {
    this.range = [];
    this.domain = [];
  };

  Scale.prototype.setRange = function setRange (from, to) {
    this.range = [from, to];
    return this
  };

  Scale.prototype.setDomain = function setDomain (from, to) {
    this.domain = [from, to];
    return this
  };

  Scale.prototype.get = function get (value) {
    var ref = this.domain;
      var d0 = ref[0];
      var d1 = ref[1];
    var ref$1 = this.range;
      var r0 = ref$1[0];
      var r1 = ref$1[1];

    var t = normalize(value, d0, d1);

    return interpolate(r0, r1, t)
  };

  Scale.prototype.invert = function invert (value) {
    var ref = this.domain;
      var d0 = ref[0];
      var d1 = ref[1];
    var ref$1 = this.range;
      var r0 = ref$1[0];
      var r1 = ref$1[1];

    var t = normalize(value, r0, r1);

    return interpolate(d0, d1, t)
  };

  var Vector = function Vector (x, y) {
    if ( x === void 0 ) x = 0;
    if ( y === void 0 ) y = 0;

    this.x = x;
    this.y = y;
  };

  Vector.sub = function sub (v1, v2) {
    return v1.clone().sub(v2)
  };

  Vector.prototype.add = function add (vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this
  };

  Vector.prototype.sub = function sub (vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this
  };

  Vector.prototype.scale = function scale (factor) {
    this.x *= factor;
    this.y *= factor;
    return this
  };

  Vector.prototype.zero = function zero () {
    this.x = 0;
    this.y = 0;
    return this
  };

  Vector.prototype.mag = function mag () {
    return this.x * this.x + this.y * this.y
  };

  Vector.prototype.clone = function clone () {
    return new Vector(this.x, this.y)
  };

  Vector.prototype.lerp = function lerp (vector, t) {
    var x = (1 - t) * this.x + t * vector.x;
    var y = (1 - t) * this.y + t * vector.y;
    return new Vector(x, y)
  };

  var Point = function Point (x, y) {
    this.position = new Vector(x, y);
    this.target = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.active = false;
  };

  Point.prototype.accelerate = function accelerate (target) {
    this.target = target;
    this.velocity = Vector.sub(this.target, this.position);
    this.active = true;
  };

  Point.prototype.simulate = function simulate (dt) {
    if (!this.active) { return }

    var dist = Vector.sub(this.target, this.position);
    var velocity = this.velocity.clone();

    velocity.scale(dt / 200);

    if (dist.mag() < velocity.mag()) {
      this.velocity = dist;
      this.active = false;
    }

    this.position.add(velocity);
  };

  var Graph = function Graph () {
    this.xData = [];
    this.series = [];
    this.seriesIndex = {};
    this.xScale = new Scale();
    this.yScale = new Scale();
    this.min = new Point(0, 0);
    this.max = new Point(0, 0);
  };

  Graph.prototype.addSeries = function addSeries (series) {
    series.setChart(this);
    this.series.push(series);
    this.seriesIndex[series.name] = series;
  };

  Graph.prototype.setXData = function setXData (data) {
    this.xData = data;
  };

  Graph.prototype.hasData = function hasData () {
    return this.series.some(function (series) { return series.active; })
  };

  Graph.prototype.simulate = function simulate (dt) {
    var min = this.min;
    var max = this.max;

    min.simulate(dt);
    max.simulate(dt);

    this.xScale.setDomain(min.position.x, max.position.x);
    this.yScale.setDomain(min.position.y, max.position.y);
  };

  Graph.prototype.getYExtremes = function getYExtremes (start, end) {
    var series = this.series;
    var xData = this.xData;

    var min;
    var max;

    for (var i = 0; i < series.length; i++) {
      var current = series[i];

      if (!current.active) { continue }

      var yData = current.yData;

      for (var j = 0; j < xData.length; j++) {
        var xDatum = xData[j];

        if (start <= xDatum && xDatum <= end) {
          var yDatum = yData[j];

          min = min || yDatum;
          max = max || yDatum;

          if (yDatum < min) {
            min = yDatum;
          } else if (yDatum > max) {
            max = yDatum;
          }
        }
      }
    }

    min = min || 0;
    max = max || 0;

    var range = max - min;
    var padding = range * 0.2;

    max += padding;

    return [min, max]
  };

  Graph.prototype.findXIndex = function findXIndex (value) {
    var xData = this.xData;

    for (var i = 0; i < xData.length - 1; i++) {
      var low = xData[i];
      var high = xData[i + 1];
      if (value >= low && value <= high) {
        if (value - low < high - value) {
          return i
        } else {
          return i + 1
        }
      }
    }

    return -1
  };

  var document$1 = window.document;

  function create (name) {
    return document$1.createElement(name)
  }

  function select (el, selector) {
    return el.querySelector(selector)
  }

  function selectAll (el, selector) {
    return el.querySelectorAll(selector)
  }

  function append (root, el) {
    root.appendChild(el);
  }

  function addClass (el, name) {
    el.classList.add(name);
  }

  function removeClass (el, name) {
    el.classList.remove(name);
  }

  function html (el, content) {
    el.innerHTML = content;
  }

  function css (el, name, value) {
    el.style[name] = value;
  }

  function text (el, content) {
    el.textContent = content;
  }

  function show (el) {
    css(el, 'display', 'block');
  }

  function hide (el) {
    css(el, 'display', 'none');
  }

  function on (el, event, handler) {
    el.addEventListener(event, handler);
  }

  var View = function View (root, graph) {
    this.root = root;
    this.el = create('div');
    this.graph = graph;
    this.init();
    this.canvas = select(this.el, 'canvas');
    this.placeholder = select(this.el, '.placeholder');
  };

  View.prototype.init = function init () {
    var body = [
      "<div class=\"cell container\">",
      "<div class=\"graph\">",
      "<canvas></canvas>",
      "<div class=\"placeholder\">No data</div>",
      "</div>",
      "</div>",
      this.graph.series.map(this.initSeries, this).join('')
    ].join('');

    addClass(this.el, 'chart');
    addClass(this.el, 'cell');
    html(this.el, body);

    append(this.root, this.el);
  };

  View.prototype.initSeries = function initSeries (series) {
    return [
      "<div class=\"cell\">",
      "<label>",
      ("<input type=\"checkbox\" name=\"" + (series.name) + "\" checked/>"),
      ("<span class=\"icon\" style=\"color:" + (series.color) + "\"></span>"),
      ("<span class=\"text\">" + (series.name) + "</span>"),
      "</label>",
      "</div>"
    ].join('')
  };

  var DAYS = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];

  var MONTHS = [
    'Jan',
    'Fab',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  function format (time) {
    var date = new Date(time);
    return ((DAYS[date.getDay()]) + ", " + (MONTHS[date.getMonth()]) + " " + (date.getDate()))
  }

  function formatShort (time) {
    var date = new Date(time);
    return ((MONTHS[date.getMonth()]) + " " + (date.getDate()))
  }

  var DAY = 24 * 60 * 60 * 1000;

  var pixelRatio = window.devicePixelRatio || 1;

  var Renderer = function Renderer (canvas, navigation, theme) {
    this.ctx = canvas.getContext('2d');
    this.el = canvas.parentNode;
    this.navigation = navigation;
    this.graph = navigation.graph;
    this.setTheme(theme);
    this.scale();
  };

  Renderer.prototype.clear = function clear () {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  };

  Renderer.prototype.scale = function scale () {
    var width = this.el.clientWidth;
    var height = this.el.clientHeight;
    var canvas = this.ctx.canvas;
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;

      canvas.style.width = (this.width) + "px";
      canvas.style.height = (this.height) + "px";
      canvas.width = this.width * pixelRatio;
      canvas.height = this.height * pixelRatio;
      this.ctx.scale(pixelRatio, pixelRatio);
      this.ctx.translate(0.5, 0.5);

      var navHeight = this.height * 0.15;
      var xGridHeight = 40;

      this.graph.yScale.setRange(this.height - 2, this.height - navHeight);
      this.navigation.yScale.setRange(this.height - navHeight - xGridHeight, 0);

      this.graph.xScale.setRange(0, this.width - 2);
      this.navigation.xScale.setRange(0, this.width - 2);

      this.enqueue();
    }
  };

  Renderer.prototype.redraw = function redraw () {
    if (this.inQueue) {
      this.clear();
      this.draw();
    }
  };

  Renderer.prototype.enqueue = function enqueue () {
    this.inQueue = true;
  };

  Renderer.prototype.dequeue = function dequeue () {
    this.inQueue = false;
  };

  Renderer.prototype.setTheme = function setTheme (theme) {
    this.theme = theme;
    this.enqueue();
  };

  Renderer.prototype.draw = function draw () {
    if (this.graph.hasData()) {
      this.drawGrid();
      this.drawNav();
      this.drawSeries();
      this.drawOverlay();
    }

    this.dequeue();
  };

  Renderer.prototype.drawGrid = function drawGrid () {
    var ctx = this.ctx;
    var width = this.width;
    var graph = this.graph;
    var navigation = this.navigation;
    var xData = graph.xData;
    var xScale = navigation.xScale;
    var yScale = navigation.yScale;
    var y = graph.yScale.range[1] - 20;
    var ref = xScale.domain;
      var start = ref[0];
      var end = ref[1];

    var range = Math.floor((end - start) / 5);
    var count = Math.floor(range / DAY);

    if (count % 2) {
      count += 1;
    }

    ctx.fillStyle = this.theme.gridTextColor;
    ctx.textBaseline = 'middle';
    ctx.font = '14px Tahoma, Helvetica, sans-serif';

    for (var i = 0; i < xData.length; i += 2) {
      var datum = xData[i];

      if (!(start <= datum && datum <= end)) {
        continue
      }

      if (i % count !== 0) {
        continue
      }

      var align = 'center';

      if (i === 0) {
        align = 'left';
      } else if (i === xData.length - 1) {
        align = 'right';
      }

      ctx.textAlign = align;
      ctx.fillText(formatShort(datum), xScale.get(datum), y);
    }
  };

  Renderer.prototype.drawSeries = function drawSeries () {
    var ctx = this.ctx;
    var graph = this.graph;
    var navigation = this.navigation;
    var min = navigation.min.position.x;
    var max = navigation.max.position.x;
    var series = graph.series;
    var xData = graph.xData;
    var xScale = graph.xScale;
    var yScale = graph.yScale;
    var navXScale = navigation.xScale;
    var navYScale = navigation.yScale;
    var start;
    var end;

    for (var i = 0; i < series.length; i++) {
      var current = series[i];
      var opaque = true;

      if (!current.active) { continue }

      var yData = current.yData;

      if (xData.length) {
        ctx.beginPath();
        ctx.moveTo(xScale.get(xData[0]), yScale.get(yData[0]));
      }

      for (var j = 1; j < xData.length; j++) {
        var xDatum = xData[j];
        var yDatum = yData[j];

        if (yDatum < yScale.domain[0] || yDatum > yScale.domain[1]) {
          opaque = false;
        }

        ctx.lineTo(xScale.get(xDatum), yScale.get(yDatum));

        if (start == null && xDatum >= min) {
          start = j - 1;
        }

        if (end == null && xDatum >= max) {
          end = j + 1;
        }
      }

      if (xData.length) {
        ctx.moveTo(navXScale.get(xData[start]), navYScale.get(yData[start]));
      }

      for (j = start + 1; j <= end; j++) {
        ctx.lineTo(navXScale.get(xData[j]), navYScale.get(yData[j]));
      }

      ctx.globalAlpha = Number(opaque);
      ctx.strokeStyle = current.color;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  Renderer.prototype.drawNav = function drawNav () {
    var ctx = this.ctx;
    var graph = this.graph;
    var navigation = this.navigation;
    var xScale = graph.xScale;
    var yScale = graph.yScale;
    var min = navigation.min.position.x;
    var max = navigation.max.position.x;
    var x0 = xScale.get(min);
    var x1 = xScale.get(max);
    var ref = yScale.range;
      var y1 = ref[0];
      var y0 = ref[1];
    var height = y1 - y0;

    // window
    ctx.strokeStyle = this.theme.navigationColor;
    ctx.lineWidth = 2;

    ctx.strokeRect(x0, y0 + 1, x1 - x0, height - 2);

    // handles
    ctx.fillStyle = this.theme.navigationColor;
    ctx.beginPath();
    ctx.rect(x0, y0, 6, height);
    ctx.rect(x1 - 6, y0, 6, height);
    ctx.fill();
  };

  Renderer.prototype.drawOverlay = function drawOverlay () {
    var ctx = this.ctx;
    var graph = this.graph;
    var navigation = this.navigation;
    var xScale = graph.xScale;
    var yScale = graph.yScale;
    var min = navigation.min.position.x;
    var max = navigation.max.position.x;
    var x0 = xScale.get(min);
    var x1 = xScale.get(max);
    var ref = yScale.range;
      var y1 = ref[0];
      var y0 = ref[1];
    var height = y1 - y0;

    ctx.fillStyle = this.theme.overlayColor;
    ctx.beginPath();
    ctx.rect(0, y0, x0, height);
    ctx.rect(x1, y0, xScale.range[1] - x1, height);
    ctx.fill();
  };

  var Navigation = function Navigation (graph) {
    this.graph = graph;
    this.xScale = new Scale();
    this.yScale = new Scale();
    this.setExtremes();
  };

  Navigation.prototype.simulate = function simulate (dt) {
    var graph = this.graph;

    var min = this.min;
    var max = this.max;

    graph.simulate(dt);

    min.simulate(dt);
    max.simulate(dt);

    this.xScale.setDomain(min.position.x, max.position.x);
    this.yScale.setDomain(min.position.y, max.position.y);
  };

  Navigation.prototype.setExtremes = function setExtremes () {
    var xData = this.graph.xData;

    var minX = xData[ 0 ];
    var maxX = xData[ xData.length - 1 ];

    var ref = this.graph.getYExtremes(minX, maxX);
      var minY = ref[0];
      var maxY = ref[1];

    this.min = new Point(minX, minY);
    this.max = new Point(maxX, maxY);

    this.graph.min = new Point(minX, minY);
    this.graph.max = new Point(maxX, maxY);

    this.simulate(0);
  };

  var Tooltip = function Tooltip (root, navigation) {
    this.root = root;
    this.el = create('div');
    this.navigation = navigation;
    this.idx = 0;
    this.dots = {};
    this.values = {};
    this.items = {};
    this.body = null;
    this.date = null;
    this.hide();
    this.init();
  };

  Tooltip.prototype.init = function init () {
    var series = this.navigation.graph.series;
    var body = [
      "<div class=\"body cell\">",
      "<div class=\"date\"></div>",
      "<div class=\"series\">",
      series.map(this.initSeries, this).join(''),
      "</div>",
      "</div>",
      series.map(this.initDot, this).join('')
    ].join('');

    addClass(this.el, 'tooltip');
    html(this.el, body);

    append(this.root, this.el);

    this.collect();
    this.render();
  };

  Tooltip.prototype.initSeries = function initSeries (series) {
    return [
      ("<div class=\"item\" id=\"" + (series.name) + "\" style=\"color:" + (series.color) + "\">"),
      ("<div class=\"value\" id=\"" + (series.name) + "\"></div>"),
      ("<div class=\"name\">" + (series.name) + "</div>"),
      "</div>"
    ].join('')
  };

  Tooltip.prototype.initDot = function initDot (series) {
    return ("<div class=\"dot\" id=\"" + (series.name) + "\" style=\"color:" + (series.color) + "\"></div>")
  };

  Tooltip.prototype.collect = function collect () {
    var items = selectAll(this.el, '.item');
    var values = selectAll(this.el, '.value');
    var dots = selectAll(this.el, '.dot');

    for (var i = 0; i < items.length; i++) {
      this.items[items[i].id] = items[i];
      this.values[values[i].id] = values[i];
      this.dots[dots[i].id] = dots[i];
    }

    this.body = select(this.el, '.body');
    this.date = select(this.el, '.date');
  };

  Tooltip.prototype.render = function render () {
      var this$1 = this;

    var nav = this.navigation;
    var graph = nav.graph;
    var yScale = nav.yScale;
    var xData = graph.xData;

    graph.series.forEach(function (series) {
      this$1.renderSeries(series);
      this$1.renderDot(series);
    });
    this.renderDate();

    var xScale = nav.xScale;
    var width = this.body.clientWidth;
    var r1 = xScale.range[1];
    var offset = xScale.get(xData[this.idx]);
    var shift = -12;

    if (offset + width + shift > r1) {
      shift = r1 - offset - width + 16;
    } else if (offset + shift < -16) {
      shift = offset - 16;
    }

    css(this.body, 'transform', ("translate(" + shift + "px)"));

    css(this.el, 'transform', ("translate(" + offset + "px)"));
    css(this.el, 'height', ((yScale.range[0] - yScale.range[1]) + "px"));
  };

  Tooltip.prototype.renderDate = function renderDate () {
    text(this.date, format(this.navigation.graph.xData[this.idx]));
  };

  Tooltip.prototype.renderSeries = function renderSeries (series) {
    var item = this.items[series.name];

    if (series.active) {
      show(item);
    } else {
      hide(item);
    }

    text(this.values[series.name], series.yData[this.idx].toLocaleString());
  };

  Tooltip.prototype.renderDot = function renderDot (series) {
    var navigation = this.navigation;
    var yScale = navigation.yScale;
    var value = series.yData[this.idx];
    var dot = this.dots[series.name];

    if (series.active) {
      show(dot);
    } else {
      hide(dot);
    }

    css(dot, 'transform', ("translateY(" + (yScale.get(value)) + "px)"));
  };

  Tooltip.prototype.setIndex = function setIndex (idx) {
    this.idx = idx;
    this.render();
  };

  Tooltip.prototype.show = function show$1 (x) {
    var nav = this.navigation;
    var value = nav.xScale.invert(x);
    var idx = nav.graph.findXIndex(value);

    if (idx !== -1) {
      show(this.el);
      this.setIndex(idx);
    }
  };

  Tooltip.prototype.hide = function hide$1 () {
    hide(this.el);
  };

  var TRACK_THRESHOLD = 100;

  var Pointer = function Pointer (id) {
    this.id = id;
    this.position = new Vector(0, 0);
    this.delta = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.amplitude = new Vector(0, 0);
    this.startPosition = new Vector(0, 0);
    this.pressed = false;
    this.activated = false;
    this.swiped = false;
    this.timestamp = 0;
    this.trackTime = 0;
    this.elapsed = 0;
    this.event = null;
  };

  Pointer.prototype.tap = function tap (position, e) {
    this.velocity = new Vector(0, 0);
    this.amplitude = new Vector(0, 0);
    this.startPosition = position;
    this.timestamp = 0;
    this.trackTime = 0;
    this.elapsed = 0;
    this.pressed = true;
    this.swiped = false;
    this.event = e;
  };

  Pointer.prototype.drag = function drag (position, e) {
    this.position = position;
    this.delta.add(this.position.clone().sub(this.startPosition));
    this.startPosition = this.position;
    this.activated = true;
    this.event = e;
  };

  Pointer.prototype.launch = function launch (velocityThreshold, amplitudeFactor) {
    if (this.velocity.mag() > velocityThreshold) {
      this.amplitude = this.velocity.scale(amplitudeFactor);
      this.swiped = true;
    }
    this.pressed = false;
    this.trackTime = 0;
  };

  Pointer.prototype.track = function track (time, movingAvarageFilter) {
    this.timestamp = this.timestamp || time;
    this.trackTime = this.trackTime || time;
    if (time - this.trackTime >= TRACK_THRESHOLD) {
      this.elapsed = time - this.timestamp;
      this.timestamp = time;
      this.trackTime = 0;

      var v = this.delta.clone().scale(movingAvarageFilter).scale(1 / (1 + this.elapsed));
      this.velocity = v.lerp(this.velocity, 0.2);
    }
  };

  Pointer.prototype.swipe = function swipe (time, decelerationRate, deltaThreshold) {
    this.elapsed = time - this.timestamp;
    this.delta = this.amplitude.clone().scale(Math.exp(-this.elapsed / decelerationRate));
    if (this.delta.mag() > deltaThreshold) {
      this.activated = true;
    } else {
      this.swiped = false;
    }
  };

  Pointer.prototype.deactivate = function deactivate () {
    this.delta.zero();
    this.activated = false;
  };

  // iOS decelerationRate = normal
  var DECELERATION_RATE = 325;
  var VELOCITY_THRESHOLD = 100;
  var AMPLITUDE_FACTOR = 0.8;
  var DELTA_THRESHOLD = 0.5;
  var MOVING_AVARAGE_FILTER = 200;

  function activated (pointer) {
    return pointer.activated
  }

  function pressed (pointer) {
    return pointer.pressed
  }

  function alive (pointer) {
    return pointer.activated || pointer.pressed
  }

  var mouseEventId = -1;

  var Kinetic = function Kinetic (el) {
    this.el = el;

    this.pointers = [];
    this.events = [];

    this.swiped = false;
    this.offset = new Vector(0, 0);

    this.handleEvents();
  };

  Kinetic.prototype.position = function position (e) {
    return new Vector(e.clientX, e.clientY)
  };

  Kinetic.prototype.subscribe = function subscribe (handler) {
    this.events.push(handler);
  };

  Kinetic.prototype.unsubscribe = function unsubscribe (handler) {
    var idx = this.events.indexOf(handler);
    if (idx !== -1) {
      this.events.splice(idx, 1);
    }
  };

  Kinetic.prototype.track = function track (time) {
    for (var i = 0; i < this.pointers.length; i++) {
      var pointer = this.pointers[i];
      if (pointer.pressed) {
        pointer.track(time, MOVING_AVARAGE_FILTER);
      }
    }
  };

  Kinetic.prototype.notify = function notify () {
    for (var i = 0; i < this.events.length; i++) {
      var pointers = this.pointers.filter(activated);
      if (pointers.length) {
        this.events[i](pointers);
      }
    }
  };

  Kinetic.prototype.deactivate = function deactivate () {
    for (var i = 0; i < this.pointers.length; i++) {
      this.pointers[i].deactivate();
    }
  };

  Kinetic.prototype.swipe = function swipe (time) {
    for (var i = 0; i < this.pointers.length; i++) {
      var pointer = this.pointers[i];
      if (pointer.swiped) {
        pointer.swipe(time, DECELERATION_RATE, DELTA_THRESHOLD);
      }
    }
  };

  Kinetic.prototype.collect = function collect () {
    this.pointers = this.pointers.filter(alive);
  };

  Kinetic.prototype.digest = function digest (time) {
    this.track(time);
    this.notify();
    this.deactivate();
    this.swipe(time);
    this.collect();
  };

  Kinetic.prototype.find = function find (id) {
    var result = null;
    for (var i = 0; i < this.pointers.length; i++) {
      var pointer = this.pointers[i];
      if (pointer.id === id) {
        result = pointer;
      }
    }
    if (!result) {
      if (this.pointers.length === 1 && this.pointers[0].swiped) {
        result = this.pointers[0];
        result.id = id;
      }
    }
    return result
  };

  Kinetic.prototype.add = function add (pointer) {
    this.pointers.push(pointer);
  };

  Kinetic.prototype.handleEvents = function handleEvents () {
    on(this.el, 'mousedown', this);
    on(this.el, 'touchstart', this);
    on(this.el, 'touchmove', this);
    on(this.el, 'touchend', this);
    on(this.el, 'touchcancel', this);
  };

  Kinetic.prototype.handleEvent = function handleEvent (e) {
    switch (e.type) {
      case 'mousedown': return this.mousedownHandler(e)
      case 'mousemove': return this.mousemoveHandler(e)
      case 'mouseup': return this.mouseupHandler(e)
      case 'touchstart': return this.touchstartHandler(e)
      case 'touchmove': return this.touchmoveHandler(e)
      case 'touchend':
      case 'touchcancel': return this.touchendHandler(e)
    }
  };

  Kinetic.prototype.getId = function getId (e) {
    if (e.identifier) {
      return e.identifier
    } else {
      return mouseEventId
    }
  };

  Kinetic.prototype.updateOffset = function updateOffset () {
    var clientRect = this.el.getBoundingClientRect();
    this.offset = new Vector(clientRect.left, clientRect.top);
  };

  Kinetic.prototype.tap = function tap (e, event) {
    var id = this.getId(e);
    var pointer = this.find(id);
    if (!pointer) {
      pointer = new Pointer(id);
      this.add(pointer);
    }
    pointer.tap(this.position(e).sub(this.offset), event);

    this.ontap(pointer);
  };

  Kinetic.prototype.drag = function drag (e, event) {
    var position = this.position(e).sub(this.offset);
    var id = this.getId(e);
    var pointer = this.find(id);
    pointer.drag(position, event);
  };

  Kinetic.prototype.release = function release (e) {
    var id = this.getId(e);
    var pointer = this.find(id);
    pointer.launch(VELOCITY_THRESHOLD, AMPLITUDE_FACTOR);
  };

  Kinetic.prototype.mousedownHandler = function mousedownHandler (e) {
    document.addEventListener('mousemove', this, true);
    document.addEventListener('mouseup', this, true);

    this.tap(e, e);
  };

  Kinetic.prototype.mousemoveHandler = function mousemoveHandler (e) {
    if (e.type === 'mousemove' || this.pointers.filter(pressed).length) {
      this.drag(e, e);
    }
  };

  Kinetic.prototype.mouseupHandler = function mouseupHandler (e) {
    document.removeEventListener('mousemove', this, true);
    document.removeEventListener('mouseup', this, true);

    this.release(e);
  };

  Kinetic.prototype.touchstartHandler = function touchstartHandler (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      this.tap(e.changedTouches[i], e);
    }
  };

  Kinetic.prototype.touchmoveHandler = function touchmoveHandler (e) {
    for (var i = 0; i < e.targetTouches.length; i++) {
      this.drag(e.targetTouches[i], e);
    }
  };

  Kinetic.prototype.touchendHandler = function touchendHandler (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      this.release(e.changedTouches[i]);
    }
  };

  var METHOD_RESIZE_LEFT = 1;
  var METHOD_RESIZE_RIGHT = 2;
  var METHOD_DRAG = 3;
  var METHOD_MOVE = 4;

  var Chart = function Chart (element, graph) {
    this.graph = graph;
    this.navigation = new Navigation(graph);
    this.view = new View(element, graph);
    this.renderer = new Renderer(this.view.canvas, this.navigation);
    this.kinetic = new Kinetic(this.view.canvas);
    this.tooltip = new Tooltip(this.view.canvas.parentNode, this.navigation);

    this.subscribe();

    this.longTap = false;
    this.method = 0;
  };

  Chart.prototype.updateYExtremes = function updateYExtremes (ref) {
      var min = ref.min;
      var max = ref.max;

    var graph = this.graph;
    var ref$1 = [min.position.x, max.position.x];
      var x0 = ref$1[0];
      var x1 = ref$1[1];
    var ref$2 = graph.getYExtremes(x0, x1);
      var y0 = ref$2[0];
      var y1 = ref$2[1];

    min.accelerate(new Vector(x0, y0));
    max.accelerate(new Vector(x1, y1));
  };

  Chart.prototype.simulate = function simulate (dt) {
    var nav = this.navigation;
    nav.simulate(dt);
    if (nav.min.active || nav.max.active) {
      this.renderer.enqueue();
    }
  };

  Chart.prototype.validate = function validate (ref) {
      var x = ref.x;
      var y = ref.y;

    var graph = this.graph;
    var xScale = graph.xScale;
    var yScale = graph.yScale;
    var ref$1 = xScale.range;
      var x0 = ref$1[0];
      var x1 = ref$1[1];
    var ref$2 = yScale.range;
      var y1 = ref$2[0];
      var y0 = ref$2[1];

    return x >= x0 && x <= x1 && y >= y0 && y <= y1
  };

  Chart.prototype.tap = function tap (pointer) {
      var this$1 = this;

    if (this.validate(pointer.startPosition)) {
      pointer.event.preventDefault();
    } else {
      this.longTap = setTimeout(function () {
        pointer.event.preventDefault();
        this$1.tooltip.show(pointer.startPosition.x);
      }, 125);
    }

    var ref = pointer.startPosition;
      var x = ref.x;
    var navigation = this.navigation;
    var xScale = navigation.graph.xScale;
    var minPos = navigation.min.position;
    var maxPos = navigation.max.position;
    var start = xScale.get(minPos.x);
    var end = xScale.get(maxPos.x);

    if (Math.abs(start - x) < 20) {
      this.method = METHOD_RESIZE_LEFT;
    } else if (Math.abs(end - x) < 20) {
      this.method = METHOD_RESIZE_RIGHT;
    } else if (start < x && end > x) {
      this.method = METHOD_DRAG;
      this.range = maxPos.x - minPos.x;
    } else {
      this.method = METHOD_MOVE;
    }
  };

  Chart.prototype.drag = function drag (x) {
    var navigation = this.navigation;
    var xScale = navigation.graph.xScale;
    var ref = xScale.domain;
      var min = ref[0];
      var max = ref[1];
    var range = (max - min) * 0.1;
    var minPos = navigation.min.position;
    var maxPos = navigation.max.position;
    var start = xScale.get(minPos.x);
    var end = xScale.get(maxPos.x);
    var value;

    if (this.method === METHOD_DRAG) {
      value = xScale.invert(start + x);
      value = Math.max(min, Math.min(value, max - this.range));
      minPos.x = value;
      maxPos.x = value + this.range;
    } else if (this.method === METHOD_RESIZE_LEFT) {
      value = xScale.invert(start + x);
      value = Math.max(min, Math.min(maxPos.x - range, value));
      minPos.x = value;
    } else if (this.method === METHOD_RESIZE_RIGHT) {
      value = xScale.invert(end + x);
      value = Math.max(minPos.x + range, Math.min(max, value));
      maxPos.x = value;
    }

    this.updateYExtremes(this.navigation);
  };

  Chart.prototype.subscribe = function subscribe () {
    var canvas = this.view.canvas;

    on(this.view.el, 'change', this);
    on(canvas, 'mousemove', this);
    on(canvas, 'mouseleave', this);
    on(canvas, 'touchend', this);
    on(canvas, 'touchcancel', this);
    this.kinetic.subscribe(this.navigate.bind(this));
    this.kinetic.ontap = this.tap.bind(this);
  };

  Chart.prototype.handleEvent = function handleEvent (e) {
    switch (e.type) {
      case 'change': return this.handleChange(e)
      case 'mousemove': return this.showTooltip(e)
      case 'mouseleave':
      case 'touchend':
      case 'touchcancel': return this.hideTooltip(e)
    }
  };

  Chart.prototype.handleChange = function handleChange (e) {
    var target = e.target;
    var name = target.name;

    var series = this.graph.seriesIndex[name];

    if (series) {
      series.setActive(target.checked);

      this.updateYExtremes(this.navigation);
      this.updateYExtremes(this.graph);

      if (this.graph.hasData()) {
        hide(this.view.placeholder);
      } else {
        show(this.view.placeholder);
      }
    }
  };

  Chart.prototype.showTooltip = function showTooltip (e) {
    var pos = this.kinetic.position(e).sub(this.kinetic.offset);
    if (!this.validate(pos) && this.graph.hasData()) {
      this.tooltip.show(pos.x);
    } else {
      this.hideTooltip();
    }
  };

  Chart.prototype.hideTooltip = function hideTooltip () {
    clearTimeout(this.longTap);
    this.longTap = null;
    this.tooltip.hide();
  };

  Chart.prototype.navigate = function navigate (pointers) {
    if (pointers.length === 1) {
      var pointer = pointers[0];

      if (this.validate(pointer.startPosition)) {
        pointer.event.preventDefault();
        this.hideTooltip();
        this.drag(pointer.delta.x);
      } else if (this.longTap) {
        pointer.event.preventDefault();
        this.tooltip.show(pointer.position.x);
      } else {
        this.hideTooltip();
      }
    }
  };

  Chart.prototype.update = function update (dt, time) {
    this.kinetic.digest(time);
    this.simulate(dt);
    this.renderer.redraw();
  };

  var themes = [
    {
      gridTextColor: '#97a3ab',
      gridColor: '#f6f7f9',
      overlayColor: 'rgba(245, 249, 251, 0.8)',
      navigationColor: '#ddeaf3'
    },
    {
      gridTextColor: '#475768',
      gridColor: '#293544',
      overlayColor: 'rgba(31, 42, 56, 0.8)',
      navigationColor: '#3f556a'
    }
  ];

  var App = function App (element) {
    this.element = element;
    this.charts = [];
    this.prevTime = 0;
    this.switcher = select(this.element, '.switcher');
    this.theme = 0;

    this.subscribe();
  };

  App.prototype.addChart = function addChart (chart) {
    this.charts.push(chart);
    chart.renderer.setTheme(themes[this.theme]);
  };

  App.prototype.load = function load () {
      var this$1 = this;

    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', './data/chart_data.json');
    xhr.onload = function () {
      this$1.parse(JSON.parse(xhr.response));
    };
    xhr.send();
  };

  App.prototype.parse = function parse (response) {
      var this$1 = this;

    response.forEach(function (row) {
      var graph = new Graph();

      row.columns.forEach(function (col) {
        var id = col[0];
          var data = col.slice(1);

        if (row.types[id] === 'x') {
          graph.setXData(data);
        } else {
          var series = new Series({
            name: row.names[id],
            color: row.colors[id],
            yData: data
          });
          graph.addSeries(series);
        }
      });

      var chart = new Chart(this$1.element, graph);

      this$1.addChart(chart);
    });

    this.handleScroll();
    this.handleResize();
  };

  App.prototype.subscribe = function subscribe () {
    on(this.switcher, 'click', this);
    on(window.document.body, 'scroll', this);
    on(window, 'resize', this);
    on(window, 'orientationchange', this);
  };

  App.prototype.handleEvent = function handleEvent (e) {
    switch (e.type) {
      case 'click': return this.handlerColorSwitch()
      case 'scroll': return this.handleScroll(e)
      case 'resize': return this.handleResize(e)
      case 'orientationchange': return this.handleResize(e)
    }
  };

  App.prototype.handlerColorSwitch = function handlerColorSwitch () {
    this.theme = Number(!this.theme);

    if (this.theme) {
      addClass(this.element, 'dark');
    } else {
      removeClass(this.element, 'dark');
    }

    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].renderer.setTheme(themes[this.theme]);
    }
  };

  App.prototype.handleScroll = function handleScroll () {
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].kinetic.updateOffset();
    }
  };

  App.prototype.handleResize = function handleResize () {
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].renderer.scale();
    }
  };

  App.prototype.digest = function digest (time) {
    this.prevTime = this.prevTime || time;
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].update(time - this.prevTime, time);
    }
    this.prevTime = time;
  };

  var requestAnimationFrame = window.requestAnimationFrame;

  function loop (t) {
    app.digest(t);
    requestAnimationFrame(loop);
  }

  var element = document.getElementById('root');
  var app = new App(element);

  app.load();
  loop();

  return app;

}));
