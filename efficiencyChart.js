/* EXPOSED PROPERTIES */
actualTrendColor = 'rgb(39, 176, 71)'
baselineColor = 'rgb(44, 139, 246)'
targetColor = 'rgb(246, 159, 44)'
actualTrendFillOpacity = 0.42
baselineFillOpacity = 0.42
targetFillOpacity = 0.42
backgroundColor = 'white'
dataPointRadius = 5
dataPointStrokeWidth = 2.5
areaPathStrokeWidth = 3

unitsColor = 'black'
unitsFont = 'bold 10pt Nirmala UI'




xAxisFontColor = 'black'
yAxisFontColor = 'black'
legendFontColor = 'black'
xAxisFont = '9pt Nirmala UI'
yAxisFont = '10pt Nirmala UI'
legendFont = '10pt Nirmala UI'
tooltipFont = 'bold 10pt Nirmala UI'

tooltipPadding = 15
legendPadding = 5
legendSquareSize = 11


/* FROM widget.jq height and width minus some margin */
graphicHeight = 300
graphicWidth =  625
/* FROM widget.jq height and width minus some margin */

/* FROM THIS YEAR HISTORY TABLE */
unitsLabel = 'kW/tR'
precision = 2
/* FROM THIS YEAR HISTORY TABLE */



/* FAKE DATA */
const data = {
    baselineData: [{"month":"Jan","year":"2017","value":1.05},{"month":"Feb","year":"2017","value":1.10},{"month":"Mar","year":"2017","value":1.01},
    {"month":"Apr","year":"2017","value":0.95},{"month":"May","year":"2017","value":0.98},{"month":"Jun","year":"2017","value":0.95},
    {"month":"Jul","year":"2017","value":0.92},{"month":"Aug","year":"2017","value":0.94},{"month":"Sep","year":"2017","value":0.98},
    {"month":"Oct","year":"2017","value":1.08},{"month":"Nov","year":"2017","value":1.05},{"month":"Dec","year":"2017","value":0.99}],

    targetData: [{"month":"Jan","year":"2017","value":0.68},{"month":"Feb","year":"2017","value":0.62},{"month":"Mar","year":"2017","value":0.69},
    {"month":"Apr","year":"2017","value":0.68},{"month":"May","year":"2017","value":0.71},{"month":"Jun","year":"2017","value":0.68},
    {"month":"Jul","year":"2017","value":0.72},{"month":"Aug","year":"2017","value":0.68},{"month":"Sep","year":"2017","value":0.71},
    {"month":"Oct","year":"2017","value":0.78},{"month":"Nov","year":"2017","value":0.80},{"month":"Dec","year":"2017","value":0.76}],

    actualData: [{"month":"Jan","year":"2017","value":0.55},{"month":"Feb","year":"2017","value":0.65},{"month":"Mar","year":"2017","value":0.62},
    {"month":"Apr","year":"2017","value":0.65},{"month":"May","year":"2017","value":0.69},{"month":"Jun","year":"2017","value":0.61},
    {"month":"Jul","year":"2017","value":0.68},{"month":"Aug","year":"2017","value":0.72},{"month":"Sep","year":"2017","value":0.68},
    {"month":"Oct","year":"2017","value":0.78},{"month":"Nov","year":"2017","value":0.67},{"month":"Dec","year":"2017","value":0.56},
  
    {"month":"Jan","year":"2018","value":0.55},{"month":"Feb","year":"2018","value":0.65},{"month":"Mar","year":"2018","value":0.62}
  ]
}





/* DEFINITION SETUP */
const legendHeight = 0.166 * graphicHeight || 50
const legendWidth = 0.128 * graphicWidth || 80

const chartHeight = 0.66 * graphicHeight || 200
const chartWidth = 0.88 * graphicWidth || 550

