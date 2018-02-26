var dataArray = [5, 11, 18];
var dataDays = ['Mon', 'Wed', 'Fri'];

var rainbow = d3.scaleSequential(d3.interpolateRainbow) //a color scale
  .domain([0, 10])  // range of colors we'll be needing to span from passed in arg above for our output

var rainbow2 = d3.scaleSequential(d3.interpolateRainbow) //color scale
  .domain([0, 3])

var chartWidth = 170
var rectWidth = 50

var x = d3.scaleBand() //x scale
  .domain(dataDays)
  .range([0, chartWidth])  // min, max pixel value
  .paddingInner((chartWidth - (dataArray.length * rectWidth)) / chartWidth)  // % of chart dedicated to white space. Each rect is 50px. 50 times 3 rects = 150. The width of the chart is 170. 170 - 150 = 20. 20 / 170 = .1176 (or 11.76% of white space)

var xAxis = d3.axisBottom(x)  //x axis generator uses x scale

var svg = d3.select('body').append('svg')
  .attr('height', '100%')
  .attr('width', '100%')

var cat20 = d3.schemeCategory20 //hard coded array of colors


svg.selectAll('rect')
  .data(dataArray)
  .enter().append('rect')
    .attr('height', (d, i) => d * 15)
    .attr('width', rectWidth)
    .attr('fill', (d, i) => rainbow(i))  //changes color based on d
    .attr('x', (d, i) => 60 * i)
    .attr('y', (d, i) => 300 - (d * 15))  // 300 (where you want the bottom of the bars to start) - the height of the bars

svg.append('g') //create x axis
  .attr('class', 'x axis hidden')
  .attr('transform', 'translate(0, 300)')
  .call(xAxis)

var newCircleX = 300

svg.selectAll('circle.first')
  .data(dataArray)
  .enter().append('circle')
    .attr('class', 'first')
    .attr('fill', (d, i) => rainbow2(i))
    .attr('cx', (d, i) => {
      newCircleX += (d * 3) + i * 20  //d * 6 for different diameters (radius is d*3) and 20 bcuz we want them spaced out by an additional 20 each time (if they had equal radii we would just be returning i * 20 instead of adding on bits to newX each time like this)
      return newCircleX
    })
    .attr('cy', '100')
    .attr('r', d => d * 3)


var newEllipseX = 600

svg.selectAll('ellipse')
  .data(dataArray)
  .enter().append('ellipse')
    .attr('fill', (d, i) => cat20[i])
    .attr('cx', (d, i) => {newEllipseX += (d * 3) + i * 20; return newEllipseX})
    .attr('cy', '100')
    .attr('rx', d => d * 3)
    .attr('ry', '30')

var newLineX = 900

svg.selectAll('line')
  .data(dataArray)
  .enter().append('line')
    // .attr('stroke', 'blue')  //this adds stroke property to line
    // .style('stroke', 'green')   //this adds style property to line w/ value: '{stroke: green}'. Style's stroke is dominant to stroke prop and CSS formatting. CSS formatting takes precedence over stroke prop. CSS formatting these things is best practice
    .attr('stroke-width', '2')
    .attr('x1', newLineX)
    .attr('y1', (d, i) => 80 + (i * 20)) // 20 pixel gap btw ea. line. 80 so that first line is visible, not squashed at top of screen
    .attr('x2', d => newLineX + (d * 15)) // different lengths depending on data, starting at where the line began
    .attr('y2', (d, i) => 80 + (i * 20)) // y1 and y2 are same

var newTextX = 900

/* MANUALLY ATTACH EACH LINE OF TEXT & CHANGE WHERE X&Y START FROM */

// svg.append('text')
//   .attr('x', newTextX)
//   .attr('y', 150)
//   .attr('fill', 'none')
//   .attr('stroke', 'blue')
//   .attr('stroke-width', '2')
//   .attr('text-anchor', 'start')
//   .attr('dominant-baseline', 'middle')
//   .attr('font-size', 30)
//   .text('start')

// svg.append('text')
//   .attr('x', newTextX)
//   .attr('y', 180)
//   .attr('fill', 'blue')
//   .attr('stroke', 'none')
//   .attr('text-anchor', 'middle')
//   .attr('dominant-baseline', 'middle')
//   .attr('font-size', 30)
//   .text('middle')

// svg.append('text')
//   .attr('x', newTextX)
//   .attr('y', 210)
//   .attr('stroke', 'blue')
//   .attr('text-anchor', 'end')
//   .attr('dominant-baseline', 'middle')
//   .attr('fill', 'none')
//   .attr('font-size', 30)
//   .text('end')

// svg.append('line')  //shows where x is being measured from for each text item (given different text-anchor positions)
//   .attr('x1', newTextX)
//   .attr('y1', '150')
//   .attr('x2', newTextX)
//   .attr('y2', '210')

var textArray = ['start', 'middle', 'end']

//this makes multiple tspan lines of text within one text element
svg.append('text').selectAll('tspan')
  .data(textArray)
  .enter().append('tspan')
    .attr('x', newTextX)
    .attr('y', (d, i) => 150 + (i * 30))
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-width', '2')
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 30)
    .text(d => d)

``
