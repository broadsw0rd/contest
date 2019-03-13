(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

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

  var Chart = function Chart () {
    this.xData = [];
    this.series = [];
    this.seriesIndex = {};
  };

  Chart.prototype.addSeries = function addSeries (series) {
    series.setChart(this);
    this.series.push(series);
    this.seriesIndex[series.name] = series;
  };

  Chart.prototype.setXData = function setXData (data) {
    this.xData = data;
  };

  var document$1 = window.document;

  var create = function (name) { return document$1.createElement(name); };

  var text = function (node, text) { return (node.textContent = text); };

  var append = function (node, child) { return node.appendChild(child); };

  var addClass = function (node, name) { return node.classList.add(name); };

  var style = function (node, name, value) { return (node.style[name] = value); };

  var attr = function (node, name, value) { return node.setAttribute(name, value); };

  var View = function View (root, chart) {
    this.root = root;
    this.el = create('div');
    this.canvas = create('canvas');
    this.chart = chart;
  };

  View.prototype.render = function render () {
    var container = create('div');
    addClass(container, 'cell');
    addClass(container, 'canvas');

    append(container, this.canvas);
    append(this.el, container);

    this.chart.series.forEach(this.renderSeries, this);

    addClass(this.el, 'chart');
    append(this.root, this.el);
  };

  View.prototype.renderSeries = function renderSeries (series) {
    var container = create('div');
    addClass(container, 'cell');

    var label = create('label');

    var input = create('input');
    attr(input, 'type', 'checkbox');
    input.checked = series.active;

    var icon = create('span');
    addClass(icon, 'icon');
    style(icon, 'color', series.color);

    var txt = create('span');
    addClass(txt, 'text');
    text(txt, series.name);

    append(container, label);
    append(label, input);
    append(label, icon);
    append(label, txt);

    append(this.el, container);
  };

  var requestAnimationFrame = window.requestAnimationFrame;

  var App = function App (element) {
    this.element = element;
    this.charts = [];
    this.views = [];
    this.renderers = [];
  };

  App.prototype.addChart = function addChart (chart) {
    var view = new View(this.element, chart);
    this.charts.push(chart);
    this.views.push(view);
    view.render();
  };

  App.prototype.load = function load () {
      var this$1 = this;

    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', './data/chart_data.json');
    xhr.onload = function () {
      this$1.parse(JSON.parse(xhr.response));
      this$1.render();
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

  App.prototype.render = function render () {

  };

  App.prototype.digest = function digest (t) {
      var this$1 = this;
      if ( t === void 0 ) t = 0;

    requestAnimationFrame(function (t) { return this$1.digest(t); });
  };

  var element = document.getElementById('root');
  var app = new App(element);

  app.load();
  app.digest();

}));
