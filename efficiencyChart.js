const data = {
    baselineData: [{"month":"Jan","year":"2017","value":1.05},{"month":"Feb","year":"2017","value":1.10},{"month":"Mar","year":"2017","value":1.01},
    {"month":"Apr","year":"2017","value":0.95},{"month":"May","year":"2017","value":0.98},{"month":"Jun","year":"2017","value":0.95},
    {"month":"Jul","year":"2017","value":0.92},{"month":"Aug","year":"2017","value":0.94},{"month":"Sep","year":"2017","value":0.98},
    {"month":"Oct","year":"2017","value":1.08},{"month":"Nov","year":"2017","value":1.05},{"month":"Dec","year":"2017","value":0.99}],

    targetData: [{"month":"Jan","year":"2017","value":0.68},{"month":"Feb","year":"2017","value":0.62},{"month":"Mar","year":"2017","value":0.69},
    {"month":"Apr","year":"2017","value":0.68},{"month":"May","year":"2017","value":0.71},{"month":"Jun","year":"2017","value":0.68},
    {"month":"Jul","year":"2017","value":0.72},{"month":"Aug","year":"2017","value":0.68},{"month":"Sep","year":"2017","value":0.71},
    {"month":"Oct","year":"2017","value":0.78},{"month":"Nov","year":"2017","value":0.80},{"month":"Dec","year":"2017","value":0.76}],

    thisYearData: [{"month":"Jan","year":"2017","value":0.55},{"month":"Feb","year":"2017","value":0.65},{"month":"Mar","year":"2017","value":0.62},
    {"month":"Apr","year":"2017","value":0.65},{"month":"May","year":"2017","value":0.69},{"month":"Jun","year":"2017","value":0.61},
    {"month":"Jul","year":"2017","value":0.68},{"month":"Aug","year":"2017","value":0.72},{"month":"Sep","year":"2017","value":0.68},
    {"month":"Oct","year":"2017","value":0.78},{"month":"Nov","year":"2017","value":0.67},{"month":"Dec","year":"2017","value":0.56},
  
    {"month":"Jan","year":"2018","value":0.55},{"month":"Feb","year":"2018","value":0.65},{"month":"Mar","year":"2018","value":0.62}
  ]
}

// function that makes '3 digit month'-'4 digit year' into date
const parseDate = d3.timeParse('%b-%Y')
const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const year = 2018;

const today = new Date();
const currentFullYear = today.getFullYear();
const currentMonthIndex = today.getMonth();
const getDatesOfLast12Months = (monthIndex, currentYear) => {
  const monthsArray = [];
  const datesArray = [];
  let pointer = monthIndex;
  for (let count = 12; count > 0; count--) {
    if (pointer >= 0) {
      monthsArray.unshift(months[pointer]);
      datesArray.unshift(months[pointer] + '-' + currentYear);
    } else {
      monthsArray.unshift(months[months.length + pointer])
      datesArray.unshift(months[months.length + pointer] + '-' + (currentYear - 1))
    }
    pointer--;
  }
  return [monthsArray, datesArray];
}
const [last12Months, last12Dates] = getDatesOfLast12Months(currentMonthIndex, currentFullYear);  // formatted [['Dec', 'Jan', ...etc], ['Dec-2017', 'Jan-2018', ...etc]]

const sortUpToCurrentMonth = (a, b) => last12Months.indexOf(a.month) - last12Months.indexOf(b.month)

const thisYearData = data.thisYearData.slice(-12)
const baselineData = data.baselineData.sort(sortUpToCurrentMonth)
const targetData = data.targetData.sort(sortUpToCurrentMonth)

const mostRecentData = data.thisYearData[data.thisYearData.length - 1]
const mostRecentMonth = mostRecentData.month;

const thisYearValues = thisYearData.map(data => data.value);
const baselineValues = baselineData.map(data => data.value);
const targetValues = targetData.map(data => data.value);

const allValues = baselineValues.concat(thisYearValues, targetValues);
const range = d3.extent(allValues);

const highestYtick = range[1] + 0.2;
const yTickInterval = highestYtick / 4;
const yTickValues = [0, yTickInterval, yTickInterval * 2, yTickInterval * 3, highestYtick]

const legendHeight = 50
const legendWidth = 80

const height = 200
const width = 500

const colors = {baseline: 'rgb(44, 139, 246)', target: 'rgb(246, 159, 44)', thisYear: 'rgb(39, 176, 71)'}

const margin = {left: 50, right: 50, top: 5 + legendHeight, bottom: 0}  //will be used in terms of pixels (convention to call margin)

