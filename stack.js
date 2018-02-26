var parseDate = d3.timeParse('%Y');

d3.xml('data2.xml').get(function (error, xml){

    var height = 200
    var width = 500
    var margin = {left: 50, right: 50, top: 40, bottom: 0}

    // makes array of objs with date, top, middle, and bottom properties
    xml = [].map.call(xml.querySelectorAll('dat'), d => {
        return {
            date: parseDate(d.getAttribute('id')),
            top: +d.querySelector('top').textContent,
            middle: +d.querySelector('middle').textContent,
            bottom: +d.querySelector('bottom').textContent
        }
    })
    console.log(xml)
    var x = d3.scaleTime()  // x scale generator
        .domain(d3.extent(xml, d => d.date))
        .range([0, width])

    var y = d3.scaleLinear()    //y scale generator
        .domain([0, d3.max(xml, d => d.top + d.middle + d.bottom)]) // stacked chart, so we need the sum of the heights
        .range([height, 0])

    var categories = ['top', 'middle', 'bottom'];

    //stack is a generator, therefore generates x and y coordinates, but because it's stack, it knows it needs to generate two y coordinates
    var stack = d3.stack().keys(categories)

    //area generator that uses x and y scales on data for determining coordinates
    var area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
    
    var svg = d3.select('body').append('svg').attr('width', '100%').attr('height', '100%')
    var chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

    //run stack generator to return arrays (with 2 coordinates inside) nested in 3 arrays (likely for top, middle, and bottom categories) nested in one array (that has a property of data with the original object data inside (e.g. date))
    var stacked = stack(xml);

    chartGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x)) // d3 v4 allows us to create x axis generator and call it while appending a group all on one line

    chartGroup.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y).ticks(5))  // adding ticks suggestion to this axis we're creating

    // chartGroup.selectAll('path.area')
    //     .data(stacked)
    //     .enter().append('path')
    //         .attr('class', 'area')
    //         .attr('d', d => area(d))

    chartGroup.selectAll('g.area')
        .data(stacked)  //for every item in 'stacked', append a group, and then into each group, append a path
        .enter().append('g')
            .attr('class', 'area')
        .append('path')     // directly append the path into the group
            .attr('class', 'area')
            .attr('d', d => area(d))    // note that the data point (d) bound to the parent element ('g') was able to be accessed by the child element ('path')
    
})