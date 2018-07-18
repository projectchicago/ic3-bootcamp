import "./table.css";

import * as _ from "lodash";

export class Table {

	constructor(){
		this.futures = [];
	}

	onCreatedGasFuture(data){

		var future = {
			blockCreated: data[0].toString(),
			startHeight: data[1].toString(),
			executeHeight: data[2].toString(),
			gasLimit: data[3].toString(),
			price: data[4].toString(),
			executionMessage: data[5],
			executionAddress: data[6],
		};

		this.insertRow(future);
		this.futures.push(future);
	}

	onNewBlock(block){

		this.blockNumberEl.textContent = block.number;

		var total = 0;
		for(var i = 0; i < this.futures.length; i++){
			if (this.futures[i].executeHeight > block.number){
				total++;
			}else{
				// TODO: remove row
			}
		}
		this.futuresNumber.textContent = total;

	}

	loadData(data) {

		const columnTitles = ["Block Created", "Start Height", "Execution Height", "Gas Limit", "Price", "Execution Message", "Execution Address"];
		this.columnHeadings = Object.keys(data[0]);
		this.columnCount = this.columnHeadings.length;
		const rowCount = data.length;

		var header = this.table.createTHead();
		var row = header.insertRow(-1);
		for (var i = 0; i < this.columnCount; i++) {
		    var headerCell = document.createElement('th');
		    headerCell.innerText = columnTitles[i].toUpperCase();
		    row.appendChild(headerCell);
		}

		// Create table body.
		var tBody = document.createElement('tbody');
		tBody.setAttribute("id", "main-table-body")
		this.table.appendChild(tBody);

		// Add the data rows to the table body.
		for (var i = 0; i < rowCount; i++) { // each row
		  row = tBody.insertRow(-1);
		  row.setAttribute('data-executionHeight', data[i]['executeHeight'])
			row.setAttribute('class', 'dataRow')

		  for (var j = 0; j < this.columnCount; j++) { // each column
		    var cell = row.insertCell(-1);
		    cell.setAttribute('data-label', this.columnHeadings[j].toUpperCase());
		    cell.innerText = data[i][this.columnHeadings[j]];
		  }
		}
	}

	updateColours(currentHeight){

		const table = document.getElementById('main-table');
		const rows = table.getElementsByClassName('dataRow');

		_.forEach(rows, (row) => {
			if (parseInt(row.getAttribute('data-executionHeight')) > currentHeight) {
				console.log(parseInt(row.getAttribute('data-executionHeight')))
				row.style.backgroundColor = 'maroon'
			}
		})
	}

	insertRow(data){

		const tableBody = document.getElementById('main-table-body');

		var row = tableBody.insertRow(0);

		row.setAttribute('data-executionHeight', data['executeHeight'])
		row.setAttribute('class', 'dataRow')

		for (var j = 0; j < this.columnCount; j++) {
	    	var cell = row.insertCell(-1);
	    	cell.setAttribute('data-label', this.columnHeadings[j].toUpperCase());
	    	cell.innerText = data[this.columnHeadings[j]];
		}
	}

	onLoad(){

		const data = _.times(31, (i) => {
			return {
				blockCreated: i,
				startHeight: i+100,
				executeHeight: i+1000,
				gasLimit: 1000000,
				price: _.random(1,100),
				executionMessage: "0x.....",
				executionAddress: "0x.....",
			}
		});
		this.loadData([{
			blockCreated: null,
			startHeight: null,
			executeHeight: null,
			gasLimit: null,
			price: null,
			executionMessage: null,
			executionAddress: null,
		}]);

	}

	createComponent(){

		var div = document.createElement('div');

		var blockNumberHeading = document.createElement('h2');
		blockNumberHeading.appendChild(document.createTextNode('Block Number: '));
		this.blockNumberEl = document.createElement('span');
		this.blockNumberEl.id = 'block-number';
		blockNumberHeading.appendChild(this.blockNumberEl);
		div.appendChild(blockNumberHeading);

		var futureOutstandingHeading = document.createElement('h2');
		futureOutstandingHeading.appendChild(document.createTextNode('Futures Outstanding: '));
		this.futuresNumber = document.createElement('span');
		this.futuresNumber.id = 'futures-number';
		futureOutstandingHeading.appendChild(this.futuresNumber);
		div.appendChild(futureOutstandingHeading);

		var dataList = document.createElement('div');
		dataList.id = "data-list";
		div.appendChild(dataList);
		
		if(!this.table){
			this.table = document.createElement('table');
			this.table.id = 'main-table';
			div.appendChild(this.table);
		}

		return div;

	}
}