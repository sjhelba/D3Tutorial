// .attr('', '')
var dataArray = [{x:5,y:5}, {x:10,y:15}, {x:20,y:7}, {x:30,y:18}, {x:40,y:10}];
var interpolateTypes = [d3.curveLinear, d3.curveNatural, d3.curveStep, d3.curveBasis, d3.curveBundle, d3.curveCardinal] //to me curveCardinal looks best and most accurate for C, and curveLinear for L

var svg = d3.select('body').append('svg').attr('height', '100%').attr('width', '100%')

for (let p = 0; p < interpolateTypes.length; p++){

  var line = d3.line()  //line generator (func which generates a path element)
    .x((d, i) => d.x * 6)
    .y((d, i) => d.y * 4)
    .curve(interpolateTypes[p]) //d3.curveCardinal makes Cx,y rather than Lx,y points in path (can also change to other types of curves even within C or L, like .curve(d3.curveStep)) which uses L

  var shiftX = p * 250;
  var shiftY = 0;
  var chartGroup = svg.append('g')
    .attr('transform', `translate(${shiftX}, ${shiftY})`)
    .attr('class', 'group' + p)

  chartGroup.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('d', line(dataArray))

  chartGroup.selectAll('circle.grp' + p)
    .data(dataArray)
    .enter().append('circle')
      .attr('class', 'grp' + p) // if we don't differentiate these, each time we loop through the outer loop, it'll pick up the last 5 circles we created the last time and not enter 'enter()'
      .attr('cx', (d, i) => d.x * 6)
      .attr('cy', (d, i) => d.y * 4)
      .attr('r', '2')

}
