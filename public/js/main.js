import * as graphFactory from './graphFactory.js';
import readGraphFile from './readGraph.js';
import readLocalTreeFile from './readTree.js';

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
  d3.select('#nice-td-svg').selectAll('g').remove();
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

  if (document.getElementById('letters').checked) {
    randomGraph = generateRandomGraph(numberOfVertices, numberOfEdges, 'letters');
  } else {
    randomGraph = generateRandomGraph(numberOfVertices, numberOfEdges, 'numbers');
  }
  graphFactory.loadGraph(randomGraph, '#graphSvg');
}

/* async function readLocalGraphFile(file) {
  const response = await fetch(file);
  const text = await response.text();
  const newnew = text.split('\n');
  readGraphFile(newnew);
} */

function computeTreeDecomposition() {
  let edges = [];

  /*   if (createGraph.isDrawing()) {
    edges = createGraph.convertLinks();
  } else if (isLetterGraph) {
    edges = graphFactory.convertNumberGraph();
  } else {
  } */

  edges = graphFactory.getAllEdges();


  if (edges.length === 0) {
    alert('graph too small.');
    return;
  }

  console.log(edges);

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
      const treeDecompositionPath = 'td.td';
      readLocalTreeFile(treeDecompositionPath, 'treeDecomposition');
    },
  });
}

function handleComputeNiceTree() {
  const niceTreeDecompositionPath = 'nicetd.td';
  readLocalTreeFile(niceTreeDecompositionPath, 'niceTreeDecomposition');
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
  .addEventListener('change', readGraphFile);
document
  .getElementById('compute')
  .addEventListener('click', computeTreeDecomposition);

document
  .getElementById('reload')
  .addEventListener('click', reload);

/* document
  .getElementById('drawGraphButton')
  .addEventListener('click', drawGraph.resetDrawingGraph); */

document
  .addEventListener('contextmenu', (event) => event.preventDefault());

document
  .getElementById('computeNiceTree')
  .addEventListener('click', handleComputeNiceTree);
