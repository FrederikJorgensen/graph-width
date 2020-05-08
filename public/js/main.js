import * as graph from './graph.js';
import readLocalTreeFile from './readTree.js';
import * as ntd from './niceTreeDecomposition.js';
import * as drawGraph from './drawGraph.js';
import readGraphFile from './graphReader.js';

const a = 97;
const charArray = {};
for (let i = 0; i < 26; i++) charArray[String.fromCharCode(a + i)] = i + 1;
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);

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

function generateRandomGraph(n, m, type) {
  const maxNumEdges = (n * (n - 1)) / 2;
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined;

  const graph = { nodes: [], links: [] };

  if (type === 'letters') {
    for (let i = 0; i < n; i++) {
      graph.nodes[i] = { id: i + 1, label: charArray2[i + 1] };
    }
  } else {
    for (let i = 0; i < n; i++) {
      graph.nodes[i] = { id: i + 1, label: i + 1 };
    }
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

function removeGraph() {
  d3.select('#graphSvg').selectAll('g').remove();
}

function removeTreeDecomposition() {
  d3.select('#tdSvg').selectAll('g').remove();
}

function removeNiceTreeDecomposition() {
  d3.select('#nice-td-container').selectAll('g').remove();
}

function reload() {
  removeGraph();
  removeTreeDecomposition();
  removeNiceTreeDecomposition();

  const numberOfVertices = parseInt(
    document.getElementById('numberOfVertices').value,
    10,
  );
  const numberOfEdges = parseInt(
    document.getElementById('numberOfEdges').value,
    10,
  );

  let randomGraph;

  randomGraph = generateRandomGraph(numberOfVertices, numberOfEdges, 'numbers');

  graph.loadGraph(randomGraph, '#graphSvg');
}


function computeTreeDecomposition() {
  removeTreeDecomposition();
  removeNiceTreeDecomposition();
  let edges = [];

  if (drawGraph.isDrawing()) {
    edges = drawGraph.convertLinks();
  } else {
    edges = graph.getAllEdges();
  }

  if (edges.length === 0) {
    alert('graph too small.');
    return;
  }

  $('.text_container').removeClass('hidden').addClass('visible');
  $.ajax({
    url: '/compute',
    type: 'POST',
    data: JSON.stringify(edges),
    processData: false,
    success() {
      // console.log(data);
    },
    complete() {
      $('.text_container').removeClass('visible').addClass('hidden');
      /*       const treeDecompositionPath = 'td.td';
      readLocalTreeFile(treeDecompositionPath, 'treeDecomposition'); */
    },
  });
}

function handleComputeNiceTree() {
  d3.select('#nice-td-container').select('svg').remove();
  const niceTreeDecompositionPath = 'nicetd.td';
  readLocalTreeFile(niceTreeDecompositionPath, 'niceTreeDecomposition');
}

// const treeDecompositionPath = 'td.td';
// readLocalTreeFile(treeDecompositionPath, 'treeDecomposition');

handleComputeNiceTree();

const verticesLeftArrow = $('#verticesLeftArrow');
const verticesRightArrow = $('#verticesRightArrow');
verticesLeftArrow.click('click', decrementVerticesCounter);
verticesRightArrow.click('click', incrementVerticesCounter);

const edgesLeftArrow = $('#edgesLeftArrow');
const edgesRightArrow = $('#edgesRightArrow');
edgesLeftArrow.click('click', decrementEdgesCounter);
edgesRightArrow.click('click', incrementEdgesCounter);

document
  .getElementById('file-upload')
  .addEventListener('change', readGraphFile);

document
  .getElementById('compute')
  .addEventListener('click', computeTreeDecomposition);

document
  .getElementById('reloadRandomGraph')
  .addEventListener('click', reload);

document
  .getElementById('draw-graph-button')
  .addEventListener('click', drawGraph.resetDrawingGraph);

document
  .addEventListener('contextmenu', (event) => event.preventDefault());

document
  .getElementById('computeNiceTree')
  .addEventListener('click', handleComputeNiceTree);

document.getElementById('max-independent-set').addEventListener('click', ntd.mis);

document.getElementById('three-color').addEventListener('click', ntd.runThreeColor);

// introJs().start();

introJs().addStep({
  element: document.querySelectorAll('#step2')[0],
  intro: "Ok, wasn't that fun?",
  position: 'right',
});
