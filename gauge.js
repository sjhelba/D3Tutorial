var kW = {value: 1625, range: [0, 7000], units: 'kW', title: ['Plant', 'kW']}
var tR = {value: 3000, range: [0, 6500], units: 'tR', title: ['Plant', 'tR']}
var kW_tR = {value: 0.99 || Number((kW.value / tR.value).toString().slice(0, 4)), range: [1, 0], units: 'kW/tR', title: ['System', 'Efficiency']}    //remember to invert range

var selectedMeasurement = kW_tR // based on gauge we're creating

var {value} = selectedMeasurement
var {units} = selectedMeasurement

var cx = 50;
var cy = 50;
var startAngle =  - (Math.PI - .9);    // these are measured in radians (pi * 2 radians === full circle, so in radians, 0 === 2 * pi)
var endAngle = Math.PI - .9;
var radiansPerWedge = (endAngle - startAngle) / 3;
var innerRadius = 65
var outerRadius = 90
var margin = {left: 500, right: 500, top: 400, bottom: 0}

const colorScale = d3.scaleQuantize()   //fix for gauge color scale
    .domain(selectedMeasurement.range)
    .range(['red', 'yellow', '#7CFC00'])

const angleScale = d3.scaleLinear()
    .domain(selectedMeasurement.range)
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

const colors = ['#FFC4C2', '#F7F1C3', '#C5F0DC']
const backgroundArcs = chartGroup.selectAll('.backgroundArcs')
    .data([33, 33, 33])
    .enter()
        .append('path')
            .attr('class', 'backgroundArc')
            .attr('d', threeWedgeArcsGenerator)
            .attr('fill', (d, i) => colors[i])


const gauge = chartGroup.append('path')
    .attr('class', 'gauge')
    .attr('d', gaugeArcGenerator())
    .attr('stroke', 'gray')
    .attr('fill', 'rgba(22, 24, 22, 0.24)')
    

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

