import "./chart.css";

import * as d3 from "d3";
import * as _ from "lodash";

export class Chart {

	onCreatedGasFuture(data){
		// TODO: implement me
	}

	onLoad(){

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    	width = 1400 - margin.left - margin.right,
    	height = 500 - margin.top - margin.bottom;
	var x = d3.scaleLinear()
	    .range([0, width]);
	var y = d3.scaleLinear()
	    .range([height / 3, 0]);
	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y);
	const generateGraph = (svg, data, x, y, height) => {
	  data.forEach(function(d) {
	    d.saleValue = +d.saleValue;
	    d.blockHeight = +d.blockHeight;
	  });
	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("x", width)
	      .attr("y", -6)
	      .style("text-anchor", "end")
	      .text("Execution Block Height");
	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Initial Auction Price")
	  svg.selectAll(".bars_")
	      .data(data)
	    .enter().append("rect")
	      .attr("class", "bars_")
	      .attr("x", (d) => x(d.blockHeight))
	      .attr("y", (d) => y(d.saleValue))
	      .attr("width", 0.5)
	      .attr("height", (d) => height - y(d.saleValue))
	      .style("fill", (d) => "salmon");
	}

	const generateData = (count) => {
		// blockHeight,saleValue
		// 100,1000,10000
		const data1 = _.times(count, (i) => {
			return {
				blockHeight: 100 + i%count,
				saleValue: _.random(0.1, 10.0),
				issued: 0 + i%count,
				duration: 100
			}
		})
		const data2 = _.times(count, (i) => {
			return {
				blockHeight: 400 + i%count,
				saleValue: _.random(0.1, 10.0),
				issued: 0 + i%count,
				duration: 400
			}
		})
		const data3 = _.times(count, (i) => {
			return {
				blockHeight: 2200 + i%count,
				saleValue: _.random(0.1, 10.0),
				issued: 0 + i%count,
				duration: 2200
			}
		})
		return _.concat(data1, data2, data3);
	}

		var svg1 = d3.select("div.chart").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height/3 + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var svg2 = d3.select("div.chart").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height/3 + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var svg3 = d3.select("div.chart").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height/3 + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var data = generateData(1000);
		x.domain(d3.extent(data, function(d) { return d.blockHeight; })).nice();
		y.domain(d3.extent(data, function(d) { return d.saleValue; })).nice();
		generateGraph(svg1, _.filter(data, (d) => d.duration == 100), x, y, height / 3)
		generateGraph(svg2, _.filter(data, (d) => d.duration == 400), x, y, height / 3)
		generateGraph(svg3, _.filter(data, (d) => d.duration == 2200), x, y, height / 3)
	}

	createComponent(){

		var div = document.createElement('div');
		div.classList = ['chart'];

		return div;

	}
}