// target parts of the DOM that will be updated
var dropDown_element = d3.select("#selDataset");

// function updatePlot()

// store data samples
d3.json("samples.json").then(data => {
    var metadata = data.metadata;
    var names = data.names;
    var samples = data.samples;

    console.log(samples);
    // populate the drop down with test subject ids
    samples.map(id=>dropDown_element.append('option').text(id['id']));

    var initX = samples[0].sample_values.reverse();
    var initY = samples[0].otu_ids.map(id => `OTU ${id}`).reverse();
    var initName = samples[0].otu_labels.reverse();
    
    var trace1 = {
        type: 'bar',
        orientation: 'h',
        names: initName,
        x: initX,
        y: initY
    };

    var data1 = [trace1];

    var layout = {
        // updatemenus: [{
        //     yanchor: 'top',
        //     buttons: [{

        //     }]
        // }]

    };

    Plotly.newPlot('bar', data1)
});