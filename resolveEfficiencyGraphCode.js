define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/tekScratch/rc/d3/d3.min'], function (Widget, subscriberMixIn, d3) {
    "use strict";

    ////////////////////////////////////////////////////////////////
    // Define Widget Constructor & Add Exposed Properties
    ////////////////////////////////////////////////////////////////
	
    alert('version 7');
    
    // function that makes '3 digit month'-'4 digit year' into JS date
    const parseDate = d3.timeParse('%b-%Y');


    var ModernEfficiencyGraph = function () {        
        var that = this;
        Widget.apply(this, arguments);

        that.properties().addAll([
            {
                name: 'actualTrendColor',
                value: 'rgb(39, 176, 71)',
                typeSpec: 'gx:Color'
            },
            {
                name: 'baselineColor',
                value: 'rgb(44, 139, 246)',
                typeSpec: 'gx:Color'
            },
            {
                name: 'targetColor',
                value: 'rgb(246, 159, 44)',
                typeSpec: 'gx:Color'
            },
            {
                name: 'actualTrendFillOpacity',
                value: 0.42
            },
            {
                name: 'baselineFillOpacity',
                value: 0.42
            },
            {
                name: 'targetFillOpacity',
                value: 0.42
            },
            {
                name: 'backgroundColor',
                value: 'white',
                typeSpec: 'gx:Color'
            },
            {
                name: 'tooltipFill',
                value: 'white',
                typeSpec: 'gx:Color'
            },
            {
                name: 'dataPointRadius',
                value: 5
            },
            {
                name: 'dataPointStrokeWidth',
                value: 2.5
            },
            {
                name: 'areaPathStrokeWidth',
                value: 3
            },
            {
                name: 'unitsColor',
                value: 'black',
                typeSpec: 'gx:Color'
            },
            {
                name: 'unitsFont',
                value: 'bold 10pt Nirmala UI',
                typeSpec: 'gx:Font'
            },
            {
                name: 'xAxisFontColor',
                value: 'black',
                typeSpec: 'gx:Color'
            },
            {
                name: 'yAxisFontColor',
                value: 'black',
                typeSpec: 'gx:Color'
            },
            {
                name: 'legendFontColor',
                value: 'black',
                typeSpec: 'gx:Color'
            },
            {
                name: 'xAxisFont',
                value: '9pt Nirmala UI',
                typeSpec: 'gx:Font'
            },
            {
                name: 'yAxisFont',
                value: '10pt Nirmala UI',
                typeSpec: 'gx:Font'
            },
            {
                name: 'legendFont',
                value: '10pt Nirmala UI',
                typeSpec: 'gx:Font'
            },
            {
                name: 'tooltipFont',
                value: 'bold 10pt Nirmala UI',
                typeSpec: 'gx:Font'
            },
            {
                name: 'tooltipPadding',
                value: 15
            },
            {
                name: 'legendPadding',
                value: 5
            },
            {
                name: 'legendSquareSize',
                value: 11
            },
            {
                name: 'baselineHistoryOrd',
                value: 'history:^SystemAnnualEfficiencyBaseline',
                typeSpec: 'baja:Ord'
            },
            {
                name: 'targetHistoryOrd',
                value: 'history:^SystemAnnualEfficiencyTarget',
                typeSpec: 'baja:Ord'
            },
            {
                name: 'actualTrendHistoryOrd',
                value: 'history:^SystemEfficiencyMeasured',
                typeSpec: 'baja:Ord'
            }
        ]);

        subscriberMixIn(that);
    };

    ModernEfficiencyGraph.prototype = Object.create(Widget.prototype);
    ModernEfficiencyGraph.prototype.constructor = ModernEfficiencyGraph;


    ////////////////////////////////////////////////////////////////
    // /* SETUP DEFINITIONS */
    ////////////////////////////////////////////////////////////////

    const widgetProperties = [
        'actualTrendColor','baselineColor','targetColor','actualTrendFillOpacity','baselineFillOpacity','targetFillOpacity','backgroundColor',
        'dataPointRadius','dataPointStrokeWidth','areaPathStrokeWidth','unitsColor','unitsFont','xAxisFontColor','yAxisFontColor','legendFontColor',
        'xAxisFont','yAxisFont','legendFont','tooltipFont','tooltipPadding','legendPadding','legendSquareSize','baselineHistoryOrd','targetHistoryOrd',
        'actualTrendHistoryOrd','tooltipFill'
    ];

    const setupDefinitions = widget => {
        const data = {};
        // FROM USER // 
        widgetProperties.forEach(prop => { data[prop] = widget.properties().getValue(prop); });

        // FROM JQ //
        const jq = widget.jq();
        data.graphicWidth = jq.width() * 0.95 || 625;
        data.graphicHeight = jq.height() * 0.95 || 300;

        // DEFINITIONS CALCULATED FROM USER AND JQ PROPERTIES //
        data.legendHeight = 0.166 * data.graphicHeight || 50;
        data.legendWidth = 0.128 * data.graphicWidth || 80;

        data.margin = {left: data.graphicWidth * 0.12 || 75, right: data.graphicWidth * 0.12 || 75, top: 5 + data.legendHeight, bottom: 0};  //will be used in terms of pixels (convention to call margin)
        
        data.chartHeight = 0.66 * data.graphicHeight || 200;
        data.chartWidth = 0.88 * data.graphicWidth - data.margin.left || 550;



        // GATHER AND FORMAT MONTHLY DATA //
        data.baselineData = [];
        data.targetData = [];
        data.actualData = [];

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        const currentFullYear = today.getFullYear();
        const currentMonthIndex = today.getMonth();

        const getDatesOfLast12Months = (monthIndex, currentYear) => {
            const datesArray = [];
            let pointer = monthIndex;
            for (let count = 12; count > 0; count--) {
                if (pointer >= 0) {
                    data.baselineData.unshift({month: months[pointer], value: 0, count: 0, total: 0});
                    data.targetData.unshift({month: months[pointer], value: 0, count: 0, total: 0});
                    data.actualData.unshift({month: months[pointer], year: currentYear, value: 0, count: 0, total: 0});
                    datesArray.unshift(months[pointer] + '-' + currentYear);
                } else {
                    data.baselineData.unshift({month: months[months.length + pointer], value: 0, count: 0, total: 0});
                    data.targetData.unshift({month: months[months.length + pointer], value: 0, count: 0, total: 0});
                    data.actualData.unshift({month: months[months.length + pointer], year: currentYear - 1, value: 0, count: 0, total: 0});
                    datesArray.unshift(months[months.length + pointer] + '-' + (currentYear - 1));
                }
                pointer--;
            }
            return datesArray;
        };


        data.last12Dates = getDatesOfLast12Months(currentMonthIndex, currentFullYear);  // formatted ['Dec-2017', 'Jan-2018', ...etc]
        data.last12DatesSeperated = data.last12Dates.map(date => {
            const splitDate = date.split('-');
            return {month: splitDate[0].toUpperCase(), year: splitDate[1].slice(2)};
        }); // formatted as [ {month: 'DEC', year: '17'}, {month: 'JAN', year: '18'}, ...etc ]
        

        // GET HISTORY DATA //
        return widget.resolve(data.actualTrendHistoryOrd)
            .then(actualTrendTable => {
                // get facets off of 'actualTrend' table
                const facets = actualTrendTable.getCol('value').getFacets();
                data.unitsLabel = facets.get('units').toString() || 'Fake Units';                
                data.precision = facets.get('precision');

                //get data off of table
                return actualTrendTable.cursor({
                    limit: 700000,  // default is 10
                    each: function (row, index) {
                      const timestamp = row.get('timestamp').toString().toUpperCase();
                      const rowYear = timestamp.slice(7,9);
                      const rowValue = row.get('value');

                      data.last12DatesSeperated.forEach((date, index) => {
                        if (rowYear === date.year && timestamp.indexOf(date.month)) {
                            data.actualData[index].count++;
                            data.actualData[index].total += rowValue;
                        }
                      });
                    }
                  });
            })
            .then(() => widget.resolve(data.baselineHistoryOrd))
            .then(baselineTrendTable => {
                return baselineTrendTable.cursor({
                    limit: 700000,  // default is 10
                    each: function (row, index) {
                    const timestamp = row.get('timestamp').toString().toUpperCase();
                    const rowValue = row.get('value');

                    data.last12DatesSeperated.forEach((date, index) => {
                        if (timestamp.indexOf(date.month)) {
                            data.baselineData[index].count++;
                            data.baselineData[index].total += rowValue;
                        }
                    });
                    }
                });
            })
            .then(() => widget.resolve(data.targetHistoryOrd))
            .then(targetTrendTable => {
                return targetTrendTable.cursor({
                    limit: 10,  // default is 10            // // // //// // // //// // CHANGE BACK TO 70000  // // // //// // // //// // // //// // // //
                    each: function (row, index) {
                    const timestamp = row.get('timestamp').toString().toUpperCase();
                    const rowValue = row.get('value');

                    data.last12DatesSeperated.forEach((date, index) => {
                        if (timestamp.indexOf(date.month)) {
                            data.targetData[index].count++;
                            data.targetData[index].total += rowValue;
                            if (date.month === 'MAR') {alert('matched target month. Updated this month\'s obj to: ' + data.targetData[index].month + ' ' + data.targetData[index].total);}
                        }
                    });
                    }
                });
            })
            .then(() => {   // UTILIZE ACCUMULATED DATA AND RETURN DATA OBJECT TO PASS TO RENDER FUNC //
                data.last12DatesSeperated.forEach((date, index) => {
                    alert('targetData Obj:' + 'total: ' + data.targetData[index].total + 'count: ' + data.targetData[index].count);
                    data.targetData[index].value = data.targetData[index].total / data.targetData[index].count || 0;
                    data.baselineData[index].value = data.baselineData[index].total / data.baselineData[index].count || 0;
                    data.actualData[index].value = data.actualData[index].total / data.actualData[index].count || 0;
                });
                data.actualTrendsValues = data.actualData.map(data => data.value);
                data.baselineValues = data.baselineData.map(data => data.value);
                data.targetValues = data.targetData.map(data => data.value);

                const allValues = data.baselineValues.concat(data.actualTrendsValues, data.targetValues);
                data.range = d3.extent(allValues);

                const highestYtick = data.range[1] + 0.2;
                data.yTickInterval = highestYtick / 4;
                data.yTickValues = [0, data.yTickInterval, data.yTickInterval * 2, data.yTickInterval * 3, highestYtick];

                data.enterData = [
                    {category: 'baseline', displayName: 'Baseline', color: data.baselineColor, opacity: data.baselineFillOpacity, data: data.baselineData, active: true},
                    {category: 'target', displayName: 'Target', color: data.targetColor, opacity: data.targetFillOpacity, data: data.targetData, active: true},
                    {category: 'actual', displayName: 'Actual', color: data.actualTrendColor, opacity: data.actualTrendFillOpacity, data: data.actualData, active: true}
                ];
            
            
            // if '/' in unit's name, format xAxisUnitsLabel to have spaces around '/' and unitsLabel (for tooltip) not to
            let indexOfSlash = data.unitsLabel.indexOf('/');
	        data.xAxisUnitsLabel = data.unitsLabel;
	
	        if (indexOfSlash > 0) {
	            if (data.unitsLabel[indexOfSlash + 1] === ' ') data.unitsLabel.splice(indexOfSlash + 1, 1);
	            if (data.unitsLabel[indexOfSlash - 1] === ' ') data.unitsLabel.splice(indexOfSlash - 1, 1);
	            indexOfSlash = data.unitsLabel.indexOf('/');
	            data.xAxisUnitsLabel = data.unitsLabel;
	            if (data.unitsLabel[indexOfSlash + 1] !== ' ') data.xAxisUnitsLabel = data.unitsLabel.slice(0,indexOfSlash + 1) + ' ' + data.unitsLabel.slice(indexOfSlash + 1);
	            if (data.unitsLabel[indexOfSlash - 1] !== ' ') data.xAxisUnitsLabel = data.xAxisUnitsLabel.slice(0,indexOfSlash) + ' ' + data.xAxisUnitsLabel.slice(indexOfSlash);
	        }
            
            alert('actualData: ' + 'month: ' + data.actualData[11].month + 'value: ' + data.actualData[11].value);
            alert('targetData: ' + 'month: ' + data.targetData[11].month + 'value: ' + data.targetData[11].value);
            alert('baselineData: ' + 'month: ' + data.baselineData[11].month + 'value: ' + data.baselineData[11].value);

            return data;
        })
        .catch(err => alert('Ords not correctly set up. Causing error: ' + err));
    };




    ////////////////////////////////////////////////////////////////
    // Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
    ////////////////////////////////////////////////////////////////

    const renderWidget = data => {
        /* RENDER INITIALIZATION */
        const svg = d3.select('svg');
        
        
        // delete leftover elements from versions previously rendered
        if (!svg.empty()) d3.selectAll('svg > *').remove();
        
        
        const backgroundRect = svg.append('rect')
            .attr('height', data.graphicHeight)
            .attr('width', data.graphicWidth)
            .attr('fill', data.backgroundColor)
            
            .attr('stroke', 'black');				// X!X!X!X!X!X!X!X!X!X!XX!X!X!X!X   REMOVE ONCE WORKING   X!X!X!X!X!X!X!X!X!X!X!X!X!X
            
        const chartGroup = svg.append('g').attr('class', 'chartGroup').attr('transform', `translate(${data.margin.left}, ${data.margin.top})`);  



/************************************************* ADD ALL SVG ELEMENTS HERE **********************************************************/
        /* SCALES AND GENERATORS */
        const yScale = d3.scaleLinear()  // scaling function
            .domain([0, 0.2 + data.range[1]]) //can be whatever you want the axis to cover
            .range([data.chartHeight, 0]);

        const xScale = d3.scaleTime()  // scaling function
            .domain([parseDate(data.last12Dates[0]), parseDate(data.last12Dates[11])])  // [min, max] data Month-Year's as JS dates
            .range([0, data.chartWidth]);

        const yAxisGenerator = d3.axisLeft(yScale)  // axis generator (axis labels can be left, right, top, bottom in relation to line).
            .tickValues(data.yTickValues)  //Adding 'ticks' gives guidance to D3 for apprx number of ticks you want. It will generate a similar number of ticks that typically makes sense to humans (e.g. 5s or 10s). You can override this and tell it the exact number you want with a setting called tick values
            .tickPadding(10)  // on axisLeft, moves labels further from ticks
            .tickSize(10) //plenty more tick settings out there
            .tickFormat(d => d3.format(`,.${data.precision}f`)(d));

        const xAxisGenerator = d3.axisBottom(xScale) //axis generator
            .tickFormat(d3.timeFormat('%b-%y'));

        const areaPathGenerator = d3.area()  // area generator (generates path element)
            .x((d, i) => xScale(parseDate(d.month + '-' + data.actualData[i].year)))  //data points on chart will be determined by scaling func, passing in date-parsed data element (i of dataYears) -- so that it matches up with x-axis scale
            .y0(data.chartHeight) //bottom line of area ( where x axis would go for most area charts)
            .y1(d => yScale(d.value)) //top line of area (we'd take d off of the height because y works upside down by default if we did this w/o scale). y(d) is outputting the literal y position the datapoint should be in
            .curve(d3.curveCardinal);

        const topBorderPathGenerator = d3.line()
            .x((d, i) => xScale(parseDate(d.month + '-' + data.actualData[i].year)))
            .y(d => yScale(d.value))
            .curve(d3.curveCardinal);




        /* PATHS */
        // Groups for Category Paths
        const categoryGroups = chartGroup.selectAll('path')
            .data(data.enterData)
            .enter().append('g').attr('class', d => d.category);

        // Area Paths
        categoryGroups.append('path')
            .attr('d', d => areaPathGenerator(d.data)) 
            .attr('fill', d => d.color)
            .attr('fill-opacity', d => d.opacity);

        // Top Border For Area Paths
        categoryGroups.append('path')   
            .attr('d', d => topBorderPathGenerator(d.data)) 
            .attr('stroke', d => d.color)
            .attr('stroke-width', data.areaPathStrokeWidth)
            .attr('stroke-opacity', '0.92')
            .attr('fill', 'none');





        /* TOOLTIPS */
        // (note event listeners that define many tooltip properties are in datapoints section)
        const tooltipRectWidth = data.chartWidth * 0.19 || 105;
        const tooltipRectHeight = data.chartHeight * 0.35 || 70;
        const tooltipGroup = svg.append('g');
        const tooltipRect = tooltipGroup.append('rect')
            .attr('display', 'none')
            .style('position', 'absolute')
            .attr('fill', data.tooltipFill)
            .attr('fill-opacity', '.9')
            .attr('width', tooltipRectWidth)
            .attr('height', tooltipRectHeight);

        // tooltips text
        const tooltipText = tooltipGroup.append('text').attr('dominant-baseline', 'hanging').style('font', data.tooltipFont);
        const monthTspan = tooltipText.append('tspan').attr('id', 'monthTspan');
        tooltipText.selectAll('.value')
            .data(data.enterData)
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
            .attr('transform', `translate(0,${data.chartHeight})`)
            .call(xAxisGenerator);

        d3.selectAll('.axisY text').style('fill', data.yAxisFontColor).style('font', data.yAxisFont);
        d3.selectAll('.axisX text').style('fill', data.xAxisFontColor).style('font', data.xAxisFont);


        chartGroup.append('text')
            .attr("transform", "rotate(-90)")
            .attr('x', 0)
            .attr('y', data.margin.left + (data.chartWidth * 0.013))
            .attr("text-anchor", "middle")
            .style('font', data.unitsFont)
            .attr('fill', data.unitsColor)
            .text(data.xAxisUnitsLabel);







        /* DATAPOINTS */
        // groups of datapoints
        const dataPointsGroups = chartGroup.selectAll('circle')
            .data(data.enterData)
            .enter().append('g').attr('class', d => `${d.category} dataPointGroup`);

        // datapoints
        dataPointsGroups.selectAll('.circle')
            .data(d => d.data) //get data arrays within each 'enterData' array element
            .enter().append('circle')
            .attr('class', (d, i, node) => `${node[i].parentNode.__data__.category}Circle ${d.month} circle`)
            .attr('fill', (d, i, node) => node[i].parentNode.__data__.color)
            .attr('stroke', 'white')
            .attr('stroke-width', data.dataPointStrokeWidth)
            .attr('cx', (d, i) => xScale(parseDate(d.month + '-' + data.actualData[i].year)))
            .attr('cy', d => yScale(d.value))
            .attr('r', data.dataPointRadius);

        // rectangles for each month with event listeners to toggle TOOLTIPS and to toggle datapoints' highlighting
        const monthRectWidth = xScale(parseDate(data.actualData[1].month + '-' + data.actualData[1].year)) - xScale(parseDate(data.actualData[0].month + '-' + data.actualData[0].year));
        chartGroup.selectAll('.monthRect')
            .data(data.actualData)
            .enter().append('rect')
            .attr('class', d => `monthRect ${d.month}Rect`)
            .attr('height', data.chartHeight)
            .attr('width', monthRectWidth)
            .attr('x', d => xScale(parseDate(d.month + '-' + d.year)) - (monthRectWidth / 2))
            .attr('y', 0)
            .style('opacity', '0')
            .on('mouseover', function (d, i) {
                let xPos = Number(d3.select(this).attr('x')) + (data.tooltipRectWidth / 2.5);
                xPos = xPos < data.margin.left ? data.margin.left + 5: xPos;
                xPos = xPos + data.tooltipRectWidth > data.margin.left + data.chartWidth ? data.margin.left + data.chartWidth - data.tooltipRectWidth : xPos;
                const yPos = data.chartHeight + data.margin.top - data.tooltipRectHeight;
                d3.selectAll('.' + d.month)
                    .attr('r', data.dataPointRadius * 1.5)
                    .attr('stroke-width', data.dataPointStrokeWidth * 1.5);
                tooltipRect
                    .attr('display', 'block')
                    .attr('x', xPos - 5) 
                    .attr('y', yPos - 2);
                monthTspan.text(`${d.month}:`)
                    .attr('x', xPos)
                    .attr('y', yPos - 2);
                baselineTspan.text(`BL: ${data.baselineData[i].value} ${data.unitsLabel}`)
                    .attr('x', xPos)
                    .attr('y', yPos + data.tooltipPadding);
                targetTspan.text(`TG: ${data.targetData[i].value} ${data.unitsLabel}`)
                    .attr('x', xPos)
                    .attr('y', yPos + (data.tooltipPadding * 2));
                actualTspan.text(`AC: ${data.actualData[i].value} ${data.unitsLabel}`)
                    .attr('x', xPos)
                    .attr('y', yPos + (data.tooltipPadding * 3));
            })
            .on('mouseout', function(d) {
                d3.selectAll('.' + d.month)
                    .attr('r', data.dataPointRadius)
                    .attr('stroke-width', data.dataPointStrokeWidth);
                tooltipRect.attr('display', 'none');
                monthTspan.text('');
                baselineTspan.text('');
                targetTspan.text('');
                actualTspan.text('');
            });









        /* LEGEND */
        const legend = chartGroup.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${0, data.chartWidth - data.legendWidth})`);

        // legend box
        legend.append('rect')
            .attr('height', data.legendHeight)
            .attr('width', data.legendWidth)
            .attr('fill', data.backgroundColor)
            .attr('y', -data.legendHeight);


        // create groups for each category with click listeners to toggle hide and hover listeners to toggle bold text
        const legendCategories = legend.selectAll('g')
            .data(data.enterData)
            .enter().append('g')
            .attr('class', d => `${d.category}Legend category`)
            .attr('transform', (d, i) => `translate(5, ${-data.legendHeight + (data.legendSquareSize * i) + (data.legendPadding * (i + 1)) })`)
            .on('click', (d) => {
                const categoryOpacity = d.active ? 0 : 1;
                const legendLineDecoration = d.active ? 'line-through' : 'none';
                d3.selectAll(`.${d.category}`).style('opacity', categoryOpacity);
                d3.select(`#${d.category}Text`).style('text-decoration', legendLineDecoration);
                d.active = !d.active;
            })
            .on('mouseover', function(d){
                d3.select(`#${d.category}Text`).style('font-weight', 'bold');
            })
            .on('mouseout', function(d){
                d3.select(`#${d.category}Text`).style('font-weight', 'normal');
            });


        // append rect for each category group
        legendCategories.append('rect')
            .attr('height', data.legendSquareSize)
            .attr('width', data.legendSquareSize)
            .attr('fill', d => d.color);

        // append text for each category group
        legendCategories.append('text')
            .attr('id', d => `${d.category}Text`)
            .text(d => d.displayName)
            .attr('x', data.legendSquareSize + 10)
            .attr('y', data.legendSquareSize - 1)
            .attr('fill', data.legendFontColor)
            .style('font', data.legendFont);

    };

    function render(widget) {
        return setupDefinitions(widget)
            .then(data => {
                renderWidget(data);
            });
    }


    ////////////////////////////////////////////////////////////////
    // Initialize Widget
    ////////////////////////////////////////////////////////////////

    ModernEfficiencyGraph.prototype.doInitialize = function (element) {
        var that = this;
        element.addClass("ModernEfficiencyGraphOuter");

        d3.select(element[0]).append('svg')
            .attr('class', 'ModernEfficiencyGraph')
            .attr('top', 0)
            .attr('left', 0)
            .attr('width', "95%")
            .attr('height', "95%");

        that.getSubscriber().attach("changed", function (prop, cx) { render(that); });
    };


    ////////////////////////////////////////////////////////////////
    // Extra Widget Methods
    ////////////////////////////////////////////////////////////////

    ModernEfficiencyGraph.prototype.doLayout = ModernEfficiencyGraph.prototype.doLoad = function () { render(this); };

	ModernEfficiencyGraph.prototype.doChanged = () => {};			// ADD BACK TO ABOVE AFTER TESTING //////
	
    /* FOR FUTURE NOTE: 
    ModernEfficiencyGraph.prototype.doChanged = function (name, value) {
          if(name === "value") valueChanged += 'prototypeMethod - ';
          render(this);
    };
    */

    ModernEfficiencyGraph.prototype.doDestroy = function () { this.jq().removeClass("ModernEfficiencyGraph"); };

    return ModernEfficiencyGraph;
});

