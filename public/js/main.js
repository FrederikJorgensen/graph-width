import * as graph from './graph.js';
import * as tree from './tree.js';

function incrementVerticesCounter() {
  let value = parseInt(document.getElementById('numberOfVertices').value, 10);
  value = Number.isNaN(value) ? 0 : value;
  value++;
  document.getElementById('numberOfVertices').value = value;
}

function decrementVerticesCounter() {
  let value = parseInt(document.getElementById('numberOfVertices').value, 10);
  value = Number.isNaN(value) ? 0 : value;
  if (value > 0) {
    value--;
  }
  document.getElementById('numberOfVertices').value = value;
}

function incrementEdgesCounter() {
  let value = parseInt(document.getElementById('numberOfEdges').value, 10);
  value = Number.isNaN(value) ? 0 : value;
  value++;
  document.getElementById('numberOfEdges').value = value;
}

function decrementEdgesCounter() {
  let value = parseInt(document.getElementById('numberOfEdges').value, 10);
  value = Number.isNaN(value) ? 0 : value;
  if (value > 0) {
    value--;
  }
  document.getElementById('numberOfEdges').value = value;
}

const verticesLeftArrow = $('#verticesLeftArrow');
const verticesRightArrow = $('#verticesRightArrow');
verticesLeftArrow.click('click', decrementVerticesCounter);
verticesRightArrow.click('click', incrementVerticesCounter);

const edgesLeftArrow = $('#edgesLeftArrow');
const edgesRightArrow = $('#edgesRightArrow');
edgesLeftArrow.click('click', decrementEdgesCounter);
edgesRightArrow.click('click', incrementEdgesCounter);

document
  .getElementById('drawgraph')
  .addEventListener('click', graph.handleDrawGraph);

document
  .querySelector('#fileUpload')
  .addEventListener('change', graph.handleGraphUpload);
document
  .getElementById('compute')
  .addEventListener('click', tree.computeTreeDecomposition);

document.getElementById('reload').addEventListener('click', graph.create);
