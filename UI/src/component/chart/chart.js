import "./chart.css";

import * as d3 from "d3";
import * as _ from "lodash";

export class Chart {

	onLoad(){

		var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    	width = 1400 - margin.left - margin.right,
	    	height = 150 - margin.top - margin.bottom;
		var x = d3.scaleLinear() // OR scaleLinear
		    .range([0, width]);
		var y = d3.scaleLinear()
		    .range([height, 0]);
		var xAxis = d3.axisBottom(x);
		var yAxis = d3.axisLeft(y);
		var color = d3.scaleSequential(d3.interpolateRdYlBu).domain([15,0]); // Set to whatever the max price could be

		const day = 5760 // 24 hours
		const week = 40320 // 7 days
		const month = 175200 // ~ month
		const year = 2102400 // 365 days

		const generateGraph = (svg, data, x, y, height) => {
			x.domain(d3.extent(data, (d) => d.blockHeight)).nice();
			y.domain(d3.extent(data, (d) => d.saleValue)).nice();

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
		      .attr("width", 1)
		      .attr("height", (d) => height - y(d.saleValue))
		      .style("fill", (d) => color(d.saleValue));
		}

		const generateData = (count) => {
			const r = d3.randomLogNormal(0, 1)

			const data1 = _.times(count, (i) => {
				return {
					blockHeight: day + i%count,
					saleValue: _.min([r(), 15]),
					issued: 0 + i%count,
					duration: day
				}
			})
			const data2 = _.times(count, (i) => {
				return {
					blockHeight: week + i%count,
					saleValue: _.min([r(), 15]),
					issued: 0 + i%count,
					duration: week
				}
			})
			const data3 = _.times(count, (i) => {
				return {
					blockHeight: month + i%count,
					saleValue: _.min([r(), 15]),
					issued: 0 + i%count,
					duration: month
				}
			})
			const data4 = _.times(count, (i) => {
				return {
					blockHeight: year + i%count,
					saleValue: _.min([r(), 15]),
					issued: 0 + i%count,
					duration: year
				}
			})
			console.log(_.clone(data1))
			return _.concat(data1, data2, data3, data4);
		}

		var svg1 = d3.select("div.chart1").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var svg2 = d3.select("div.chart2").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var svg3 = d3.select("div.chart3").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var svg4 = d3.select("div.chart4").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var data = generateData(1000);

		generateGraph(svg1, _.filter(data, (d) => d.duration == day), x, y, height)
		generateGraph(svg2, _.filter(data, (d) => d.duration == week), x, y, height)
		generateGraph(svg3, _.filter(data, (d) => d.duration == month), x, y, height)
		generateGraph(svg4, _.filter(data, (d) => d.duration == year), x, y, height)
	}

	createComponent(){

		var div = document.createElement('div');
		div.classList = ['chart'];

		const generateChartDiv = (className, chartTitle) => {
			var chart = document.createElement('div');
			chart.classList = [className];
			var title = document.createElement('h1')
			title.textContent = chartTitle
			chart.appendChild(title)
			div.appendChild(chart);
		}

		generateChartDiv('chart1', 'Futures: 1 Day (5760 blocks)')
		generateChartDiv('chart2', 'Futures: 1 Week (40320 blocks)')
		generateChartDiv('chart3', 'Futures: 1 Month (175200 blocks)')
		generateChartDiv('chart4', 'Futures: 1 Year (2102400 blocks)')

		return div;

	}
}