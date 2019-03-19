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

  var Graph = function Graph () {
    this.xData = [];
    this.series = [];
    this.seriesIndex = {};
    this.xScale = new Scale();
    this.yScale = new Scale();
  };

  Graph.prototype.addSeries = function addSeries (series) {
    series.setChart(this);
    this.series.push(series);
    this.seriesIndex[series.name] = series;
  };

  Graph.prototype.setXData = function setXData (data) {
    this.xData = data;
  };

  var document$1 = window.document;

  var View = function View (root, graph) {
    this.root = root;
    this.el = document$1.createElement('div');
    this.graph = graph;
    this.render();
    this.canvas = this.el.querySelector('canvas');
  };

  View.prototype.render = function render () {
    var body = [
      "<div class=\"cell container\"><div class=\"graph\"><canvas></canvas></div></div>",
      this.graph.series.map(this.renderSeries, this).join('')
    ].join('');

    this.el.classList.add('chart');
    this.el.innerHTML = body;

    this.root.appendChild(this.el);
  };

  View.prototype.renderSeries = function renderSeries (series) {
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

      this.graph.yScale.setRange(this.height - navHeight, 0);
      this.navigation.yScale.setRange(this.height - 2, this.height - navHeight);

      this.graph.xScale.setRange(0, this.width - 2);
      this.navigation.xScale.setRange(0, this.width - 2);

      this.enqueue();
    }
  };

  Renderer.prototype.redraw = function redraw () {
    this.scale();
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
    var offset = navigation.offset;
    var range = navigation.range;
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
        ctx.moveTo(navXScale.get(xData[0]), navYScale.get(yData[0]));
      }

      for (var j = 1; j < xData.length; j++) {
        var xDatum = xData[j];
        ctx.lineTo(navXScale.get(xDatum), navYScale.get(yData[j]));

        if (start == null && xDatum >= offset) {
          start = j - 1;
        }

        if (end == null && xDatum >= offset + range) {
          end = j + 1;
        }
      }

      if (xData.length) {
        ctx.moveTo(xScale.get(xData[start]), yScale.get(yData[start]));
      }

      for (j = start + 1; j <= end; j++) {
        ctx.lineTo(xScale.get(xData[j]), yScale.get(yData[j]));
      }

      ctx.strokeStyle = current.color;
      ctx.stroke();
    }
  };

  Renderer.prototype.drawNav = function drawNav () {
    var ctx = this.ctx;
    var navigation = this.navigation;
    var xScale = navigation.xScale;
    var yScale = navigation.yScale;
    var offset = navigation.offset;
    var range = navigation.range;
    var x0 = xScale.get(offset);
    var x1 = xScale.get(offset + range);
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
    var navigation = this.navigation;
    var xScale = navigation.xScale;
    var yScale = navigation.yScale;
    var offset = navigation.offset;
    var range = navigation.range;
    var x0 = xScale.get(offset);
    var x1 = xScale.get(offset + range);
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

    var xData = graph.xData;
    var start = xData[0];
    var end = xData[xData.length - 1];
    var range = end - start;
    this.navigate(start + range / 2, range / 2);
    this.xScale.setDomain(start, end);

    var yDomain = graph.yScale.domain;
    this.yScale.setDomain(yDomain[0], yDomain[1]);
  };

  Navigation.prototype.navigate = function navigate (offset, range) {
    this.offset = offset;
    this.range = range;
    this.graph.xScale.setDomain(offset, offset + range);
    this.updateYExtremes();
  };

  Navigation.prototype.updateYExtremes = function updateYExtremes () {
    var series = this.graph.series;
    var xData = this.graph.xData;
    var start = this.offset;
    var end = start + this.range;
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
    var padding = range * 0.05;

    this.graph.yScale.setDomain(min - padding, max + padding);
  };

  var Chart = function Chart (element, graph) {
    this.graph = graph;
    this.navigation = new Navigation(graph);
    this.view = new View(element, graph);
    this.renderer = new Renderer(this.view.canvas, this.navigation);
    this.subscribe();

    this.offsetX = 0;
    this.prevX = 0;
  };

  Chart.prototype.subscribe = function subscribe () {
    this.view.el.addEventListener('change', this);
    this.view.canvas.addEventListener('mousedown', this);
    this.view.canvas.addEventListener('mouseup', this);
    this.view.canvas.addEventListener('touchstart', this);
    this.view.canvas.addEventListener('touchend', this);
  };

  Chart.prototype.tap = function tap (x, y) {
    var navigation = this.navigation;
    var xScale = navigation.xScale;
    var yScale = navigation.yScale;
    var ref = xScale.range;
      var x0 = ref[0];
      var x1 = ref[1];
    var ref$1 = yScale.range;
      var y1 = ref$1[0];
      var y0 = ref$1[1];
    var canvas = this.view.canvas;
    var offsetLeft = canvas.offsetLeft;
    var offsetTop = canvas.offsetTop;

    var x = x - offsetLeft;
    var y = y - offsetTop;

    this.offsetX = offsetLeft;

    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
      this.view.canvas.addEventListener('mousemove', this);
      this.view.canvas.addEventListener('touchmove', this);
      this.prevX = x;
    }
  };

  Chart.prototype.drag = function drag (x) {
    var navigation = this.navigation;
    var xScale = navigation.xScale;
    var xData = navigation.graph.xData;
    var delta = x - this.prevX;

    var cur = xScale.get(navigation.offset);
    var offset = xScale.invert(cur + delta);

    offset = Math.max(xData[0], offset);
    offset = Math.min(xData[xData.length - 1] - navigation.range, offset);

    navigation.navigate(offset, navigation.range);

    this.renderer.enqueue();
    this.prevX = x;
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
    this.tap(e.pageX, e.pageY);
  };

  Chart.prototype.handleMouseup = function handleMouseup (e) {
    this.view.canvas.removeEventListener('mousemove', this);
  };

  Chart.prototype.handleMousemove = function handleMousemove (e) {
    this.drag(e.pageX - this.offsetX);
  };

  Chart.prototype.handleTouchstart = function handleTouchstart (e) {
    var ref = e.targetTouches;
      var touch = ref[0];
    this.tap(touch.pageX, touch.pageY);
  };

  Chart.prototype.handleTouchmove = function handleTouchmove (e) {
    e.preventDefault();
    var ref = e.targetTouches;
      var touch = ref[0];
    this.drag(touch.pageX - this.offsetX);    
  };

  Chart.prototype.handleTouchend = function handleTouchend (e) {
    e.preventDefault();
    this.view.canvas.removeEventListener('touchmove', this);
  };

  Chart.prototype.redraw = function redraw (dt) {
    this.renderer.redraw();
  };

  var App = function App (element) {
    this.element = element;
    this.charts = [];
    this.prevTime = 0;
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
