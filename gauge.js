var kW = {value: 1625, range: [0, 7000], units: 'kW', title: ['Plant', 'kW']}
var tR = {value: 3000, range: [0, 6500], units: 'tR', title: ['Plant', 'tR']}
var kW_tR = {value: Number((kW.value / tR.value).toString().slice(0, 4)), range: [2, 0], units: 'kW/tR', title: ['System', 'Efficiency']}    //remember to invert range

// kW_tR.value = 0.68

var selectedMeasurement = kW_tR // based on gauge we're creating

var {value} = selectedMeasurement
var {units} = selectedMeasurement

const backgroundColors = ['#FFC4C2', '#F7F1C3', '#C5F0DC']
const foregroundColors = ['#21A75D', '#ffd829', '#c01616']
const gray = '#474747'

var cx = 50;
var cy = 50;
var startAngle =  - Math.PI || (Math.PI - .9);    // these are measured in radians (pi * 2 radians === full circle, so in radians, 0 === 2 * pi)
var endAngle = Math.PI || Math.PI - .9;
var radiansPerWedge = (endAngle - startAngle) / 3;
var innerRadius = 65
var outerRadius = 90
var margin = {left: 200, right: 200, top: 200, bottom: 0}

const colorScale = d3.scaleQuantize()   
    .domain([selectedMeasurement.range[1], selectedMeasurement.range[0]])
    .range(foregroundColors)

const angleScale = d3.scaleLinear()
    .domain(selectedMeasurement.range)
    .range([startAngle, endAngle])

const testingScale = d3.scaleLinear()
    .domain([0,1])
    .range([startAngle, endAngle])

const svg = d3.select('body').append('svg')
    .attr('width', '100%')
    .attr('height', '100%')

const graphicGroup = svg.append('g').attr('class', 'graphicGroup').attr('transform', `translate(${margin.left}, ${margin.top})`)

const borderCircle = graphicGroup.append('circle')
    .attr('id', 'borderCircle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', 100)
    .attr('fill', 'none')
    .attr('stroke', gray)
    .attr('stroke-width', '7px')

const chartGroup = graphicGroup.append('g').attr('class', 'chartGroup').attr('transform', `translate(${cx}, ${cy})`)

const gaugeArcGenerator = d3.arc()
    .startAngle(startAngle)  
    .endAngle(angleScale(selectedMeasurement.value))
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius('50')

const threeWedgeArcsGenerator = d3.arc() 
    .startAngle((d, i) => startAngle + (radiansPerWedge * i))
    .endAngle((d, i) => startAngle + (radiansPerWedge * (i + 1)))
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

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


const radiansOfValue = angleScale(selectedMeasurement.value) - startAngle
const numOfFullWedges =  Math.floor(radiansOfValue / radiansPerWedge)
const leftoverRadians = radiansOfValue % radiansPerWedge

const foregroundWedgeFillData = []
for(let i = numOfFullWedges; i > 0; i--){
    foregroundWedgeFillData.push(radiansPerWedge)
}
if (leftoverRadians > 0) foregroundWedgeFillData.push(leftoverRadians)


const gauge = chartGroup.append('path')
    .attr('id', 'gauge')
    .attr('d', gaugeArcGenerator())
    .attr('fill', colorScale(selectedMeasurement.value))
    

const valueOutput = chartGroup.append('text')
    .attr('class', 'valueOutput')
    .attr('x', 0)
    .attr('y', cy - 40)
    .attr('text-anchor', 'middle')
    .attr('font-size', '3.05em')
    .attr('font-weight', 'bold')
    .text(selectedMeasurement.value)



const textPath = chartGroup.append('path')
    .attr('id', 'textPath')
    .attr('d', titleArcGenerator())
    .attr('fill', 'none')


const textPath2 = chartGroup.append('path')
    .attr('id', 'textPath2')
    .attr('d', unitsArcGenerator())
    .attr('fill', 'none')

const title = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#textPath") //ID of path
    .style("text-anchor","middle")
    .attr("startOffset", "25%")
    .attr('font-size', '1.3em')
    .attr('fill', '#75757a')
    .text(selectedMeasurement.title.join(' '));

const unitsOutput = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#textPath2") //ID of path
    .style("text-anchor","end")
    .attr("startOffset", "50%")
    .attr('font-size', '1.3em')
    .attr('fill', '#75757a')
    .text(selectedMeasurement.units);