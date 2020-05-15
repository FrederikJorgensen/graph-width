/* eslint-disable space-infix-ops */
/* eslint-disable quote-props */
import readLocalTreeFile from './readTree.js';
import * as ntd from './niceTreeDecomposition.js';
import * as graph from './graph.js';

$('.algorithms-content').hide();
$('#right-container').hide();
$('#td-content').show();
$('.seperator-content').hide();
$('.nice-td-content').hide();
$('.max-independent-set-content').hide();
$('.three-color-content').hide();

let isTreeDecompositionComputed = false;
let isNiceTreeeDecompositionComputed = true;

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

function generateRandomGraph(n, m) {
  const maxNumEdges = (n * (n - 1)) / 2;
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined;

  const graph = { nodes: [], links: [] };

  for (let i = 0; i < n; i++) {
    graph.nodes[i] = { id: i + 1, label: i + 1 };
  }

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);

  const state = {};
  for (let i = 0; i < m; i++) {
    const j = randomInt(i, maxNumEdges);
    if (!(i in state)) state[i] = i;
    if (!(j in state)) state[j] = j;
    [state[i], state[j]] = [state[j], state[i]];
  }

  function unpair(k) {
    const z = Math.floor((-1 + Math.sqrt(1 + 8 * k)) / 2);
    return [k - (z * (1 + z)) / 2, (z * (3 + z)) / 2 - k];
  }

  for (let i = 0; i < m; i++) {
    const [x, y] = unpair(state[i]);
    const u = graph.nodes[x];
    const v = graph.nodes[n - 1 - y];
    graph.links.push({ source: u, target: v });
  }
  return graph;
}

function removeTreeDecomposition() {
  d3.select('#td-svg').selectAll('g').remove();
}

function removeNiceTreeDecomposition() {
  d3.select('#nice-td-svg').selectAll('g').remove();
}

function reload() {
  $('#algorithm-error-message').hide();
  $('#error-message').hide();
  $('#nice-tree-error-message').hide();
  $('#app-content').show();
  d3.selectAll('g').selectAll('text').classed('highlighted-text', false);
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  removeTreeDecomposition();
  removeNiceTreeDecomposition();
  const randomGraph = generateRandomGraph(10, 10);
  graph.loadRandomGraph(randomGraph);
}


function computeTreeDecomposition() {
  removeTreeDecomposition();
  removeNiceTreeDecomposition();

  let json = JSON.stringify(graph.getAllEdges());
  json += `-${graph.getLargestNode()}`;

  $.ajax({
    url: '/compute',
    type: 'POST',
    data: json,
    processData: false,
    dataType: 'json',
    // data: JSON.stringify(edges),
    success() {
      // console.log(data);
    },
    complete() {
      isTreeDecompositionComputed = true;


      const treeDecompositionPath = 'td.td';
      readLocalTreeFile(treeDecompositionPath, 'treeDecomposition');
    },
  });
}

function handleComputeNiceTree() {
  if (!isTreeDecompositionComputed) {
    $('#nice-tree-error-message').show();
    return;
  }
  isNiceTreeeDecompositionComputed = true;
  d3.select('#nice-td-svg').selectAll('g').remove();
  const niceTreeDecompositionPath = 'nicetd.td';
  readLocalTreeFile(niceTreeDecompositionPath, 'niceTreeDecomposition');
}

function handleStartDraw() {
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  d3.selectAll('g').selectAll('text').classed('highlighted-text', false);
  d3.selectAll('circle').style('stroke', 'black');
  $('#app-content').show();
  d3.select('#nice-td-svg').selectAll('g').remove();
  graph.startDraw();
}

function handleThreeColor() {
  $('#three-color-content').show();
  ntd.threeColor();
}

function handleMis() {
  if (!isNiceTreeeDecompositionComputed) {
    $('#algorithm-error-message').show();
    return;
  }
  // d3.selectAll('circle').classed('highlighted-node', false).classed('node', true);
  // d3.selectAll('line').classed('highlighted-link', false).classed('link', true);
  // d3.selectAll('g text').classed('highlighted-text', false).classed('label', true);

  $('#mis-content').show();
  $('#control-keys').show();
  ntd.mis();
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
  .getElementById('tree-decomposition-button')
  .addEventListener('click', computeTreeDecomposition);

document
  .getElementById('random-graph-button')
  .addEventListener('click', reload);

document
  .getElementById('reset-draw-graph')
  .addEventListener('click', handleStartDraw);

document
  .addEventListener('contextmenu', (event) => event.preventDefault());

document
  .getElementById('nice-tree-decomposition-button')
  .addEventListener('click', handleComputeNiceTree);

document
  .getElementById('max-independent-set-button')
  .addEventListener('click', handleMis);

document
  .getElementById('three-color-button')
  .addEventListener('click', handleThreeColor);

window.onload = reload();
