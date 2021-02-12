function loadModels() {
  d3.select("svg#model-diagram")
    .selectAll("g")
    .data(models)
    .enter()
  .append((d) => createModelNode(d));
  ;
}

function modelOffset(name) {
  for(i = 0; i < models.length; ++i) {
    if(models[i]["name"] == name) {
      return i;
    }
  }
  return null;
}

function createModelNode(model) {
  var offset = modelOffset(model["name"]);
  var g = d3.create('svg:g');
  g.append("rect")
    .attr("x", 200 * (offset % 5))
    .attr("y", 50 * Math.floor(offset / 5))
    .attr("height", "20")
    .attr("width", "190")
    .attr("stroke", "black")
    .attr("fill", "white");
  g.append("text")
    .text(model["short_name"])
    .attr("x", 200 * (offset % 5) + 5)
    .attr("y", 50 * Math.floor(offset / 5) + 15)
  return g.node();
}