const yScale = d3.scaleLinear()  // scaling function
  .domain([0, 0.2 + range[1]]) //can be whatever you want the axis to cover
  .range([height, 0])

const xScale = d3.scaleTime()  // scaling function
  .domain([parseDate(last12Dates[0]), parseDate(last12Dates[11])])  // [min, max] data Month-Year's as JS dates
  .range([0, width])

const yAxis = d3.axisLeft(yScale)  // axis generator (axis labels can be left, right, top, bottom in relation to line).
  .tickValues(yTickValues)  //Adding 'ticks' gives guidance to D3 for apprx number of ticks you want. It will generate a similar number of ticks that typically makes sense to humans (e.g. 5s or 10s). You can override this and tell it the exact number you want with a setting called tick values
  .tickPadding(10)  // on axisLeft, moves labels further from ticks
  .tickSize(10) //plenty more tick settings out there


const xAxis = d3.axisBottom(xScale) //axis generator
  .tickFormat(d3.timeFormat('%b'))

const areaPathGenerator = d3.area()  // area generator (generates path element)
  .x((d, i) => xScale(parseDate(d.month + '-' + thisYearData[i].year)))  //data points on chart will be determined by scaling func, passing in date-parsed data element (i of dataYears) -- so that it matches up with x-axis scale
  .y0(height) //bottom line of area ( where x axis would go for most area charts)
  .y1((d, i) => yScale(d.value)) //top line of area (we'd take d off of the height because y works upside down by default if we did this w/o scale). y(d) is outputting the literal y position the datapoint should be in
  .curve(d3.curveCardinal)

const topBorderPathGenerator = d3.line()
  .x((d, i) => xScale(parseDate(d.month + '-' + thisYearData[i].year)))
  .y((d, i) => yScale(d.value))
  .curve(d3.curveCardinal)

  
const svg = d3.select('body').append('svg').attr('height', '100%').attr('width', '100%')
const chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)  //We shifted the whole chart because otherwise the y axis labels were to the left of 0px x, and so we needed to push the axis over (also we wanted to push it further down so it'd be easier to see).

let baselineActive = true;
let targetActive = true;
let thisYearActive = true;

// const baselineGroup = chartGroup.append('g').attr('class', 'baseline');
// const targetGroup = chartGroup.append('g').attr('class', 'target');
// const thisYearGroup = chartGroup.append('g').attr('class', 'thisYear');

// Groups for Category Paths
const categoryGroups = chartGroup.selectAll('path')
  .data([
    {category: 'baseline', color: colors.baseline, data: baselineData},
    {category: 'target', color: colors.target, data: targetData},
    {category: 'thisYear', color: colors.thisYear, data: thisYearData}
  ])
  .enter().append('g').attr('class', d => d.category);

// Area Paths
categoryGroups.append('path')
  .attr('d', d => areaPathGenerator(d.data)) 
  .attr('fill', d => d.color)
  .attr('fill-opacity', '0.42')

// Top Border For Area Paths
categoryGroups.append('path')   
  .attr('d', d => topBorderPathGenerator(d.data)) 
  .attr('stroke', d => d.color)
  .attr('stroke-width', '3')
  .attr('stroke-opacity', '0.92')
  .attr('fill', 'none')




// const baselineAreaPath = baselineGroup.append('path')    // builds area path
//   .attr('d', area(baselineData)) 
//   .attr('fill', colors.baseline)
//   .attr('fill-opacity', '0.42')

// const baselineTopPath = baselineGroup.append('path')   
//   .attr('d', topBorderPathGenerator(baselineData)) 
//   .attr('stroke', colors.baseline)
//   .attr('stroke-width', '3')
//   .attr('stroke-opacity', '0.92')
//   .attr('fill', 'none')

// const targetAreaPath = targetGroup.append('path')  // builds area path
//   .attr('d', area(targetData))
//   .attr('fill', colors.target)
//   .attr('fill-opacity', '0.42')

// const targetTopPath = targetGroup.append('path')  // builds area path
//   .attr('d', topBorderPathGenerator(targetData))
//   .attr('stroke', colors.target)
//   .attr('stroke-width', '3')
//   .attr('stroke-opacity', '0.92')
//   .attr('fill', 'none')

// const thisYearAreaPath = thisYearGroup.append('path') // builds area path
//   .attr('d', area(thisYearData))
//   .attr('fill', colors.thisYear)
//   .attr('fill-opacity', '0.42')

// const thisYearTopPath = thisYearGroup.append('path') // builds area path
//   .attr('d', topBorderPathGenerator(thisYearData))
//   .attr('stroke', colors.thisYear)
//   .attr('stroke-width', '3')
//   .attr('stroke-opacity', '0.92')
//   .attr('fill', 'none')


