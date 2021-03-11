// store data samples
d3.json("samples.json").then(data => {
    var metadata = data.metadata;
    var names = data.names;
    var samples = data.samples;
});