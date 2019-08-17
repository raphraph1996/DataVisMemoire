import * as functions from './functions.js'
var def = {'object_provider':"All",'category':"All",'program_identifierstat':"All"}

var attr = ["object_provider","category","program_identifierstat"]
var representation = "object_desc"

var width = 450,height = 450,margin = 40;

var radius = Math.min(width, height) / 2 - margin;

var color = d3.scaleOrdinal()
.domain(['Original','Duplicates','NULL'])
.range(d3.schemeDark2);

export function drawTheDesc(){
  console.log(def)
  d3.select("#checkprov").on("change",function(d) {updateMenu(d3.select("#checkprov").property('value'))});
  d3.select("#checkcat").on("change",function(d) {updateMenu(d3.select("#checkcat").property('value'))});
  d3.select("#checkid").on("change",function(d) {updateMenu(d3.select("#checkid").property('value'))});
  updateMenu('None');

  function updateMenu(prop){
    $('#selectmenus').empty();
    const elements = functions.getElements();
    elements.then(json => {
      console.log(prop)
      d3.selectAll(".myCheckbox").each(function(d){
        var cb = d3.select(this);
        console.log(cb.property('value'))

        if(cb.property("checked")){
          var select = d3.select('#selectmenus')
          .append('select')
          .attr('class','selectValue')
          .on('change',function(){
            def[cb.property('value')] = select.property('value');
            console.log(def)
            update();
            printTheStats();
          });

          var options = select
          .selectAll('option')
          .data(['All'].concat(json[cb.property("value")])).enter()
          .append('option')
          .text(function (d) { return d;});
          if (cb.property('value') != prop ){
            select.property('value',def[cb.property('value')]);
          }
        } else if (cb.property('value') == prop) {
          def[cb.property('value')] = 'All';
          update();
          printTheStats();
        }
      });
    });
  }

  $('#TitleButton').click(function(){
    document.getElementById('DescButton').style.backgroundColor = ""
    this.style.backgroundColor = "red"
    representation = 'object_title';
    update()
    printTheStats()
  });
  $('#DescButton').click(function(){
    document.getElementById('TitleButton').style.backgroundColor = ""
    this.style.backgroundColor = "red"
    representation = 'object_desc';
    update()
    printTheStats()
  });

  drawThePie();
}

function drawThePie(){

  var svg = d3.select("#descPie")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("id","thePieG")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var legSvg = d3.select("#descPie")
  .append("svg")
  .attr("width", 200)
  .attr("height", height)
  .append("g")
  .attr("id","legendDesc")
  .attr("transform", "translate(" + 10 + "," + 100 + ")");

  var lsvg = legSvg.selectAll('g')
  .data(['Original','Duplicates','NULL'])
  .enter()
  .append('g')
  .attr('class', 'descPielegend')
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
  update()

  var svg2 = d3.select("#langPie")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("id","langPieG")
  .attr("transform", "translate(" + (width/2) + "," + (21+(height / 2)) + ")");

  var legSvg2 = d3.select("#langPie")
  .append("svg")
  .attr("width", 200)
  .attr("height", height)
  .append("g")
  .attr("id","legendLang")
  .attr("transform", "translate(" + 10 + "," + 121 + ")");

  var lsvg2 = legSvg2.selectAll('g')
  .data(['French','English','Dutch','Other'])
  .enter()
  .append('g')
  .attr('class', 'langPielegend')
  .attr('transform', (d, j) => {
    return `translate(1,${j * 20 + 1})`;
  });

  lsvg2.append('rect')
  .attr('x', 0)
  .attr('class', 'active')
  .attr('width', 18)
  .attr('height', 18)
  .style('fill', (d) => {
    return color(d);
  });

  lsvg2.append('text')
  .attr('x', 24)
  .attr('y', 9)
  .attr('dy', '.35em')
  .style('text-anchor', 'start')
  .text((d) => {
    return `${d}`;
  });

  var svg3 = d3.select("#stats").append("svg")
            .attr("width", width+200)
            .attr("height", height)
            .append("g")
            .attr("id","svgcstats")
            .attr("transform","translate(" + margin + "," + 30 + ")");

  printTheStats();
}