// if '/' in units name, format xAxisUnitsLabel to have spaces around '/' and unitsLabel (for tooltip) not to
let indexOfSlash = unitsLabel.indexOf('/');
let xAxisUnitsLabel = unitsLabel;
if (indexOfSlash > 0) {
  if (unitsLabel[indexOfSlash + 1] === ' ') unitsLabel.splice(indexOfSlash + 1, 1);
  if (unitsLabel[indexOfSlash - 1] === ' ') unitsLabel.splice(indexOfSlash - 1, 1);
  indexOfSlash = unitsLabel.indexOf('/');
  xAxisUnitsLabel = unitsLabel;
  if (unitsLabel[indexOfSlash + 1] !== ' ') xAxisUnitsLabel = unitsLabel.slice(0,indexOfSlash + 1) + ' ' + unitsLabel.slice(indexOfSlash + 1);
  if (unitsLabel[indexOfSlash - 1] !== ' ') xAxisUnitsLabel = xAxisUnitsLabel.slice(0,indexOfSlash) + ' ' + xAxisUnitsLabel.slice(indexOfSlash);
}


const colors = {baseline: baselineColor, target: targetColor, actual: actualTrendColor}

const margin = {left: 50, right: 50, top: 5 + legendHeight, bottom: 0}  //will be used in terms of pixels (convention to call margin)


// function that makes '3 digit month'-'4 digit year' into JS date
const parseDate = d3.timeParse('%b-%Y')
// function that makes history timestamp into JS date
const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');


const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
};


const [last12Months, last12Dates] = getDatesOfLast12Months(currentMonthIndex, currentFullYear);  // formatted [['Dec', 'Jan', ...etc], ['Dec-2017', 'Jan-2018', ...etc]]

const sortUpToCurrentMonth = (a, b) => last12Months.indexOf(a.month) - last12Months.indexOf(b.month)


const actualData = data.actualData.slice(-12)
const baselineData = data.baselineData.sort(sortUpToCurrentMonth)
const targetData = data.targetData.sort(sortUpToCurrentMonth)

const actualTrendsValues = actualData.map(data => data.value);
const baselineValues = baselineData.map(data => data.value);
const targetValues = targetData.map(data => data.value);

const allValues = baselineValues.concat(actualTrendsValues, targetValues);
const range = d3.extent(allValues);


const highestYtick = range[1] + 0.2;
const yTickInterval = highestYtick / 4;

const yTickValues = [0, yTickInterval, yTickInterval * 2, yTickInterval * 3, highestYtick];


const enterData = [
  {category: 'baseline', displayName: 'Baseline', color: colors.baseline, opacity: baselineFillOpacity, data: baselineData, active: true},
  {category: 'target', displayName: 'Target', color: colors.target, opacity: targetFillOpacity, data: targetData, active: true},
  {category: 'actual', displayName: 'Actual', color: colors.actual, opacity: actualTrendFillOpacity, data: actualData, active: true}
]








/* SCALES AND GENERATORS */
const yScale = d3.scaleLinear()  // scaling function
  .domain([0, 0.2 + range[1]]) //can be whatever you want the axis to cover
  .range([chartHeight, 0])

const xScale = d3.scaleTime()  // scaling function
  .domain([parseDate(last12Dates[0]), parseDate(last12Dates[11])])  // [min, max] data Month-Year's as JS dates
  .range([0, chartWidth])

const yAxisGenerator = d3.axisLeft(yScale)  // axis generator (axis labels can be left, right, top, bottom in relation to line).
  .tickValues(yTickValues)  //Adding 'ticks' gives guidance to D3 for apprx number of ticks you want. It will generate a similar number of ticks that typically makes sense to humans (e.g. 5s or 10s). You can override this and tell it the exact number you want with a setting called tick values
  .tickPadding(10)  // on axisLeft, moves labels further from ticks
  .tickSize(10) //plenty more tick settings out there
  .tickFormat(d => d3.format(`,.${precision}f`)(d));

const xAxisGenerator = d3.axisBottom(xScale) //axis generator
  .tickFormat(d3.timeFormat('%b-%y'))

const areaPathGenerator = d3.area()  // area generator (generates path element)
  .x((d, i) => xScale(parseDate(d.month + '-' + actualData[i].year)))  //data points on chart will be determined by scaling func, passing in date-parsed data element (i of dataYears) -- so that it matches up with x-axis scale
  .y0(chartHeight) //bottom line of area ( where x axis would go for most area charts)
  .y1((d, i) => yScale(d.value)) //top line of area (we'd take d off of the height because y works upside down by default if we did this w/o scale). y(d) is outputting the literal y position the datapoint should be in
  .curve(d3.curveCardinal)

