/* EXPOSED PROPERTIES */

var gaugeTitle = 'System Efficiency';
var efficiencyGauge = true;
var decimalPlaces = 2;

var efficiencyThresholds = {baseline: 1.20, target: 0.80};
var value = 1625 / 3000;  // example kW / tR
var units = 'kW / tR';
var minVal = 0;
var maxVal = 2;

var borderCircleWidth = 7
var borderPadding = 2
var additionalGaugeArcThickness = 2

//TODO: fonts include style and size
var titleFont = '12.0pt Nirmala UI';
var unitsFont = '10.0pt Nirmala UI';
var valueFont = 'bold 27.0pt Nirmala UI';

var borderCircleColor = '#474747';
var backgroundColor = 'white';
var borderCircleFillColor = 'white';
// if efficiencyGauge is true, will utilize efficiencyColorScale for arc fill (all 3 gaugeArcColors), else only gaugeArcColors.nominal
var gaugeArcColors = {nominal: '#21A75D', target: '#ffd829', baseline: '#c01616'};
var titleColor = '#75757a';
var unitsColor = '#75757a';
var valueColor = 'black';



/***** MAKE ALL SIZING RELATIVE TO THESE. WILL CHANGE TO JQ VALUES FOR NIAGARA *****/
var height = '200';
var width = '200';
/***** MAKE ALL SIZING RELATIVE TO THESE. WILL CHANGE TO JQ VALUES FOR NIAGARA *****/




/* SETUP DEFINITIONS */

var cx = width / 2;
var cy = height / 2;
var borderCircleRadius = height < width ? (height / 2.5) - borderCircleWidth : (width / 2.5) - borderCircleWidth 
// angles are measured in radians (pi * 2 radians === full circle, so in radians, 0 === 2 * pi)
var startAngle =  - Math.PI;
var endAngle = Math.PI;
var gaugeArcOuterRadius = borderCircleRadius - (.1 * borderCircleRadius) - borderPadding;
var gaugeArcInnerRadius = gaugeArcOuterRadius - (.17 * borderCircleRadius) - additionalGaugeArcThickness;

// implements value limit for gauge arc display so that never completely empty
const minValForArc = (maxVal - minVal) * .95;
const valForGaugeArc = (efficiencyGauge && value < minValForArc) || (!efficiencyGauge && value > minValForArc) ? value : minValForArc;

// if efficiencyGauge marked true, inverts min and max vals
if (efficiencyGauge) var [minVal,maxVal] = [maxVal,minVal];

// func returns which color arc fill should be based on curr val, efficiency thresholds, and selected arc colors for up to baseline, up to target, & nominal vals
const efficiencyColorScale = (currentValue) => {
    if (currentValue >= efficiencyThresholds.baseline) return gaugeArcColors.baseline;
    if (currentValue >= efficiencyThresholds.target) return gaugeArcColors.target;
    return gaugeArcColors.nominal;
};
// returns scaling func that returns angle in radians for a value
const angleScale = d3.scaleLinear()
    .domain([minVal, maxVal])
    .range([startAngle, endAngle]);

// Arc Generators return d values for paths
const gaugeArcGenerator = d3.arc()
    .startAngle(startAngle)  
    .innerRadius(gaugeArcInnerRadius)
    .outerRadius(gaugeArcOuterRadius)
    .cornerRadius('50'); // round edges of path

const titleArcGenerator = d3.arc()
    .startAngle(startAngle)
    .endAngle(endAngle)
    .innerRadius(borderCircleRadius)
    .outerRadius(borderCircleRadius + borderCircleWidth);

const unitsArcGenerator = d3.arc()
    .startAngle(endAngle)
    .endAngle(startAngle)
    .innerRadius(gaugeArcInnerRadius - (gaugeArcInnerRadius * .05))
    .outerRadius(gaugeArcInnerRadius - (gaugeArcInnerRadius * .05));

// func that returns func that returns return val of gaugeArcGenerator invoked on data with 'end angle' property of interpolated start & end end angles for drawing arc transition
// [ adapted from Mike Bostok's http://bl.ocks.org/mbostock/5100636 ]
const arcTween = newAngle => datum => t => {
    datum.endAngle = d3.interpolate(datum.endAngle, newAngle)(t);
    return gaugeArcGenerator(datum);
};


/* APPEND D3 ELEMENTS INTO SVG */

const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

const backgroundRect = svg.append('rect')
  	.attr('id', 'background')
  	.attr('x', 0)
  	.attr('y', 0)
  	.attr('width', '100%')
  	.attr('height', '100%')
  	.attr('stroke-width', '0')
  	.attr('fill', backgroundColor);

const borderCircle = svg.append('circle')  // TODO: Replace borderCircle with titlePath
    .attr('id', 'borderCircle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', borderCircleRadius)
    .attr('fill', borderCircleFillColor)
    .attr('stroke', borderCircleColor)
    .attr('stroke-width', borderCircleWidth);
    
const valueOutput = svg.append('text')
    .attr('class', 'valueOutput')
    .attr('x', cx)
    .attr('y', cy)
    .attr('text-anchor', 'middle')
    .attr('fill', valueColor)
    .style('font', valueFont)
    // formats output num using num of decimal places user input
    .text(d3.format(`,.${decimalPlaces}f`)(value));

const chartGroup = svg.append('g')
    .attr('class', 'chartGroup')
    .attr('transform', `translate(${cx}, ${cy})`);

const gaugeArc = chartGroup.append('path')
    .attr('id', 'gaugeArc')
    .datum({endAngle: angleScale(minValForArc)})
    // fill nominal color for non-efficiency gauge or 3 color scale for efficiency gauge. Starts with min val color prior to transition
    .attr('fill', efficiencyGauge ? efficiencyColorScale(minValForArc) : gaugeArcColors.nominal)
    .attr('d', gaugeArcGenerator(angleScale(minValForArc)))
    .transition()
        .duration(1000)
        // if efficiency graph, transition from min val scale color to actual val's scale color
        .attr('fill', efficiencyGauge ? efficiencyColorScale(value) : gaugeArcColors.nominal)
        // gradually transition end angle from minValForArc to true val angle
        .attrTween('d', arcTween(angleScale(valForGaugeArc)));

const titlePath = chartGroup.append('path')
    .attr('id', 'titlePath')
    .attr('d', titleArcGenerator())
    .attr('fill', 'none');

const unitsPath = chartGroup.append('path')
    .attr('id', 'unitsPath')
    .attr('d', unitsArcGenerator())
    .attr('fill', 'none');

const titleOutput = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#titlePath") // ID of path text follows
    .style("text-anchor","middle")
    .attr("startOffset", "20%")
    .style('font', titleFont)
    .attr('fill', titleColor)
    .text(gaugeTitle);

const unitsOutput = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#unitsPath") // ID of path text follows
    .style("text-anchor","end")
    .attr("startOffset", "50%")
    .style('font', unitsFont)
    .attr('fill', unitsColor)
    .text(units);
