var kW = {value: 1625, range: [0, 7000], units: 'kW', title: ['Plant', 'kW']}
var tR = {value: 3000, range: [0, 6500], units: 'tR', title: ['Plant', 'tR']}
var kW_tR = {value: Number((kW.value / tR.value).toString().slice(0, 4)), range: [1, 0], units: 'kW/tR', title: ['System', 'Efficiency']}    //remember to invert range

kW_tR.value = 0.3

var selectedMeasurement = kW_tR // based on gauge we're creating

var {value} = selectedMeasurement
var {units} = selectedMeasurement

const backgroundColors = ['#FFC4C2', '#F7F1C3', '#C5F0DC']
const foregroundColors = ['#21A75D', '#ffd829', '#c01616']

var cx = 50;
var cy = 50;
var startAngle =  - Math.PI || (Math.PI - .9);    // these are measured in radians (pi * 2 radians === full circle, so in radians, 0 === 2 * pi)
var endAngle = Math.PI || Math.PI - .9;
var radiansPerWedge = (endAngle - startAngle) / 3;
var innerRadius = 65
var outerRadius = 90
var margin = {left: 500, right: 500, top: 400, bottom: 0}

const colorScale = d3.scaleQuantize()   
    .domain(selectedMeasurement.range)
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
    .attr('class', 'borderCircle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', 100)
    .attr('fill', 'none')
    .attr('stroke', '#474747')
    .attr('stroke-width', '7px')

const chartGroup = graphicGroup.append('g').attr('class', 'chartGroup').attr('transform', `translate(${cx}, ${cy})`)

const gaugeArcGenerator = d3.arc()
    .startAngle(startAngle)  
    .endAngle(angleScale(selectedMeasurement.value))
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

const threeWedgeArcsGenerator = d3.arc() 
    .startAngle((d, i) => startAngle + (radiansPerWedge * i))
    .endAngle((d, i) => startAngle + (radiansPerWedge * (i + 1)))
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

const foregroundArcsGenerator = d3.arc()
    .startAngle((d, i) => startAngle + (radiansPerWedge * i))   
    .endAngle((d, i) => startAngle + (radiansPerWedge * i) + d)   //this wedge's start angle plus d
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)



// const backgroundArcs = chartGroup.selectAll('.backgroundArcs')
//     .data([0, 1, 2])
//     .enter()
//         .append('path')
//             .attr('class', 'backgroundArc')
//             .attr('d', threeWedgeArcsGenerator)
//             .attr('fill', 'none')     //.attr('fill', (d, i) => backgroundColors[i])
//             .attr('stroke', 'gray')          // BACKGROUND BORDER LINES: .attr('stroke', (d, i) => foregroundColors[i]) 



const radiansOfValue = angleScale(selectedMeasurement.value) - startAngle
const numOfFullWedges =  Math.floor(radiansOfValue / radiansPerWedge)
const leftoverRadians = radiansOfValue % radiansPerWedge

const foregroundWedgeFillData = []
for(let i = numOfFullWedges; i > 0; i--){
    foregroundWedgeFillData.push(radiansPerWedge)
}
if (leftoverRadians > 0) foregroundWedgeFillData.push(leftoverRadians)


// const foregroundArcs = chartGroup.selectAll('foregroundArcs')
//     .data(foregroundWedgeFillData)
//     .enter()
//         .append('path')
//             .attr('class', 'foregroundArc')
//             .attr('d', foregroundArcsGenerator)
//             .attr('fill', (d, i) => foregroundColors[i])

const gauge = chartGroup.append('path')
    .attr('class', 'gauge')
    .attr('d', gaugeArcGenerator())
    // .attr('stroke', 'gray')
    .attr('fill', colorScale(selectedMeasurement.value))
    

const textGroup = chartGroup.append('g')
    .attr('class', 'textGroup')

textGroup.append('text').selectAll('tspan')
    .data(selectedMeasurement.title)
    .enter().append('tspan')
        .attr('x', 0)
        .attr('y', (d, i) => (i * 30) - 27)
        .attr('class', (d, i) => `title-${i + 1}`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '1.3em')
        .attr('fill', '#75757a')
        .text(d => d)

const valueOutput = textGroup.append('text')
    .attr('class', 'valueOutput')
    .attr('x', 0)
    .attr('y', cy - 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1.05em')
    .attr('font-weight', 'bold')
    .text(`${selectedMeasurement.value} ${selectedMeasurement.units}`)