function update() {

  const queryParams = {
    'rep' : representation,
    'attr': attr,
    'val1' : def['object_provider'],
    'val2' : def['category'],
    'val3' : def['program_identifierstat']
  };
  const data = functions.getDescPie(queryParams);
  data.then(json =>{

    var pie = d3.pie()
    .value(function(d) {return d.value; })
    .sort(function(a, b) {return d3.ascending(a.key, b.key);} )
    var data_ready = pie(d3.entries(json));

    var u = d3.select("#thePieG").selectAll("path")
    .data(data_ready)

    d3.select("#thePieG").selectAll("text").remove()
    var v = d3.select("#thePieG").selectAll("text")
    .data(data_ready)

    var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

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

  });
}

function printTheStats(){

  const data = functions.getDescsStats({'val1' : def['object_provider'],'val2' : def['category'],'val3' : def['program_identifierstat'],'rep':representation});
  data.then(json =>{
    var langs = {'French':json['French'],'English':json['English'],'Dutch':json['Dutch'],'Other':json['Other']}

    var pie = d3.pie()
    .value(function(d) {return d.value; })
    .sort(function(a, b) {return d3.ascending(a.key, b.key);} )
    var data_ready = pie(d3.entries(langs));

    var u = d3.select("#langPieG").selectAll("path")
    .data(data_ready)

    d3.select("#langPieG").selectAll("text").remove()
    var v = d3.select("#langPieG").selectAll("text")
    .data(data_ready)

    var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

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
    .text(function(d){return Math.round(10000*d.data.value)/100+'%'})
    .transition()
    .duration(1000)
    .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
    .style("text-anchor", "middle")
    .style("font-size", 17)

    $("#svgcstats").empty();

    var stats = {'Hyperlinks':json['hyperlinks'],'Emails':json['emails'],'Phones':json['phones']}
    var nbs = {'Hyperlinks':json['hyperlinksNb'],'Emails':json['emailsNb'],'Phones':json['phoneNb']}
    var x = d3.scaleLinear()
              .range([0, width-50]);
    var y = d3.scaleBand()
              .range([height-50, 0])
              .padding(0.1);
    y.domain(d3.entries(stats).sort(function(a, b){return b.value-a.value}).map(function(d) {return d.key}));
    x.domain([0, d3.max(d3.entries(stats), function(d) { return d.value; })]);

    d3.select("#svgcstats").append("g")
    .attr("transform", "translate(20,0)")
    .call(d3.axisLeft(y));

    d3.select("#svgcstats").append("g")
    .attr("transform", "translate(20," + (height-50) + ")")
    .call(d3.axisBottom(x));

    const bars = d3.select("#svgcstats").selectAll()
    .data(d3.entries(stats))
    .enter().append("g");

    bars.append("rect")
    .attr("class", "bar")
    .attr("fill","steelblue")
    .attr("y", function(d) { return y(d.key)+5; })
    .attr("height", y.bandwidth()-10)
    .attr("x", function(d) { return 20; })
    .attr("width", function(d) { return x(d.value); })
    .on('mouseenter', function (actual, i) {
      d3.selectAll('.value2')
        .attr('opacity', 0)

      d3.select(this)
        .transition()
        .duration(300)
        .attr('opacity', 0.6)
        .attr('y', (a) => y(a.key))
        .attr('height', y.bandwidth())

      bars.append('text')
      .attr('class', 'divergence2')
      .attr('x', (a) => x(a.value)+25)
      .attr('y', (a) => y(a.key)+((y.bandwidth()-10)/2)+10)
      .attr('fill', 'red')
      .attr('text-anchor', 'right')
      .text((a, idx) => {
          if (a.value == actual.value){
            return `${Math.round(100*(nbs[actual.key]/actual.value))/100}`;
          }
          else{
           return '';
         }
      });

    })
    .on('mouseleave', function (actual, i) {
      d3.selectAll('.value2')
        .attr('opacity', 1);

      d3.select(this)
        .transition()
        .duration(300)
        .attr('opacity', 1)
        .attr("y", function(d) { return y(d.key)+5; })
        .attr("height", y.bandwidth()-10)


      d3.select("#svgcstats").selectAll('.divergence2').remove()
    });

    bars
    .append('text')
    .attr('class', 'value2')
    .attr('x', (a) => x(a.value)+25)
    .attr('y', (a) => y(a.key)+((y.bandwidth()-10)/2)+10)
    .attr('text-anchor', 'right')
    .text((a) => `${Math.round(10000*(a.value/json['tot']))/100}%`);

  });
}

export function allValues(min,max){
  // minValue=min;
  // maxValue=max;
  // update();
}
