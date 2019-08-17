import * as functions from './functions.js'
import * as descriptive from './descriptive.js'
import * as pie from './pie.js'

var minValue = "16 Mar 1900"
var maxValue = "16 Feb 3050"
var attr = "object_provider"

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1100 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

export function drawTimedChart(){
  $( function() {
    $("#fromDate").val(CanvasJS.formatDate(new Date(1900, 2, 16), "DD MMM YYYY"));
    $("#toDate").val(CanvasJS.formatDate(new Date(3050, 1, 16), "DD MMM YYYY"));
    $("#fromDate").datepicker({dateFormat: "d M yy"});
    $("#toDate").datepicker({dateFormat: "d M yy"});
    $("#allButton").click(function(){
      const data = functions.getLimitTimes();
      data.then(json => {
        $("#fromDate").val(json['min']);
        $("#toDate").val(json['max']);
        minValue = $( "#fromDate" ).val();
        maxValue = $ ( "#toDate" ).val();
        descriptive.allValues(minValue,maxValue);
        pie.allValues(minValue,maxValue);
        updateTheChart();
      });
    });
  });
  $("#date-selector").change( function() {
	minValue = $( "#fromDate" ).val();
  maxValue = $ ( "#toDate" ).val();
  attr = $("#value-select").val();
  descriptive.allValues(minValue,maxValue);
  pie.allValues(minValue,maxValue);
  updateTheChart();
  });

  var x = d3.scaleBand()
            .range([0, width-100])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height-100, 0]);

  var svg = d3.select("#time-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom)
            .append("g")
            .attr("id","svgchart")
            .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  function updateTheChart(){

    const queryParams = {
      'attr':attr,
      'dateFrom':minValue,
      'dateUntil':maxValue
    }

    const data = functions.getValueByTime(queryParams)
    data.then(json =>{
      $("#svgchart").empty()
      x.domain(d3.entries(json).sort(function(a, b){return b.value-a.value}).map(function(d) {return d.key}));
      y.domain([0, d3.max(d3.entries(json), function(d) { return d.value; })]);

      svg.append("g")
      .attr("transform", "translate(20," + (height-100) + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

      svg.append("g")
      .attr("transform", "translate(20,0)")
      .call(d3.axisLeft(y));

      svg.append('text')
      .attr('x', width / 4-margin.bottom)
      .attr('y', height)
      .attr('text-anchor', 'middle')
      .text('Top '+Object.keys(json).length+' '+attr+' for this period');

      svg.append('text')
      .attr('x', - ((height-100)/2))
      .attr('y', - margin.right)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Number of Records');

      const bars = svg.selectAll()
      .data(d3.entries(json))
      .enter().append("g");

      bars.append("rect")
      .attr("class", "bar")
      .attr("fill","steelblue")
      .attr("x", function(d) { return 25+x(d.key); })
      .attr("width", x.bandwidth()-10)
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height-100 - y(d.value); })
      .on('mouseenter', function (actual, i) {
        d3.selectAll('.value')
          .attr('opacity', 0)

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', 0.6)
          .attr('x', (a) => 25+x(a.key) - 5)
          .attr('width', x.bandwidth())

        const yac = y(actual.value)

        svg.append('line')
              .attr('id', 'limit')
              .attr('x1', 20)
              .attr('y1', yac)
              .attr('x2', width)
              .attr('y2', yac)
              .attr('stroke','red');

        bars.append('text')
        .attr('class', 'divergence')
        .attr('x', (a) => x(a.key) + (x.bandwidth()-10) / 2 + 25)
        .attr('y', (a) => y(a.value))
        .attr('fill', 'red')
        .attr('text-anchor', 'middle')
        .text((a, idx) => {
            const divergence = (a.value - actual.value)

             let text = ''
             if (divergence > 0) text += '+'
             text += `${divergence}`

             return idx !== i ? text : '';
        });

      })
      .on('mouseleave', function (actual, i) {
        d3.selectAll('.value')
          .attr('opacity', 1);

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', 1)
          .attr("x", function(d) { return 25+x(d.key); })
          .attr("width", x.bandwidth()-10)

        svg.selectAll('#limit').remove()
        svg.selectAll('.divergence').remove()
      })

      bars
      .append('text')
      .attr('class', 'value')
      .attr('x', (a) => x(a.key) + (x.bandwidth()-10) / 2 + 25)
      .attr('y', (a) => y(a.value))
      .attr('text-anchor', 'middle')
      .text((a) => `${a.value}`);

    });
  }
  updateTheChart();
}