/* TOOLTIPS */
const tooltipGroup = d3.select('svg').append('g')
const tooltipRect = tooltipGroup.append('rect')
  .style('opacity', '0')
  .style('position', 'absolute')
  .attr('fill', 'white')
  .attr('fill-opacity', '.7')
  .attr('width', 85)
  .attr('height', 60)

const tooltipText = tooltipGroup.append('text').attr('dominant-baseline', 'hanging').style('font-weight', 'bold')

const monthTooltipText = tooltipText.append('tspan')
const baselineTooltipText = tooltipText.append('tspan').attr('fill', colors.baseline)
const targetTooltipText = tooltipText.append('tspan').attr('fill', colors.target)
const thisYearTooltipText = tooltipText.append('tspan').attr('fill', colors.thisYear)

d3.selectAll('.baseline .circle')
  .data(baselineData)
  .enter().append('circle')
    .attr('class', d => `baselineCircle ${d.month}`)
    .attr('fill', colors.baseline)
    .attr('stroke', 'white')
    .attr('stroke-width', 2.5)
    .attr('cx', (d, i) => xScale(parseDate(d.month + '-' + thisYearData[i].year)))
    .attr('cy', d => yScale(d.value))
    .attr('r', 5)
    .on('mouseover', function(d, i){
      d3.selectAll('.' + d.month)
        .attr('r', 8)
        .attr('stroke-width', '3.5')
      tooltipRect
        .style('opacity', '1')
        .attr('x', d3.event.pageX - 35) 
        .attr('y', d3.event.pageY - 50)
      monthTooltipText.text(`${d.month}:`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY - 49)
      baselineTooltipText.text(`BL: ${baselineData[i].value} kW/tR`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY -34)
      targetTooltipText.text(`TG: ${targetData[i].value} kW/tR`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY - 20)
      thisYearTooltipText.text(`AC: ${thisYearData[i].value} kW/tR`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY - 8)
    })
    .on('mouseout', function(d){
      d3.selectAll('.' + d.month)
        .attr('r', 5)
        .attr('stroke-width', '2.5')
      tooltipRect.style('opacity', '0')
      monthTooltipText.text('')
      baselineTooltipText.text('')
      targetTooltipText.text('')
      thisYearTooltipText.text('')
    })

d3.selectAll('.target .circle')
.data(targetData)
.enter().append('circle')
  .attr('class', d => `target circle ${d.month}`)
  .attr('fill', colors.target)
  .attr('stroke', 'white')
  .attr('stroke-width', 2.5)
  .attr('cx', (d, i) => xScale(parseDate(d.month + '-' + thisYearData[i].year)))
  .attr('cy', d => yScale(d.value))
  .attr('r', 5)
  .on('mouseover', function(d, i){
    d3.selectAll('.' + d.month)
      .attr('r', 8)
      .attr('stroke-width', '3.5')
    tooltipRect
      .style('opacity', '1')
      .attr('x', d3.event.pageX - 35) 
      .attr('y', d3.event.pageY - 50)
    monthTooltipText.text(`${d.month}:`)
      .attr('x', d3.event.pageX - 30) 
      .attr('y', d3.event.pageY - 49)
    baselineTooltipText.text(`BL: ${baselineData[i].value} kW/tR`)
      .attr('x', d3.event.pageX - 30) 
      .attr('y', d3.event.pageY -34)
    targetTooltipText.text(`TG: ${targetData[i].value} kW/tR`)
      .attr('x', d3.event.pageX - 30) 
      .attr('y', d3.event.pageY - 20)
    thisYearTooltipText.text(`AC: ${thisYearData[i].value} kW/tR`)
      .attr('x', d3.event.pageX - 30) 
      .attr('y', d3.event.pageY - 8)
  })
  .on('mouseout', function(d){
    d3.selectAll('.' + d.month)
      .attr('r', 5)
      .attr('stroke-width', '2.5')
    tooltipRect.style('opacity', '0')
    monthTooltipText.text('')
    baselineTooltipText.text('')
    targetTooltipText.text('')
    thisYearTooltipText.text('')
  })
  

