import { Table } from './component/table/table.js';
import { Chart } from './component/chart/chart.js';

import './styles.css';

window.addEventListener('load',function(){
  c.onLoad();
  t.onLoad();
});

var c = new Chart();
var t = new Table();

document.body.appendChild(c.createComponent());
document.body.appendChild(t.createComponent());