const topBorderPathGenerator = d3.line()
  .x((d, i) => xScale(parseDate(d.month + '-' + actualData[i].year)))
  .y((d, i) => yScale(d.value))
  .curve(d3.curveCardinal)




/* INITIALIZATION */
const svg = d3.select('body').append('svg').attr('height', '100%').attr('width', '100%')
const backgroundRect = svg.append('rect').attr('height', graphicHeight).attr('width', graphicWidth).attr('fill', backgroundColor).attr('stroke', 'black')
const chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)  //We shifted the whole chart because otherwise the y axis labels were to the left of 0px x, and so we needed to push the axis over (also we wanted to push it further down so it'd be easier to see).





/* PATHS */
// Groups for Category Paths
const categoryGroups = chartGroup.selectAll('path')
  .data(enterData)
  .enter().append('g').attr('class', d => d.category);

// Area Paths
categoryGroups.append('path')
  .attr('d', d => areaPathGenerator(d.data)) 
  .attr('fill', d => d.color)
  .attr('fill-opacity', d => d.opacity)

// Top Border For Area Paths
categoryGroups.append('path')   
  .attr('d', d => topBorderPathGenerator(d.data)) 
  .attr('stroke', d => d.color)
  .attr('stroke-width', areaPathStrokeWidth)
  .attr('stroke-opacity', '0.92')
  .attr('fill', 'none')





/* TOOLTIPS */
// (note event listeners that define many tooltip properties are in datapoints section)
const tooltipRectWidth = chartWidth * 0.19 || 105;
const tooltipRectHeight = chartHeight * 0.35 || 70;
const tooltipGroup = d3.select('svg').append('g')
const tooltipRect = tooltipGroup.append('rect')
  .attr('display', 'none')
  .style('position', 'absolute')
  .attr('fill', 'white')
  .attr('fill-opacity', '.9')
  .attr('width', tooltipRectWidth)
  .attr('height', tooltipRectHeight)

// tooltips text
const tooltipText = tooltipGroup.append('text').attr('dominant-baseline', 'hanging').style('font', tooltipFont)
const monthTspan = tooltipText.append('tspan').attr('id', 'monthTspan')
tooltipText.selectAll('.value')
  .data(enterData)
  .enter().append('tspan')
    .attr('class', 'value')
    .attr('id', d => `${d.category}Tspan`)
    .attr('fill', d => d.color);
const baselineTspan = d3.select('#baselineTspan');
const targetTspan = d3.select('#targetTspan');
const actualTspan = d3.select('#actualTspan');






/* AXES */
chartGroup.append('g')
  .attr('class', 'axisY')
  .call(yAxisGenerator);

chartGroup.append('g')
  .attr('class', 'axisX')
  .attr('transform', `translate(0,${chartHeight})`)
  .call(xAxisGenerator);

d3.selectAll('.axisY text').style('fill', yAxisFontColor).style('font', yAxisFont)
d3.selectAll('.axisX text').style('fill', xAxisFontColor).style('font', xAxisFont)


chartGroup.append('text')
  .attr("transform", "rotate(-90)")
  .attr('x', 0)
  // .attr('y', 0)
  .attr("text-anchor", "middle")
  .attr('dominant-baseline', 'hanging')
  .style('font', unitsFont)
  .attr('fill', unitsColor)
  .text(xAxisUnitsLabel)






  
/* DATAPOINTS */
// groups of datapoints
const dataPointsGroups = chartGroup.selectAll('circle')
  .data(enterData)
  .enter().append('g').attr('class', d => `${d.category} dataPointGroup`);

// datapoints
dataPointsGroups.selectAll('.circle')
  .data(d => d.data) //get data arrays within each 'enterData' array element
  .enter().append('circle')
    .attr('class', (d, i, node) => `${node[i].parentNode.__data__.category}Circle ${d.month} circle`)
    .attr('fill', (d, i, node) => node[i].parentNode.__data__.color)
    .attr('stroke', 'white')
    .attr('stroke-width', dataPointStrokeWidth)
    .attr('cx', (d, i) => xScale(parseDate(d.month + '-' + actualData[i].year)))
    .attr('cy', d => yScale(d.value))
    .attr('r', dataPointRadius);

