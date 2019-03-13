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

  var View = function View (root, chart) {
    this.root = root;
    this.el = document$1.createElement('div');
    this.chart = chart;
    this.render();
    this.canvas = this.el.querySelector('canvas');
  };

  View.prototype.render = function render () {
    var body = [
      "<div class=\"cell canvas\"><canvas></canvas></div>",
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
