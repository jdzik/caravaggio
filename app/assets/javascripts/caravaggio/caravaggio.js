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
  var targetModels = expandModels(selectedModels);
  var associationLinks = displayedAssociations(selectedModels, targetModels);
  var collisionRadius = 200 / associationLinks.length;
  if(collisionRadius < 8)
    collisionRadius = 8;
  
  var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-40))
    .force("center", d3.forceCenter().x(500).y(500))
    .force('collision', d3.forceCollide().radius(collisionRadius))
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

function displayedAssociations(models, associatedModels) {
  var modelIds = models.map(model => model.id);
  var associatedModelIds = associatedModels.map(model => model.id);
  
  selectedAssociations = [];
  
  if(displayLinksFrom()) {
    selectedAssociations = selectedAssociations.concat(linkedAssociations(modelIds, associatedModelIds));
  }
  if(displayLinksTo()) {
    selectedAssociations = selectedAssociations.concat(linkedAssociations(associatedModelIds, modelIds));
  }
  return selectedAssociations;
}

function linkedAssociations(fromIds, toIds) {
  var results = associations.filter(association => associationMatches(association, fromIds, toIds))
  
  results = results.sort((a1, a2) => {
    if(a1.association_type > a2.association_type) {
      return -1;
    } else if (a2.association_type > a1.association_type) {
      return 1;
    } else {
      return 0;
    }
  });
  
  return results;
}

function debugResults(label, results) {
  console.log("RESULTS: " + label);
  for(var i = 0; i < results.length; ++i) {
    console.log("   " + results[i].association_type + " " + results[i].source + " -> " + results[i].target);
  }
}

function associationMatches(association, fromIds, toIds) {
  return (!fromIds || fromIds.includes(association.source)) && (!toIds || toIds.includes(association.target));
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
  expandedModels = [...coreModels];
  
  if(!displayCheckedOnly()) {
    var coreModelIds = coreModels.map(model => model.id)
    var addedSet = new Set();
  
    if(displayLinksFrom()) {
      var associations = linkedAssociations(coreModelIds, null);
      for(var i = 0; i < associations.length; ++i) {
        addedSet.add(associations[i].target);
      }
    }
  
    if(displayLinksTo()) {
      var associations = linkedAssociations(null, coreModelIds);
      for(var i = 0; i < associations.length; ++i) {
        addedSet.add(associations[i].source);
      }
    }
  
    addedSet.forEach(addition => {
      if(!coreModelIds.includes(addition)) {
        var newModel = findModel(addition);
        if(typeof(newModel) !== "undefined")
          expandedModels.push(findModel(addition));
      }
    });
  }

  return expandedModels;
}

function displayLinksTo() {
  return document.getElementById("links_to").checked;
}

function displayLinksFrom() {
  return document.getElementById("links_from").checked;
}

function displayCheckedOnly() {
  return document.getElementById("only_checked").checked;
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