// rectangles for each month with event listeners to toggle TOOLTIPS and to toggle datapoints' highlighting
const monthRectWidth = xScale(parseDate(actualData[1].month + '-' + actualData[1].year)) - xScale(parseDate(actualData[0].month + '-' + actualData[0].year));
chartGroup.selectAll('.monthRect')
  .data(actualData)
  .enter().append('rect')
    .attr('class', d => `monthRect ${d.month}Rect`)
    .attr('height', chartHeight)
    .attr('width', monthRectWidth)
    .attr('x', d => xScale(parseDate(d.month + '-' + d.year)) - (monthRectWidth / 2))
    .attr('y', 0)
    .style('opacity', '0')
    .on('mouseover', function (d, i) {
      let xPos = Number(d3.select(this).attr('x')) + (tooltipRectWidth / 2.5);
      xPos = xPos < margin.left ? margin.left + 5: xPos;
      xPos = xPos + tooltipRectWidth > margin.left + chartWidth ? margin.left + chartWidth - tooltipRectWidth : xPos;
      const yPos = chartHeight + margin.top - tooltipRectHeight;
      d3.selectAll('.' + d.month)
        .attr('r', dataPointRadius * 1.5)
        .attr('stroke-width', dataPointStrokeWidth * 1.5)
      tooltipRect
        .attr('display', 'block')
        .attr('x', xPos - 5) 
        .attr('y', yPos - 2)
      monthTspan.text(`${d.month}:`)
        .attr('x', xPos)
        .attr('y', yPos - 2)
      baselineTspan.text(`BL: ${baselineData[i].value} ${unitsLabel}`)
        .attr('x', xPos)
        .attr('y', yPos + tooltipPadding)
      targetTspan.text(`TG: ${targetData[i].value} ${unitsLabel}`)
        .attr('x', xPos)
        .attr('y', yPos + (tooltipPadding * 2))
      actualTspan.text(`AC: ${actualData[i].value} ${unitsLabel}`)
        .attr('x', xPos)
        .attr('y', yPos + (tooltipPadding * 3))
    })
    .on('mouseout', function(d, i) {
      d3.selectAll('.' + d.month)
        .attr('r', dataPointRadius)
        .attr('stroke-width', dataPointStrokeWidth)
      tooltipRect.attr('display', 'none')
        monthTspan.text('')
        baselineTspan.text('')
        targetTspan.text('')
        actualTspan.text('')
    })









/* LEGEND */
const legend = chartGroup.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${0, chartWidth - legendWidth})`)

// legend box
legend.append('rect')
  .attr('height', legendHeight)
  .attr('width', legendWidth)
  .attr('fill', backgroundColor)
  .attr('y', -legendHeight)


// create groups for each category with click listeners to toggle hide and hover listeners to toggle bold text
const legendCategories = legend.selectAll('g')
  .data(enterData)
  .enter().append('g')
    .attr('class', d => `${d.category}Legend category`)
    .attr('transform', (d, i) => `translate(5, ${-legendHeight + (legendSquareSize * i) + (legendPadding * (i + 1)) })`)
    .on('click', (d, i) => {
      const categoryOpacity = d.active ? 0 : 1
      const legendLineDecoration = d.active ? 'line-through' : 'none'
      d3.selectAll(`.${d.category}`).style('opacity', categoryOpacity);
      d3.select(`#${d.category}Text`).style('text-decoration', legendLineDecoration)
      d.active = !d.active
    })
    .on('mouseover', function(d){
      d3.select(`#${d.category}Text`).style('font-weight', 'bold')
    })
    .on('mouseout', function(d){
      d3.select(`#${d.category}Text`).style('font-weight', 'normal')
    })


// append rect for each category group
legendCategories.append('rect')
  .attr('height', legendSquareSize)
  .attr('width', legendSquareSize)
  .attr('fill', d => d.color)

// append text for each category group
legendCategories.append('text')
  .attr('id', d => `${d.category}Text`)
  .text(d => d.displayName)
  .attr('x', legendSquareSize + 10)
  .attr('y', legendSquareSize - 1)
  .attr('fill', legendFontColor)
  .style('font', legendFont);


