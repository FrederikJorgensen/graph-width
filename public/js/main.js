import * as graph from './graph.js';
import startanimation from './animation.js';
import * as drawGraph from './drawGraph.js';
import computeTreeDecomposition from './tree.js';

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
  .querySelector('#fileUpload')
  .addEventListener('change', graph.handleGraphUpload);
document
  .getElementById('compute')
  .addEventListener('click', computeTreeDecomposition);

document
  .getElementById('reloadRandomGraph')
  .addEventListener('click', graph.create);

document
  .getElementById('startanimation')
  .addEventListener('click', startanimation);

document
  .getElementById('drawGraphButton')
  .addEventListener('click', drawGraph.resetDrawingGraph);

document
  .addEventListener('contextmenu', (event) => event.preventDefault());
