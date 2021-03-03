function initializeCaravaggio() {
  setAllModelChecked(true);
  connectAssociations();
  displayModels();
}


function displayModels() {
  // clear out the playing field
  clearModelLocations();
  d3.select("svg").remove();  
  var svg = d3.select('#canvas').append("svg").attr("width", 1000).attr("height", 1000)
  
  // apply forces
  var linkForce = d3.forceLink();
  var selectedModels = displayedModels();
  var associationLinks = displayedAssociations(selectedModels);
  var targetModels = expandModels(selectedModels);
  
  var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter().x(500).y(500))
    .force("link", linkForce)
    .nodes(targetModels)
    .on("tick", updateNetwork);
  
  if(associationLinks.length > 0) {
 //   simulation.force("link").links(associationLinks);
  }
  
  // add lines for all associations
  svg.selectAll("line.association")
    .data(associationLinks, d => `${d.source}-${d.target}`)
    .enter()
    .append("line")
    .attr("class", "association")
    .style("stroke", "black")
    .style("opacity", 0.5);
  
  // add labelled circles for all models
  var modelDisplay = svg
    .selectAll("g.model")
    .data(targetModels, d => d.id)
    .enter()
    .append("g")
    .attr("class", "model");
  modelDisplay.append("circle")
    .attr("r", 5)
    .style("fill", "red");
  modelDisplay.append("text")
    .style("text-anchor", "middle")
    .attr("y", 15)
    .text(d => d["short_name"])
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
