// Setting up the SVG canvas for dynamic resizing of chart objects
var svgWidth = 910;
var svgHeight = 406;

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

//Initial Params for y Axis using the column name from data.csv
var chosenYAxis = "healthcare";

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

//function used to update y-scale var upon click on axis label
function yScale(stateData, chosenYAxis){
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, data => data[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;
}

//function used to update the xAxis var upon click on axis label
function renderAxes(newScale, Axis, axisLocation){
    var axisLocation;
    if(axisLocation === "bottomAxis") {axisLocation = d3.axisBottom(newScale);}
    else{ axisLocation = d3.axisLeft(newScale);}

    Axis.transition()
        .duration(1000)
        .call(axisLocation);

    return Axis;
}

//function used to update the circles grouped with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis){

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[chosenXAxis]))
        .attr("cy", data => newYScale(data[chosenYAxis]));

    return circlesGroup;
}

//function used to update the circles grouped with a transition to new circles
function renderTexts(textsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis){

    textsGroup.transition()
        .duration(1000)
        .attr("x", data => newXScale(data[chosenXAxis] - .1))
        .attr("y", data => newYScale(data[chosenYAxis] - .1));

    return textsGroup;
}

// function used to update the circles group with new tooltip
function updateTooltip(chosenXAxis, circlesGroup){

    var label;

    if(chosenXAxis === "poverty"){
         label = "In Poverty: ";
    }
    else if (chosenXAxis ===  "ageMoe"){
         label = "Age (Median): ";
    }
    else {
         label = "Household Income (Median): ";
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

function updateYchosenAxis(chosenXAxis){
    switch(chosenXAxis){
        case "poverty":
            return "healthcare";
        case "ageMoe":
            return "smokes";
        case "incomeMoe":
            return "obesity";
        default:
            return "healthcare";
    }
}

/*
*  NOW WE ARE RETRIEVING THE DATA AND ACTUALLY USING TE FUNCTIONS
*  DECLARED ABOVE
*
* */

d3.csv("assets/data/stateData.csv").then( (stateData) =>{

    console.log("stateDate Object below");
    console.log(stateData);
    //parsing data
    stateData.forEach( state => {
        state.poverty = +state.poverty; // Default X Axis
        state.ageMoe = +state.ageMoe; // Alternative x axis 1
        state.incomeMoe = +state.incomeMoe; // Alternative x axis 2

        state.healthcare = +state.healthcare; // Default Y Axis
        state.obesity = +state.obesity; // Alternative y axis 1
        state.smokes = +state.smokes;  // Alternative y axis 2
    });

    // XlinearScale function from above using csv data
    var xLinearScale = xScale(stateData, chosenXAxis);

    //Create Y Scale Function
    var yLinearScale = yScale(stateData, chosenYAxis);

    //Creating Initial Axis Functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y Axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", data => xLinearScale(data[chosenXAxis]))
        .attr("cy", data => yLinearScale(data[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "lightblue")
        .attr("stroke", "black")
        .attr("opacity", ".9");

    var textsGroup = chartGroup.selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .text(data => data.id)
        .attr("x", data => xLinearScale(data[chosenXAxis] -.1))
        .attr("y", data => yLinearScale(data[chosenYAxis] -.1))
        .attr("font-size", "12px");


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

    var ageLabel = labelGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "ageMoe") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "incomeMoe") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");


    //Append y Axis labels
    var yLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    //updateToolTip function above csv import
    circlesGroup = updateTooltip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // replaces chosenYAxis with value
                chosenYAxis = updateYchosenAxis(chosenXAxis);

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);

                yLinearScale = yScale(stateData, chosenYAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis, "bottomAxis");
                yAxis = renderAxes(yLinearScale, yAxis, "leftAxis");


                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateTooltip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    yLabel.text("Lacks Healthcare (%)");
                }
                else if(chosenXAxis === "ageMoe"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    yLabel.text("Smokes (%)")
                }
                else{
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    yLabel.text("Obese (%)");
                }
            }
        });
});