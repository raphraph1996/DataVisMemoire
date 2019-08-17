import * as functions from './functions.js';

var minValue = "16 Mar 1900"
var maxValue = "16 Feb 3050"
var attr = "object_type"

var width = 450,height = 450,margin = 40;

var radius = Math.min(width, height) / 2 - margin;

export function drawPie() {

  var svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("id","pieSvg")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var legSvg = d3.select("#chart")
  .append("svg")
  .attr("width", 200)
  .attr("height", height)
  .append("g")
  .attr("id","legSvg")
  .attr("transform", "translate(" + 10 + "," + 100 + ")");

  $('#TypeButton').click(function(){
   document.getElementById('ContButton').style.backgroundColor = ""
   document.getElementById('EmbedButton').style.backgroundColor = ""
   this.style.backgroundColor = "red";
   attr = 'object_type';
   update();
  });
  $('#ContButton').click(function(){
   document.getElementById('TypeButton').style.backgroundColor = ""
   document.getElementById('EmbedButton').style.backgroundColor = ""
   this.style.backgroundColor = "red";
   attr = 'object_content_type';
   update();
  });
  $('#EmbedButton').click(function(){
   document.getElementById('ContButton').style.backgroundColor = ""
   document.getElementById('TypeButton').style.backgroundColor = ""
   this.style.backgroundColor = "red";
   attr = 'object_isembedpress';
   update();
  });

  update()
}

function update() {

  const queryParams = {
    'attr': attr,
    'dateFrom': minValue,
    'dateUntil':maxValue
  };
  const data = functions.getPie(queryParams);
  data.then(json =>{

    var color = d3.scaleOrdinal()
    .domain(Object.keys(json))
    .range(d3.schemeDark2);

    var pie = d3.pie()
    .value(function(d) {return d.value; })
    .sort(function(a, b) {return d3.ascending(a.key, b.key);} )
    var data_ready = pie(d3.entries(json));

    var u = d3.select('#pieSvg').selectAll("path")
    .data(data_ready)

    d3.select('#pieSvg').selectAll("text").remove()
    var v = d3.select('#pieSvg').selectAll("text")
    .data(data_ready)

    $('#legSvg').empty();

    var lsvg = d3.select('#legSvg').selectAll('g')
    .data(Object.keys(json))
    .enter()
    .append('g')
    .attr('class', 'chart-legend')
    .attr('transform', (d, j) => {
      return `translate(1,${j * 20 + 1})`;
    });

    lsvg.append('rect')
    .attr('x', 0)
    .attr('class', 'active')
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', (d) => {
      return color(d);
    });

    lsvg.append('text')
    .attr('x', 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text((d) => {
      return `${d}`;
    });

    var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

    u
    .enter()
    .append('path')
    .merge(u)
    .attr('d', arcGenerator)
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1)
    .transition()
    .duration(1000)

    v
    .enter()
    .append('text')
    .text(function(d){return Math.round(100*(100*d.data.value/Object.values(json).reduce((a, b) => a + b, 0)))/100+'%'})
    .transition()
    .duration(1000)
    .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
    .style("text-anchor", "middle")
    .style("font-size", 17)


  // remove the group that is not present anymore
    u
    .exit()
    .remove()
  });
}

export function allValues(min,max){
  minValue = min;
  maxValue = max;
  update();
}
