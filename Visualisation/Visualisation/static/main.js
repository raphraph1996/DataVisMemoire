import * as functions from './functions.js';
import * as pie from './pie.js';
import * as timedChart from './timedChart.js';
import * as descriptive from './descriptive.js';

$(document).ready(()=>{

  timedChart.drawTimedChart()

  pie.drawPie()

  descriptive.drawTheDesc()

});
