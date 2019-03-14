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
    this.chart = options.chart || null;
  };

  Series.prototype.setActive = function setActive (active) {
    this.active = active;
  };

  Series.prototype.setChart = function setChart (chart) {
    this.chart = chart;
  };

  // https://github.com/d3/d3-scale

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

  var Chart = function Chart () {
    this.xData = [];
    this.series = [];
    this.seriesIndex = {};
    this.xScale = new Scale();
    this.yScale = new Scale();
  };

  Chart.prototype.addSeries = function addSeries (series) {
    series.setChart(this);
    this.series.push(series);
    this.seriesIndex[series.name] = series;
    this.updateYExremes(series);
  };

  Chart.prototype.setXData = function setXData (data) {
    this.xData = data;
    this.xScale.setDomain(data[0], data[data.length - 1]);
  };

  Chart.prototype.updateYExremes = function updateYExremes (series) {
    var yData = series.yData;
    var yScale = this.yScale;
    var min = yScale.domain[0];
    var max = yScale.domain[1];

    for (var i = 0; i < yData.length; i++) {
      var datum = yData[i];

      min = min || datum;
      max = max || datum;

      if (datum < min) {
        min = datum;
      } else if (datum > max ) {
        max = datum;
      }
    }

    yScale.setDomain(min, max);
  };

  var document$1 = window.document;

  var View = function View (root, chart) {
    this.root = root;
    this.el = document$1.createElement('div');
    this.chart = chart;
    this.render();
    this.canvas = this.el.querySelector('canvas');
  };

  View.prototype.render = function render () {
    var body = [
      "<div class=\"cell container\"><div class=\"canvas\"><canvas></canvas></div></div>",
      this.chart.series.map(this.renderSeries, this).join('')
    ].join('');

    this.el.classList.add('chart');
    this.el.innerHTML = body;

    this.root.appendChild(this.el);
  };

  View.prototype.renderSeries = function renderSeries (series) {
    return [
      "<div class=\"cell\">",
      "<label>",
      "<input type=\"checkbox\" checked/>",
      ("<span class=\"icon\" style=\"color:" + (series.color) + "\"></span>"),
      ("<span class=\"text\">" + (series.name) + "</span>"),
      "</label>",
      "</div>"
    ].join('')
  };

  var pixelRatio = window.devicePixelRatio || 1;

  var Renderer = function Renderer (canvas, chart) {
    this.ctx = canvas.getContext('2d');
    this.el = canvas.parentNode;
    this.chart = chart;
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

      this.chart.yScale.setRange(this.height, 0);
      this.chart.xScale.setRange(0, this.width);

      this.inQueue = true;
    }
  };

  Renderer.prototype.draw = function draw () {
    var chart = this.chart;
    var series = chart.series;
    var xData = chart.xData;
    var xScale = chart.xScale;
    var yScale = chart.yScale;
    var ctx = this.ctx;

    for (var i = 0; i < series.length; i++) {
      var current = series[i];
      var yData = current.yData;

      if (xData.length) {
        ctx.beginPath();
        ctx.moveTo(xScale.get(xData[0]), yScale.get(yData[0]));
      }

      for (var j = 1; j < xData.length; j++) {
        ctx.lineTo(xScale.get(xData[j]), yScale.get(yData[j]));
      }

      ctx.strokeStyle = current.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    this.inQueue = false;
  };

  Renderer.prototype.redraw = function redraw () {
    this.scale();
    if (this.inQueue) {
      this.clear();
      this.draw();
    }
  };

  var App = function App (element) {
    this.element = element;
    this.charts = [];
    this.views = [];
    this.renderers = [];
    this.prevTime = 0;
  };

  App.prototype.addChart = function addChart (chart) {
    var view = new View(this.element, chart);
    var renderer = new Renderer(view.canvas, chart);
    this.charts.push(chart);
    this.views.push(view);
    this.renderers.push(renderer);
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
      var chart = new Chart();

      row.columns.forEach(function (col) {
        var id = col[0];
          var data = col.slice(1);

        if (row.types[id] === 'x') {
          chart.setXData(data);
        } else {
          var series = new Series({
            name: row.names[id],
            color: row.colors[id],
            yData: data
          });
          chart.addSeries(series);
        }
      });

      this$1.addChart(chart);
    });
  };

  App.prototype.digest = function digest (time) {
    this.prevTime = this.prevTime || time;
    for (var i = 0; i < this.renderers.length; i++) {
      this.renderers[i].redraw(time - this.prevTime);
    }
    this.prevTime = time;
  };

  function loop (t) {
    app.digest(t);
    requestAnimationFrame(loop);
  }

  var requestAnimationFrame = window.requestAnimationFrame;
  var element = document.getElementById('root');
  var app = new App(element);

  app.load();
  loop();

  return app;

}));
