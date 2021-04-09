function initializeCaravaggio() {
  setAllModelChecked(false);
  connectAssociations();
  displayModels();
}


function displayModels() {
  // clear out the playing field
  clearModelLocations();
  d3.select("svg").remove();  
  var svg = d3.select('#canvas').append("svg").attr("width", 1000).attr("height", 1000)
  
  var defs = svg.append('svg:defs');
  
  createMarker(defs, "belongs_to", "red");
  createMarker(defs, "has_one", "blue");
  createMarker(defs, "has_many", "green");
  createMarker(defs, "has_and_belongs_to_many", "orange");
  
  // apply forces
  var linkForce = d3.forceLink();
  var selectedModels = displayedModels();
  var associationLinks = displayedAssociations(selectedModels);
  var targetModels = expandModels(selectedModels);
  
  var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-20))
    .force("center", d3.forceCenter().x(500).y(500))
    .force("centerSelected", isolate(d3.forceCenter().x(500).y(500), function(d) { return d.checked }))
    .force("link", linkForce)
    .nodes(targetModels)
    .on("tick", updateNetwork);
  
  // add lines for all associations
  svg.selectAll("line.association")
    .data(associationLinks, d => `${d.source}-${d.target}`)
    .enter()
    .append("line")
    .attr("class", d => "association " + d.association_type)
    .attr("marker-end", d => "url(#" + d.association_type + "-arrowhead)")
    .attr("onclick", d => "exhibitAssociation(" + d.index + ")");
  
  // add labelled circles for all models
  var modelDisplay = svg
    .selectAll("g.model")
    .data(targetModels, d => d.id)
    .enter()
    .append("g")
    .attr("class", "model");
  modelDisplay.append("circle")
    .attr("r", d => d.checked ? 8 : 5)
    .attr("onclick", d => "clickCircle('" + d.id + "')")
    .style("fill", d => d.checked ? "red" : "blue");
  modelDisplay.append("text")
    .style("text-anchor", "middle")
    .attr("y", 15)
    .text(d => d["short_name"])
}

function createMarker(defs, name, color) {
  return defs.append("marker")
    .attr('id', name + '-arrowhead')
    .attr('markerHeight', 15)
    .attr('markerWidth', 15)
    .attr('orient', 'auto-start-reverse')
    .attr('refX', 15)
    .attr('refY',8)
    .attr('viewBox', '0 0 15 15')
    .append('svg:path')
    .attr('d', 'M 0 0 L 15 8 L 0 15 z')
    .attr('class', function(d,i) { i.association_type})
    .attr("fill", color);
}

function isolate(force, filter) {
  var initialize = force.initialize;
  force.initialize = function() { initialize.call(force, models.filter(filter)); };
  return force;
}

function clickCircle(modelId) {
  model = findModel(modelId);
  model.checked = !model.checked;
  d3.select("input#" + model.friendly_name).property('checked', model.checked);
  if(model.checked) {
    exhibitFigure(model);
  }
  displayModels();
}


function updateNetwork() {
  d3.selectAll("line.association")
    .attr("x1", d => d.sourceModel.x)
    .attr("x2", d => d.targetModel.x)
    .attr("y1", d => d.sourceModel.y)
    .attr("y2", d => d.targetModel.y)
  d3.selectAll("g.model")
    .attr("transform", d => `translate(${d.x},${d.y})`);
}

function connectAssociations() {
  associations.forEach(association => {
    association.sourceModel = findModel(association["source"]);
    association.targetModel = findModel(association["target"]);
  });
  
  associations = associations.filter(association => !((typeof(association.sourceModel) === 'undefined') || (typeof(association.targetModel) === 'undefined')))
}

function displayedAssociations(models) {
  var modelIds = models.map(model => model.id);
  return associations.filter(association => modelIds.includes(association.source));
}

// For the list of models to display, find all models plus models they have associations to
function displayedModels() {
  return models.filter(model => model.checked);
}

function exhibitFigure(model) {
  hideExhibits();
  d3.select("#figure-" + model.friendly_name).classed("hidden", false);
  document.getElementById("exhibit").scrollTop = 0;
}

function exhibitAssociation(associationIndex) {
  hideExhibits();
  d3.select("#association-" + associationIndex).classed("hidden", false);
  document.getElementById("exhibit").scrollTop = 0;
}

function hideExhibits() {
  d3.selectAll("div.detailed-content").classed("hidden", true);
}


function expandModels(coreModels) {
  var coreModelIds = coreModels.map(model => model.id)
  
  var addedSet = new Set();
  
  for(var i = 0; i < coreModels.length; ++i) {
    for(var j = 0; j < coreModels[i].associated_classes.length; ++j) {
      console.log("Go add: " + coreModels[i].associated_classes[j]);
      addedSet.add(coreModels[i].associated_classes[j]);
    }
  }
  
  addedSet.forEach(addition => {
    console.log("Go add to set: " + addition);
    if(!coreModelIds.includes(addition)) {
      var newModel = findModel(addition);
      if(typeof(newModel) !== "undefined")
        coreModels.push(findModel(addition));
    }
  });
  
  return coreModels;
}

function setAllModels(cb) {
  checked = cb.checked;
  checkboxes = document.getElementsByClassName("model-checkbox");
  for(var i = 0; i < checkboxes.length; ++i) {
    checkboxes[i].checked = checked;
  }
  setAllModelChecked(checked);
  
  displayModels();
}

function setModel(cb) {
  if(!(typeof(model = findModel(cb.dataset.className)) === 'undefined')) {
    model.checked = cb.checked;
    if(model.checked) {
      exhibitFigure(model);
    }
  }

  displayModels();
}

function findModel(id) {
  return models.find(model => model["id"] === id);
}

function setAllModelChecked(checked) {
  for(i = 0; i < models.length; ++i) {
    models[i].checked = checked;
  }
}

// move all model to a random point near the center.
// It can't be in the center, because putting them all exactly in the center has
// unfortunate side-effects if there are too many.
function clearModelLocations() {
  for(i = 0; i < models.length; ++i) {
    models[i].x = 400 + Math.random() * 200;
    models[i].y = 500 + Math.random() * 200;
  }
}

