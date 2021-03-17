// target parts of the DOM that will be updated
var dropDown_element = d3.select("#selDataset");
var bar_element = d3.select('#bar');
var bubble_element = d3.select('#bubble');
var gauge_element = d3.select('#gauge');
var demo_element = d3.select('#demo');
var meta_element = d3.select('#sample-metadata');

// hide the plot elements on page load until a selection is made
bar_element.property('style', 'opacity: 0;');
bubble_element.property('style', 'opacity: 0;');
gauge_element.property('style', 'opacity: 0;');
demo_element.property('style', 'opacity: 0;');

// placeholder variables for sample dataset
var metadata;
var names;
var samples;

function parallelSort(index, type) {
    // zip each entry together before sorting
    let sampleList = [];
    for (let i=0; i<samples[index].sample_values.length; i++) {
        sampleList.push({
            'value': samples[index].sample_values[i],
            'id': samples[index].otu_ids[i],
            'label': samples[index].otu_labels[i],
        });
    };
    // sort based on the type of plot depicting it
    switch (type) {
        case 'Bar':
            return sampleList.sort((a,b) => a.value - b.value).slice(-10,);
        case 'Bubble':
            return sampleList.sort((a,b) => b.id - a.id);
        default:
            return sampleList;
    }
}

// update bar plot based on dropdown change
function optionChanged(option) {

    if (option > 0) {
        option--; // realign the option selected with the index of the samples
        
        /** Update Demographic Info **/
        // clear previous info
        meta_element.text('');
        for (const [_key, _value] of Object.entries(metadata[option])) {
            meta_element.append('p').text(`${_key}: ${_value}`)
        };

        /** Update Bar Plot **/
        let sampleList = parallelSort(option, 'Bar');
        let barValueList = [];
        let barIdList = [];
        let barLabelList = [];
        // unpack bubbleSampleList
        for(let i=0; i<sampleList.length; i++) {
            barValueList.push(sampleList[i].value);
            barIdList.push(`OTU ${sampleList[i].id}`);
            barLabelList.push(sampleList[i].label);
        };
        // update the bar plot with new data
        Plotly.relayout('bar', {'title': `Top 10 OTUs - ID ${samples[option].id}`});
        Plotly.restyle('bar', 'x', [barValueList]);
        Plotly.restyle('bar', 'y', [barIdList]);
        Plotly.restyle('bar', 'text', [barLabelList]);
        

        /** Update Bubble Plot **/
        sampleList = parallelSort(option, 'Bubble');
        let bubbleValueList = [];
        let bubbleIdList = [];
        let bubbleLabelList = [];
        // unpack bubbleSampleList
        for(let i=0; i<sampleList.length; i++) {
            bubbleValueList.push(sampleList[i].value);
            bubbleIdList.push(sampleList[i].id);
            bubbleLabelList.push(sampleList[i].label);
        };
        // update the bubble plot with new data
        Plotly.relayout('bubble', {'title': `Sample sizes for all OTUs - ID ${samples[option].id}`});
        Plotly.restyle('bubble', 'y', [bubbleValueList]);
        Plotly.restyle('bubble', 'y', [bubbleValueList]);
        Plotly.restyle('bubble', 'x', [bubbleIdList]);
        Plotly.restyle('bubble', 'text', [bubbleLabelList]);
        Plotly.restyle('bubble', 'marker.size', [bubbleValueList]);
        Plotly.restyle('bubble', 'marker.color', [bubbleIdList]);
        Plotly.restyle('bubble', 'marker.sizeref', 2 * Math.max(...bubbleValueList) / (12**2));


        /** Update Gauge **/
        /* Gauge code found on https://community.plotly.com/t/plotly-js-gauge-pie-chart-data-order/8686 */
        // Trig to calc meter point
        var levels = [180, 153, 130, 111, 97, 82, 67, 49, 26, 0]
        var degrees = levels[metadata[option].wfreq];
        var radius = .6;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M .0 -0.05 L .0 0.05 L ';
        var pathX = String(x);
        var pathY = String(y);
        var path = mainPath.concat(`${pathX} ${pathY} Z`);

        Plotly.relayout('gauge', 'shapes[0].path', path);


        /** Show Elements **/
        bar_element.property('style', 'opacity: 1;');
        bubble_element.property('style', 'opacity: 1;');
        gauge_element.property('style', 'opacity: 1;');
        demo_element.property('style', 'opacity: 1;');

    }
    else {
        /** Hide Elements **/
        bar_element.property('style', 'opacity: 0;');
        bubble_element.property('style', 'opacity: 0;');
        gauge_element.property('style', 'opacity: 0;');
        demo_element.property('style', 'opacity: 0;');
    }
}

// store data samples
d3.json("samples.json").then(data => {
    metadata = data.metadata;
    names = data.names;
    samples = data.samples;

    // populate the drop down with test subject ids
    dropDown_element.append('option').text('Select ID');
    samples.map(id=>dropDown_element.append('option').text(id['id']));

    // create initial plots
    function init() {
        // Create default blank plots
        Plotly.newPlot('bar', [{ type: 'bar', orientation: 'h'}], { xaxis: { title: "Sample Size"}});
        Plotly.newPlot('bubble', [{ mode: 'markers'}], { xaxis: { title: "OTU ID"}});

        /* Gauge code found on https://community.plotly.com/t/plotly-js-gauge-pie-chart-data-order/8686 */
        var traceGauge1 = {
            type: 'category',
            x: [0], y:[0],
            marker: {size: 28, color:'850000'},
            showlegend: false
        };
        var traceGauge2 = {
            values: [9,1,1,1,1,1,1,1,1,1],
            rotation: 90,
            text: ['', '8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
            textinfo: 'text',
            textposition:'inside',      
            marker: { colors:['#FFF', '#007E45', '#198F5A', '#329F6E', '#4BAF82', '#64BF96', '#7DCFAA', '#96DFBE', '#AFEFD2', '#C4F7E0', '#D8FFED']},
            hoverinfo: false,
            hole: .5,
            type: 'pie',
            showlegend: false
        };

        var dataGauge = [traceGauge1, traceGauge2];

        var layoutGauge = {
            title: 'Belly Button Washing Frequency',
            shapes:[{
                type: 'path',
                fillcolor: '850000',
                path: 'M -.0 -0.035 L .0 0.035 L -0.5 6.123233995736766e-17 Z',
                line: { color: '850000'}
            }],
            hovermode: false,
            height: 500,
            width: 600,
            xaxis: {
                type:'category',
                zeroline:false,
                showticklabels:false,
                showgrid: false,
                range: [-1, 1]},
            yaxis: {
                type:'category',
                zeroline:false,
                showticklabels:false,
                showgrid: false,
                range: [-1, 1]}
        };
        Plotly.newPlot('gauge', dataGauge, layoutGauge);

    };

    init();
});