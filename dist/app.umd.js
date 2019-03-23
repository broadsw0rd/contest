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

  Vector.min = function min (v1, v2) {
    return v1.mag() < v2.mag() ? v1 : v2
  };

  Vector.max = function max (v1, v2) {
    return v1.mag() > v2.mag() ? v1 : v2
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

  var Point = function Point (x, y) {
    this.position = new Vector(x, y);
    this.previous = new Vector(x, y);
    this.acceleration = new Vector(0, 0);
  };

  Point.prototype.accelerate = function accelerate (vector) {
    this.acceleration.add(vector);
  };

  Point.prototype.simulate = function simulate (dt) {
    this.acceleration.scale(dt * dt);

    var position = this.position
      .clone()
      .scale(2)
      .sub(this.previous)
      .add(this.acceleration);

    this.previous = this.position;
    this.position = position;
    this.acceleration.zero();
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

        if (xDatum >= start && xDatum <= end) {
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

    var range = max - min;
    var padding = range * 0.1;

    min -= padding;
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
  };

  View.prototype.init = function init () {
    var body = [
      "<div class=\"cell container\"><div class=\"graph\"><canvas></canvas></div></div>",
      this.graph.series.map(this.initSeries, this).join('')
    ].join('');

    addClass(this.el, 'chart');
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

  var pixelRatio = window.devicePixelRatio || 1;

  var Renderer = function Renderer (canvas, navigation) {
    this.ctx = canvas.getContext('2d');
    this.el = canvas.parentNode;
    this.navigation = navigation;
    this.graph = navigation.graph;
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

      this.graph.yScale.setRange(this.height - 2, this.height - navHeight);
      this.navigation.yScale.setRange(this.height - navHeight, 0);

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

  Renderer.prototype.draw = function draw () {
    this.drawNav();
    this.drawSeries();
    this.drawOverlay();

    this.dequeue();
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

      if (!current.active) { continue }

      var yData = current.yData;

      if (xData.length) {
        ctx.beginPath();
        ctx.moveTo(xScale.get(xData[0]), yScale.get(yData[0]));
      }

      for (var j = 1; j < xData.length; j++) {
        var xDatum = xData[j];
        ctx.lineTo(xScale.get(xDatum), yScale.get(yData[j]));

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

      ctx.strokeStyle = current.color;
      ctx.stroke();
    }
  };

  Renderer.prototype.drawNav = function drawNav () {
    var ctx = this.ctx;
    var graph = this.graph;
    var xScale = graph.xScale;
    var yScale = graph.yScale;
    var min = graph.min.position.x;
    var max = graph.max.position.x;
    var x0 = xScale.get(min);
    var x1 = xScale.get(max);
    var ref = yScale.range;
      var y1 = ref[0];
      var y0 = ref[1];
    var height = y1 - y0;

    // window
    ctx.strokeStyle = '#ddeaf3';
    ctx.lineWidth = 2;

    ctx.strokeRect(x0, y0 + 1, x1 - x0, height - 2);

    // handles
    ctx.fillStyle = '#ddeaf3';
    ctx.beginPath();
    ctx.rect(x0, y0, 6, height);
    ctx.rect(x1 - 6, y0, 6, height);
    ctx.fill();
  };

  Renderer.prototype.drawOverlay = function drawOverlay () {
    var ctx = this.ctx;
    var graph = this.graph;
    var xScale = graph.xScale;
    var yScale = graph.yScale;
    var min = graph.min.position.x;
    var max = graph.max.position.x;
    var x0 = xScale.get(min);
    var x1 = xScale.get(max);
    var ref = yScale.range;
      var y1 = ref[0];
      var y0 = ref[1];
    var height = y1 - y0;

    ctx.fillStyle = 'rgba(245, 249, 251, 0.8)';
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

    this.graph.min = this.min = new Point(minX, minY);
    this.graph.max = this.max = new Point(maxX, maxY);

    this.simulate(0);
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
    var ref = xScale.range;
      var r0 = ref[0];
      var r1 = ref[1];
    var offset = xScale.get(xData[this.idx]);
    var shift = -12;

    if (offset + width + shift > r1) {
      shift = r1 - offset - width + 8;
    } else if (offset + shift < -8) {
      shift = offset - 8;
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

  var METHOD_RESIZE_LEFT = 1;
  var METHOD_RESIZE_RIGHT = 2;
  var METHOD_MOVE = 3;

  var Chart = function Chart (element, graph) {
    this.graph = graph;
    this.navigation = new Navigation(graph);
    this.view = new View(element, graph);
    this.renderer = new Renderer(this.view.canvas, this.navigation);
    this.tooltip = new Tooltip(this.view.canvas.parentNode, this.navigation);
    this.offset = new Vector(0, 0);
    this.subscribe();

    this.pressed = false;
    this.longTap = false;
    this.offsetX = 0;
    this.prevX = 0;
    this.method = 0;
  };

  Chart.prototype.updateOffset = function updateOffset () {
    var rect = this.view.canvas.getBoundingClientRect();
    this.offset.x = rect.left;
    this.offset.y = rect.top;
  };

  Chart.prototype.validate = function validate (x, y) {
    var graph = this.graph;
    var xScale = graph.xScale;
    var yScale = graph.yScale;
    var ref = xScale.range;
      var x0 = ref[0];
      var x1 = ref[1];
    var ref$1 = yScale.range;
      var y1 = ref$1[0];
      var y0 = ref$1[1];

    return x >= x0 && x <= x1 && y >= y0 && y <= y1
  };

  Chart.prototype.prepare = function prepare (x, y) {
    x = x - this.offset.x;
    y = y - this.offset.y;

    return { x: x, y: y }
  };

  Chart.prototype.tap = function tap (x) {
    var canvas = this.view.canvas;
    var navigation = this.navigation;
    var xScale = navigation.xScale;
    var start = xScale.get(navigation.offset);
    var end = xScale.get(navigation.offset + navigation.range);

    if (Math.abs(start - x) < 10) {
      this.method = METHOD_RESIZE_LEFT;
    } else if (Math.abs(end - x) < 10) {
      this.method = METHOD_RESIZE_RIGHT;
    } else {
      this.method = METHOD_MOVE;
    }
  };

  Chart.prototype.drag = function drag (x) {
    var navigation = this.navigation;
    var xScale = navigation.xScale;
    var delta = x - this.prevX;

    var start = xScale.get(navigation.offset);
    var offset = xScale.invert(start + delta);
    var diff = offset - navigation.offset;
    var range = navigation.range;

    if (this.method === METHOD_RESIZE_LEFT) {
      range = navigation.range - diff;
      navigation.navigate(offset, range);
    } else if (this.method === METHOD_RESIZE_RIGHT) {
      range = navigation.range + diff;
      navigation.resize(range);
    } else {
      navigation.move(offset);
    }

    this.renderer.enqueue();
    this.prevX = x;
  };

  Chart.prototype.subscribe = function subscribe () {
    var canvas = this.view.canvas;

    on(this.view.el, 'change', this);

    on(canvas, 'mousedown', this);
    on(canvas, 'mouseup', this);
    on(canvas, 'touchstart', this);
    on(canvas, 'touchend', this);
    on(canvas, 'mousemove', this);
    on(canvas, 'touchmove', this);
    on(canvas, 'mouseleave', this);
  };

  Chart.prototype.handleEvent = function handleEvent (e) {
    switch (e.type) {
      case 'change': return this.handleChange(e)
      case 'mousedown': return this.handleMousedown(e)
      case 'touchstart': return this.handleTouchstart(e)
      case 'mouseup': return this.handleMouseup(e)
      case 'touchmove': return this.handleTouchmove(e)
      case 'mousemove': return this.handleMousemove(e)
      case 'touchend':
      case 'touchcancel': return this.handleTouchend(e)
      case 'mouseleave': return this.handleMouseleave(e)
    }
  };

  Chart.prototype.handleChange = function handleChange (e) {
    var target = e.target;
    var name = target.name;

    var series = this.graph.seriesIndex[name];

    if (series) {
      series.setActive(target.checked);
      this.navigation.updateYExtremes();
      this.renderer.enqueue();
    }
  };

  Chart.prototype.handleMousedown = function handleMousedown (e) {
    var ref = this.prepare(e.pageX, e.pageY);
      var x = ref.x;
      var y = ref.y;

    if (this.validate(x, y)) {
      this.pressed = true;
      this.tap(x);
    }
  };

  Chart.prototype.handleMouseup = function handleMouseup (e) {
    this.pressed = false;
    // this.view.canvas.removeEventListener('mousemove', this)
  };

  Chart.prototype.handleMousemove = function handleMousemove (e) {
    var ref = this.prepare(e.pageX, e.pageY);
      var x = ref.x;
      var y = ref.y;

    if (this.validate(x, y)) {
      this.tooltip.hide();
      if (this.pressed) {
        this.drag(x);
      }
    } else {
      this.tooltip.show(x);
    }
  };

  Chart.prototype.handleTouchstart = function handleTouchstart (e) {
      var this$1 = this;

    var ref = e.targetTouches;
      var touch = ref[0];
    var ref$1 = this.prepare(touch.pageX, touch.pageY);
      var x = ref$1.x;
      var y = ref$1.y;

    if (this.validate(x, y)) {
      e.preventDefault();
      this.pressed = true;
      this.tap(x);
    } else {
      this.longTapTimeout = setTimeout(function () {
        this$1.longTap = true;
        this$1.tooltip.show(x);
      }, 125);
    }
  };

  Chart.prototype.handleTouchmove = function handleTouchmove (e) {
    var ref = e.targetTouches;
      var touch = ref[0];

    var ref$1 = this.prepare(e.pageX, e.pageY);
      var x = ref$1.x;
      var y = ref$1.y;

    if (this.pressed && this.validate(x, y)) {
      e.preventDefault();
      this.drag(x);
    } else if (this.longTap) {
      e.preventDefault();
      this.tooltip.show(x);
    }
  };

  Chart.prototype.handleTouchend = function handleTouchend (e) {
    e.preventDefault();
    this.pressed = false;
    this.longTap = false;
    clearTimeout(this.longTapTimeout);
    this.tooltip.hide();
  };

  Chart.prototype.handleMouseleave = function handleMouseleave (e) {
    this.tooltip.hide();
  };

  Chart.prototype.redraw = function redraw (dt) {
    this.navigation.simulate(dt);
    this.renderer.redraw();
  };

  var App = function App (element) {
    this.element = element;
    this.charts = [];
    this.prevTime = 0;

    this.subscribe();
  };

  App.prototype.addChart = function addChart (chart) {
    this.charts.push(chart);
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
    on(window.document.body, 'scroll', this);
    on(window, 'resize', this);
    on(window, 'orientationchange', this);
  };

  App.prototype.handleEvent = function handleEvent (e) {
    switch (e.type) {
      case 'scroll': return this.handleScroll(e)
      case 'resize': return this.handleResize(e)
      case 'orientationchange': return this.handleResize(e)
    }
  };

  App.prototype.handleScroll = function handleScroll () {
    for (var i = 0; i < this.charts.length; i++) {
      this.charts[i].updateOffset();
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
      this.charts[i].redraw(time - this.prevTime);
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
