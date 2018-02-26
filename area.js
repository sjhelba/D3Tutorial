var dataArray = [25, 26, 28, 32, 37, 45, 55, 70, 90, 120, 135, 150, 160, 168, 172, 177, 180]

var dataYears = ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016']

// function that makes a 4 digit yr string into date
var parseDate = d3.timeParse('%Y')  // (other dates eg ('%y') = 2 digit yr)

var height = 200
var width = 500

var margin = {left: 50, right: 50, top: 40, bottom: 0}  //will be used in terms of pixels (convention to call margin)

var y = d3.scaleLinear()  // scaling function
  .domain([0, d3.max(dataArray)]) //can be whatever you want the axis to cover
  .range([height, 0])

var x = d3.scaleTime()  // scaling function
  .domain(d3.extent(dataYears, d => parseDate(d)))  // [min, max] dataYears as JS dates
  .range([0, width])

var yAxis = d3.axisLeft(y)  // axis generator (axis labels can be left, right, top, bottom in relation to line).
  .ticks(3)  //Adding 'ticks' gives guidance to D3 for apprx number of ticks you want. It will generate a similar number of ticks that typically makes sense to humans (e.g. 5s or 10s). You can override this and tell it the exact number you want with a setting called tick values
  .tickPadding(10)  // on axisLeft, moves labels further from ticks
  .tickSize(10) //plenty more tick settings out there

var xAxis = d3.axisBottom(x); //axis generator

var area = d3.area()  // area generator (generates path element)
  .x((d, i) => x(parseDate(dataYears[i])))  //data points on chart will be determined by scaling func, passing in date-parsed data element (i of dataYears) -- so that it matches up with x-axis scale
  .y0(height) //bottom line of area ( where x axis would go for most area charts)
  .y1(d => y(d)) //top line of area (we'd take d off of the height because y works upside down by default if we did this w/o scale). y(d) is outputting the literal y position the datapoint should be in

var svg = d3.select('body').append('svg').attr('height', '100%').attr('width', '100%')

var chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)  //We shifted the whole chart because otherwise the y axis labels were to the left of 0px x, and so we needed to push the axis over (also we wanted to push it further down so it'd be easier to see).

chartGroup.append('path').attr('d', area(dataArray)) // builds area path

chartGroup.append('g')
  .attr('class', 'axis y')  // Due to convention, added classes 'axis' and 'y'
  .call(yAxis);  //to build an axis, call the axis generator on a group.

chartGroup.append('g')
  .attr('class', 'axis x')
  .attr('transform', `translate(0,${height})`)
  .call(xAxis);

