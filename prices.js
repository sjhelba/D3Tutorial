var parseDate = d3.timeParse('%m/%d/%Y')

d3.csv('prices.csv')
    // .row is optional and only available w/ certain fileTypes eg. not text or JSON). Here we're changing the date to a JS date and making it so that we're only taking the number from the price val (remember trim removes surrounding spaces and slice takes off the '$')
    .row(function(d) {return {month: parseDate(d.month), price: Number(d.price.trim().slice(1))}} )
    .get(function(error, data){

    var height = 300
    var width = 500

    // maxes and mins for scaling
    var max = d3.max(data, d => d.price)    // no corresponding min, bcz we want y axis 0
    var minDate = d3.min(data, d => d.month)
    var maxDate = d3.max(data, d => d.month)

    var y = d3.scaleLinear()    //y scale
        .domain([0, max])    //input
        .range([height,0])  //output inverted due to y starting at top

    var x = d3.scaleTime()    //x scale
        .domain([minDate, maxDate]) //could have used d3.extent there if wanted
        .range([0, width])  // output not inverted

    var yAxis = d3.axisLeft(y);     // define y axis using y scale
    var xAxis = d3.axisBottom(x);   // define x axis using x scale

    var svg = d3.select('body').append('svg').attr('height','100%').attr('width','100%')

    var margin = {left: 50, right: 50, top: 40, bottom: 0};

    var chartGroup = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
    
    var line = d3.line()    // path generator
        .x(d => x(d.month)) // return x value of d.month
        .y(d => y(d.price)) // return y value of d.price

    chartGroup.append('path').attr('d', line(data))    // run the path generator (line) on our data
    chartGroup.append('g')  // adding x axis
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);
    chartGroup.append('g').attr('class', 'y axis').call(yAxis);


})