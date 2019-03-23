// Setting up the SVG canvas for dynamic resizing of chart objects
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// "Real size of canvas after being aesthetically altered:
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//SVG wrapper that holds our chart
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// SVG Group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params for x Axis using the column name from data.csv
var chosenXAxis = "poverty";

//function used to update the x-scale var upon click on axis label
function xScale(stateData, chosenXAxis){
    //create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, data => data[chosenXAxis]),
        d3.max(stateData, data => data[chosenXAxis])
        ])
        .range([0, width]);

    return xLinearScale;
}

//function used to update the xAxis var upon click on axis label
function renderAxes(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//function used to update the circles grouped with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis){

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[chosenXAxis]));

    return circlesGroup;
}

// function used to update the circles group with new tooltip
function updateTooltip(chosenXAxis, circlesGroup){

    if(chosenXAxis === "poverty"){
        var label = "In Poverty: "
    }
    else{
        var label = "Age: "
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}

/*
*  NOW WE ARE RETRIEVING THE DATA AND ACTUALLY USING TE FUNCTIONS
*  DECLARED ABOVE
*
* */

d3.csv("assets/data/stateData.csv").then( (stateData) =>{


    console.log(stateData);
    //parsing data
    stateData.forEach( state => {
        state.poverty = +state.poverty; // Default X Axis
        state.healthcare = +state.healthcare; // Y Axis
    });

    // XlinearScale function from above using csv data
    var xLinearScale = xScale(stateData, chosenXAxis);

    //Create Y Scale Function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, data => data.healthcare)])
        .range([height, 0]);

    //Creating Initial Axis Functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y Axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroupAux = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("g");
    
    circlesGroupAux
        .append("circle")
        .attr("cx", data => xLinearScale(data[chosenXAxis]))
        .attr("cy", data => yLinearScale(data.healthcare))
        .attr("r", 10)
        .attr("fill", "lightblue")
        .attr("opacity", "0.85");

    circlesGroupAux
        .append("text")
        .attr("x", data => xLinearScale(data[chosenXAxis] - 0.1))
        .attr("y", data=> yLinearScale(data.healthcare) + 4.5)
        .attr("font-size", "12px")
        .text(data => data.abbr);

    var circlesGroup = circlesGroupAux;


    //Create group for 2 x-axis labels
    var labelGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

    //Append x Axis labels
    var povertyLabel = labelGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");


    //Append y Axis labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    //updateToolTip function above csv import
    var circlesGroup = updateTooltip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(hairData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "num_albums") {
                    albumsLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    hairLengthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    albumsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    hairLengthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});