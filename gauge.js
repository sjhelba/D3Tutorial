
/* EXPOSED PROPERTIES */
var gaugeTitle = 'System Efficiency'
var efficiencyGauge = true;
var decimalPlaces = 2

var efficiencyThresholds = {baseline: 1.20, target: 0.80}
var value = 1625 / 3000  // example kW / tR
var units = 'kW/tR'
var minVal = 0
var maxVal = 2

var borderCircleWidth = '7px'
var arcWidth = ''

//TODO: fonts include style and size
var titleFont = ''
var unitsFont = ''
var valueFont = ''

var borderCircleColor = '#474747'
var backgroundColor = 'white'
var gaugeFillColor = 'white'
var arcColors = {nominal: '#21A75D', target: '#ffd829', baseline: '#c01616'}    // if efficiencyGauge is true, will utilize efficiencyColorScale for arc fill (all 3 arcColors), else only arcColors.nominal
var titleColor = ''
var unitsColor = ''
var valueColor = ''
// TODO: size everything based on these properties and jq.height/width


/* SETUP DEFINITIONS */
var cx = 0;
var cy = 0;
var startAngle =  - Math.PI;    // these are measured in radians (pi * 2 radians === full circle, so in radians, 0 === 2 * pi)
var endAngle = Math.PI;
var innerRadius = 65
var outerRadius = 90
var margin = {left: 150, top: 150}

// implement value limit for gauge arc display so that never completely empty
const minValForArc = (maxVal - minVal) * .95
const valForGaugeArc = (efficiencyGauge && value < minValForArc) || (!efficiencyGauge && value > minValForArc) ? value : minValForArc;

// if efficiencyGauge marked true, invert min and max vals
if (efficiencyGauge) var [minVal,maxVal] = [maxVal,minVal];

//func returns which color arc fill should be based on curr val, efficiency thresholds, and selected arc colors for up to baseline, up to target, & nominal vals
const efficiencyColorScale = (currentValue) => {
    if (currentValue >= efficiencyThresholds.baseline) return arcColors.baseline;
    if (currentValue >= efficiencyThresholds.target) return arcColors.target;
    return arcColors.nominal;
};

// returns scaling func that returns angle in radians for a value
const angleScale = d3.scaleLinear()
    .domain([minVal, maxVal])
    .range([startAngle, endAngle])


// Arc Generators return d values for paths
const gaugeArcGenerator = d3.arc()
    .startAngle(startAngle)  
    .endAngle(angleScale(valForGaugeArc))
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius('50') //round edges of path

const titleArcGenerator = d3.arc()
    .startAngle(startAngle)
    .endAngle(endAngle)
    .innerRadius(innerRadius)
    .outerRadius(outerRadius + 20)

const unitsArcGenerator = d3.arc()
    .startAngle(endAngle)
    .endAngle(startAngle)
    .innerRadius(innerRadius - 2)
    .outerRadius(innerRadius - 2)


/* APPEND D3 ELEMENTS INTO SVG */
const svg = d3.select('body').append('svg')
    .attr('width', '100%')
    .attr('height', '100%')

const graphicGroup = svg.append('g')
    .attr('class', 'graphicGroup')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

const borderCircle = graphicGroup.append('circle')  // TODO: Replace borderCircle with titlePath
    .attr('id', 'borderCircle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', 100)
    .attr('fill', 'none')
    .attr('stroke', borderCircleColor)
    .attr('stroke-width', borderCircleWidth)

const chartGroup = graphicGroup.append('g')
    .attr('class', 'chartGroup')
    .attr('transform', `translate(${cx}, ${cy})`)

const gaugeArc = chartGroup.append('path')
    .attr('id', 'gaugeArc')
    .attr('d', gaugeArcGenerator())
    .attr('fill', efficiencyGauge ? efficiencyColorScale(value) : arcColors.nominal)  // use singular color for non-efficiency gauge or 3 color scale for efficiency gauge

const titlePath = chartGroup.append('path')
    .attr('id', 'titlePath')
    .attr('d', titleArcGenerator())
    .attr('fill', 'none')

const unitsPath = chartGroup.append('path')
    .attr('id', 'unitsPath')
    .attr('d', unitsArcGenerator())
    .attr('fill', 'none')

const titleOutput = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#titlePath") //ID of path text follows
    .style("text-anchor","middle")
    .attr("startOffset", "25%")
    .attr('font-size', '1.3em')
    .attr('fill', '#75757a')
    .text(gaugeTitle);

const unitsOutput = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#unitsPath") //ID of path text follows
    .style("text-anchor","end")
    .attr("startOffset", "50%")
    .attr('font-size', '1.3em')
    .attr('fill', '#75757a')
    .text(units);
    
const valueOutput = chartGroup.append('text')
    .attr('class', 'valueOutput')
    .attr('x', 0)
    .attr('y', cy)
    .attr('text-anchor', 'middle')
    .attr('font-size', '3.05em')
    .attr('font-weight', 'bold')
    .text(d3.format(`,.${decimalPlaces}f`)(value))  //formats output num using num of decimal places input by user 