d3.selectAll('.thisYear .circle')
  .data(thisYearData)
  .enter().append('circle')
    .attr('class', d => `thisYear circle ${d.month}`)
    .attr('fill', colors.thisYear)
    .attr('stroke', 'white')
    .attr('stroke-width', 2.5)
    .attr('cx', (d, i) => xScale(parseDate(d.month + '-' + thisYearData[i].year)))
    .attr('cy', d => yScale(d.value))
    .attr('r', 5)
    .on('mouseover', function(d, i){
      d3.selectAll('.' + d.month)
        .attr('r', 8)
        .attr('stroke-width', '3.5')
      tooltipRect
        .style('opacity', '1')
        .attr('x', d3.event.pageX - 35) 
        .attr('y', d3.event.pageY - 50)
      monthTooltipText.text(`${d.month}:`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY - 49)
      baselineTooltipText.text(`BL: ${baselineData[i].value} kW/tR`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY -34)
      targetTooltipText.text(`TG: ${targetData[i].value} kW/tR`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY - 20)
      thisYearTooltipText.text(`AC: ${thisYearData[i].value} kW/tR`)
        .attr('x', d3.event.pageX - 30) 
        .attr('y', d3.event.pageY - 8)
    })
    .on('mouseout', function(d){
      d3.selectAll('.' + d.month)
        .attr('r', 5)
        .attr('stroke-width', '2.5')
      tooltipRect.style('opacity', '0')
      monthTooltipText.text('')
      baselineTooltipText.text('')
      targetTooltipText.text('')
      thisYearTooltipText.text('')
    })






chartGroup.append('g')
  .attr('class', 'axis y')  // Due to convention, added classes 'axis' and 'y'
  .call(yAxis);  //to build an axis, call the axis generator on a group.

chartGroup.append('g')
  .attr('class', 'axis x')
  .attr('transform', `translate(0,${height})`)
  .call(xAxis);

const legend = chartGroup.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${0, width - legendWidth})`)

legend.append('rect')
  .attr('height', legendHeight)
  .attr('width', legendWidth)
  .attr('fill', 'white')
  .attr('y', -legendHeight)


const legendPadding = 5;
const allLegendPadding = legendPadding * 4;
const legendSquareSize = 11


const baselineLegendGroup = legend.append('g')
  .attr('class', 'baselineLegend category')
  .attr('transform', `translate(5, ${-legendHeight + legendPadding})`)
  .on('click', () => {
    const categoryOpacity = baselineActive ? 0 : 1
    const legendLineDecoration = baselineActive ? 'line-through' : 'none'
    d3.select('.baseline').style('opacity', categoryOpacity);
    d3.select('#baselineText').style('text-decoration', legendLineDecoration)
    baselineActive = !baselineActive
})

const targetLegendGroup = legend.append('g')
  .attr('class', 'targetLegend category')
  .attr('transform', `translate(5, ${-legendHeight + legendSquareSize + (legendPadding * 2)})`)
  .on('click', () => {
    const categoryOpacity = targetActive ? 0 : 1
    const legendLineDecoration = targetActive ? 'line-through' : 'none'
    d3.select('.target').style('opacity', categoryOpacity);
    d3.select('#targetText').style('text-decoration', legendLineDecoration)
    targetActive = !targetActive
})

const thisYearLegendGroup = legend.append('g')
  .attr('class', 'thisYearLegend category')
  .attr('transform', `translate(5, ${-legendHeight + (legendSquareSize * 2) + (legendPadding * 3)})`)
  .on('click', () => {
    const categoryOpacity = thisYearActive ? 0 : 1
    const legendLineDecoration = thisYearActive ? 'line-through' : 'none'
    d3.select('.thisYear').style('opacity', categoryOpacity);
    d3.select('#thisYearText').style('text-decoration', legendLineDecoration)
    thisYearActive = !thisYearActive
})

baselineLegendGroup.append('rect')
  .attr('height', legendSquareSize)
  .attr('width', legendSquareSize)
  .attr('fill', colors.baseline)


targetLegendGroup.append('rect')
  .attr('height', legendSquareSize)
  .attr('width', legendSquareSize)
  .attr('fill', colors.target)


thisYearLegendGroup.append('rect')
  .attr('height', legendSquareSize)
  .attr('width', legendSquareSize)
  .attr('fill', colors.thisYear)


baselineLegendGroup.append('text')
  .attr('id', 'baselineText')
  .text('Baseline')
  .attr('x', legendSquareSize + 10)
  .attr('y', legendSquareSize - 1)

targetLegendGroup.append('text')
  .attr('id', 'targetText')
  .text('Target')
  .attr('x', legendSquareSize + 10)
  .attr('y', legendSquareSize - 1)

thisYearLegendGroup.append('text')
  .attr('id', 'thisYearText')
  .text('This Year')
  .attr('x', legendSquareSize + 10)
  .attr('y', legendSquareSize - 1)



chartGroup.append('text')
  .attr("transform", "rotate(-90)")
  .attr('x', 0)
  .attr('y', 15)
  .attr("text-anchor", "middle")
  .style('font-weight', 'bold')
  .style('font-size', '9pt')
  .text('kW / tR')

