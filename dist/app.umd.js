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

  var Chart = function Chart (options) {
    if ( options === void 0 ) options = {};

    this.series = options.series || [];
    this.xData = options.xData || [];
  };

  Chart.prototype.addSeries = function addSeries (series) {
    this.series.push(series);
    series.setChart(this);
  };

  Chart.prototype.setXData = function setXData (data) {
    this.xData = data;
  };

  var App = function App (element) {
    this.element = element;
    this.charts = [];
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
    console.log(this);
  };

  App.prototype.addChart = function addChart (chart) {
    this.charts.push(chart);
  };

  App.prototype.digest = function digest () {

  };

  var element = document.getElementById('#root');
  var app = new App(element);

  app.load();
  app.digest();

}));
