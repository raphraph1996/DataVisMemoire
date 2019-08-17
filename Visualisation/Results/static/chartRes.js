// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 960 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var attr = 'resStat.csv'

export function drawChart(){

  // append the svg object to the body of the page
  var ggg = d3.select("#rescontainer")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
  var svg = ggg.append("g")
      .attr("id","chartG")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  $('#doc').click(function(){
   document.getElementById('tf').style.backgroundColor = ""
   document.getElementById('tot').style.backgroundColor = ""
   this.style.backgroundColor = "red";
   attr = 'resStat.csv';
   update();
  });
  $('#tf').click(function(){
   document.getElementById('doc').style.backgroundColor = ""
   document.getElementById('tot').style.backgroundColor = ""
   this.style.backgroundColor = "red";
   attr = 'tfStat.csv';
   update();
  });
  $('#tot').click(function(){
   document.getElementById('doc').style.backgroundColor = ""
   document.getElementById('tf').style.backgroundColor = ""
   this.style.backgroundColor = "red";
   attr = 'totStat.csv';
   update();
  });

  update()

  function update(){

    $("#chartG").empty()

    // Parse the Data
    d3.csv("/static/"+attr, function(data) {

      // List of subgroups = header of the csv files = soil condition here
      var subgroups = data.columns.slice(1)

      // List of groups = species here = value of the first column called group -> I show them on the X axis
      var groups = d3.map(data, function(d){return(d.group)}).keys()

      // Add X axis
      var x = d3.scaleBand()
          .domain(groups)
          .range([0, width-85])
          .padding([0.2])
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 100])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // color palette = one color per subgroup
      var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#2e8be8','#28af5a','#babc20','#932323','#451f49'])

      // Normalize the data -> sum of each group must be 100!
      console.log(data)
      var dataNormalized = []
      data.forEach(function(d){
        // Compute the total
        var tot = 0
        var i = 0
        for (i in subgroups){ name=subgroups[i] ; tot += +d[name] }
        // Now normalize
        for (i in subgroups){ name=subgroups[i] ; d[name] = d[name] / tot * 100}
      })

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack()
        .keys(subgroups)
        (data)

      // Show the bars
      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
          .attr("fill", function(d) { return color(d.key); })
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
              //console.log(d);
              var xPosition = d3.mouse(this)[0] - 5;
              var yPosition = d3.mouse(this)[1] - 5;
              tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
              tooltip.select("text").text(Math.round((d[1]-d[0])*100)/100+"%");
            })
        var legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
          .selectAll("g")
          .data(subgroups.slice().reverse())
          .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        var button = svg.append("button")
        .attr("x", width - 100)
        .attr("y",50)


        legend.append("rect")
            .attr("x", width - 100)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        legend.append("text")
            .attr("x", width -75)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .style("text-anchor","start")
            .text(function(d) { return d; });
    })
    var tooltip = ggg.append("g")
  .attr("class", "tooltip")
  .style("display", "none");

  tooltip.append("rect")
  .attr("width", 60)
  .attr("height", 20)
  .attr("fill", "white")
  .style("opacity", 0.5);

  tooltip.append("text")
  .attr("x", 30)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");
  }
}
