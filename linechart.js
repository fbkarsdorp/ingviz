// Lauren Fonteyn and Stefan Hartmann (2016) 

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 70, left: 50},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scale.ordinal()
    .domain(["E2", "E3", "L1", "L2"])
    .rangePoints([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(4);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var frequencyline = d3.svg.line()   
    // .interpolate("monotone") // turn on for interpolation of lines
    .x(function(d) { return x(d.period); })
    .y(function(d) { return y(d.frequency); });
    
// Adds the svg canvas
var svg = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("data.tsv", function(error, data) {
    data.forEach(function(d) {
        d.frequency = +d.frequency;
        d.active = true;
    });

    // Scale the range of the data
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    // Nest the entries by category
    var dataNest = d3.nest()
        .key(function(d) { return d.category; })
        .entries(data);

    var color = d3.scale.category10();   // set the colour scale

    legendSpace = width / dataNest.length; // spacing for the legend

    // Loop through each category / key
    dataNest.forEach(function(d, i) { 

        svg.append("path")
            .attr("class", "line")
            .style("stroke", function() { // Add the colours dynamically
                return d.color = color(d.key); })
            .attr("id", 'tag' + d.key.replace(/\s+/g, '')) // assign ID
            .attr("d", frequencyline(d.values));

        // Add the Legend
        svg.append("text")
            .attr("x", (legendSpace / 2) + i * legendSpace)  // space legend
            .attr("y", height + (margin.bottom / 2) + 5)
            .attr("class", "legend")    // style the legend
            .style("fill", function() { // Add the colours dynamically
                return d.color = color(d.key); })
            .on("click", function() {
                // Determine if current line is visible 
                var active = d.active ? false : true;
                d.active = active;
                updateData();
                })  
            .text(d.key); 
    });

function updateData() {

    y.domain([0, d3.max(dataNest, function(d) {
        return d.active ? 0 : d3.max(d.values, function(d) {return d.frequency;});
        })]);

    // Select the section we want to apply our changes to
    var svg = d3.select("body").transition();

    dataNest.forEach(function(d, i) {
        svg.select("#tag"+d.key.replace(/\s+/g, '')) 
            .duration(750)
            .attr("d", frequencyline(d.values))
            .style("opacity", d.active ? 0 : 1);
        })

    svg.select(".y.axis") // update the y axis
        .duration(750)
        .call(yAxis);
    }

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

});