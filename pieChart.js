//Ernesto Garcia, Maddie Bustamante, Parker Hayes
//Oliver Otis Howard Final Project: Pie Chart


//Height and width of the SVG we will be working with
var w = 500;
var h = 500;

//Creates canvas we will use
var svg = d3.select("body")
            .append("svg")
            .append("g");

//Creates the classes of objects we will use
svg.append("g")
    .attr("class", "slices");
svg.append("g")
    .attr("class", "labels");
svg.append("g")
    .attr("class", "lines");

//Gets a radius that will fit in our svg
var width = 960;
var height = 450;
var radius = Math.min(width, height) / 2;

//Creates the pie object
var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
	return d.value;
    });

//Creates the arcs and sets their width for rour pie graph
var arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

//Not exactly sure yet why it uses two arc settings
var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

//Translates the ?pie chart? to the center of the svg
svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

//Not exactly sure what d.data is at this point
var key = function(d){ return d.data.label; };

//The color scheme
var color = d3.scale.ordinal()
.domain(["Maine", "New York", "Virginia", "Wasington D.C.", "Texas", "California", "New Jersey", "Rhode Island", "Maryland", "New Hampshire", "Massachussets"])
.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

//All these sections with "random" are where we should incorprate the slider to man. data
function randomData (){
    var labels = color.domain();
    return labels.map(function(label){
	return { label: label, value: Math.random() }
    });
}

change(randomData());

d3.select(".randomize")
.on("click", function(){
    change(randomData());
    });

//I think this function can be kept and it only gets called with randomData being 
//a function that pulls the ranges from the slider instead
function change(data) {

    //This is where we change thepie scices with the new data
    var slice = svg.select(".slices").selectAll("path.slice")
    .data(pie(data), key);

    slice.enter()
	.insert("path")
	.style("fill", function(d) { return color(d.data.label); })
	.attr("class", "slice");

    slice.transition()
	.duration(1000)
	.attrTween("d", function(d) {
	    this._current = this._current || d;
	    var interpolate = d3.interpolate(this._current, d);
	    this._current = interpolate(0);
	    return function(t) {
		return arc(interpolate(t));
	    };
	})

    slice.exit()
	.remove();

    //The text labels are changed in the folloing section of code
    var text = svg.select(".labels").selectAll("text")
	.data(pie(data), key);

    //Takes current labels before data change and adds new labels from data
    text.enter()
	.append("text")
	.attr("dy", ".35em")
	.text(function(d) {
	    return d.data.label;
	});
    
    //Fins the angle in between the beginning and ending of a pie slice
    function midAngle(d){
	return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

    //Settings for making the text changes look smooth
    text.transition()
	.duration(1000)
	.attrTween("transform", function(d) {
	    this._current = this._current || d;
	    var interpolate = d3.interpolate(this._current, d);
	    this._current = interpolate(0);
	    return function(t) {
		var d2 = interpolate(t);
		var pos = outerArc.centroid(d2);
		pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
		return "translate("+ pos +")";
	    };
	})
	.styleTween("text-anchor", function(d){
	    this._current = this._current || d;
	    var interpolate = d3.interpolate(this._current, d);
	    this._current = interpolate(0);
	    return function(t) {
		var d2 = interpolate(t);
		return midAngle(d2) < Math.PI ? "start":"end";
	    };
	});

    //Removes the text that we just changed from
    text.exit()
	.remove();

    //Code to change the polylines
    
    //Creates a line for every piece of data we have
    var polyline = svg.select(".lines")
	.selectAll("polyline")
	.data(pie(data), key);
    
    //Actually creates the polylines that we selected from the statement before
    polyline.enter()
	.append("polyline");

    //Settings to make the transition to the new polylines smooth
    polyline.transition()
	.duration(1000)
	.attrTween("points", function(d){
	    this._current = this._current || d;
	    var interpolate = d3.interpolate(this._current, d);
	    this._current = interpolate(0);
	    return function(t) {
		var d2 = interpolate(t);
		var pos = outerArc.centroid(d2);
		pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
		return [arc.centroid(d2), outerArc.centroid(d2), pos];
	    };
	});
    
    //Removes the lines we had before the data change
    polyline.exit()
    .remove();
