var height = 200;
var width = 500;
var margin = {left: 50, right: 50, top: 40, bottom: 0}

var tree = d3.tree().size([width, height])

var svg = d3.select('body').append('svg').attr('width', '100%').attr('height', '100%')
var chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

//we haven't created this json file, so won't work:
d3.json('treeData.json').get(function(error, data) {
    var root = d3.hierarchy(data[0])

    tree(root); //Before you can use the tree layout, you have to run d3.hierarchy() on hierarchical data (like JSON) or d3.stratify() on tabular data
    chartGroup.selectAll('circle')
        .data(root.descendants())
        .enter().append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', '5')


    chartGroup.selectAll('path')
        .data(root.descendants().slice(1))
        .enter().append('path')
            .attr('class', 'link')
            .attr('d', d => `M${d.x},${d.y}L${d.parent.x},${d.parent.y}`)
        
})