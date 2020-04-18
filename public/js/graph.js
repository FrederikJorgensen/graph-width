const adjlist = [];
let currentGraph;
let link;
let node;
let label;

const a = 97;
const charArray = {};
for (let i = 0; i < 26; i++) charArray[String.fromCharCode(a + i)] = i + 1;

const charArray2 = {};
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);

export default function drawGraph(graph) {
  const width = document.getElementById('graph-container').offsetWidth;
  const height = document.getElementById('graph-container').offsetHeight;
  const svg = d3.select('#graph');
  const { nodes } = graph;
  const { links } = graph;

  link = svg
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link');

  node = svg
    .append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 18)
    .attr('class', 'node');

  label = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.label);

  function ticked() {
    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    label.attr('x', (d) => d.x).attr('y', (d) => d.y);
  }

  const simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-180))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(50)
      // eslint-disable-next-line comma-dangle
        .strength(0.9)
    )
    .on('tick', ticked);

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  links.forEach((d) => {
    adjlist[`${d.source.index}-${d.target.index}`] = true;
  });

  node.call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  );
}

function removeExistingGraph() {
  if (node && link && label) {
    node.remove();
    link.remove();
    label.remove();
  }
}

function newReadGraphFile(file) {
  const f = file;
  const r = new FileReader();
  const newGraph = {};
  const nodes = [];
  const links = [];
  r.onload = function onLoad() {
    const lines = this.result.split('\n');
    lines.shift();

    function nodeExists(node) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === node) return true;
      }
      return false;
    }

    for (let i = 0; i < lines.length; i++) {
      const textLine = lines[i];
      const splitted = textLine.split(' ');

      const firstNodeLabel = splitted[0].trim();
      const secondNodeLabel = splitted[1].trim();

      const firstNode = charArray[firstNodeLabel];
      const secondNode = charArray[secondNodeLabel];

      if (!nodeExists(firstNode)) {
        nodes.push({ id: firstNode, label: firstNodeLabel });
      }

      if (!nodeExists(secondNode)) {
        nodes.push({ id: secondNode, label: secondNodeLabel });
      }

      links.push({ source: firstNode, target: secondNode });
    }
    newGraph.nodes = nodes;
    newGraph.links = links;
    removeExistingGraph();
    currentGraph = newGraph;
    drawGraph(newGraph);
  };
  r.readAsText(f);
}

export function highlightNodes(hoveredNode) {
  const { vertices } = hoveredNode.data;

  d3.selectAll('circle.graphNode').attr('opacity', (currentNode) => {
    if (vertices.includes(currentNode.id)) return 0;
    return 1;
  });

  d3.selectAll('circle.graphLink').attr('opacity', (currentLink) => {
    if (
      vertices.includes(currentLink.source.id)
      || vertices.includes(currentLink.target.id)
    ) {
      return 0;
    }
    return 1;
  });
}

export function resetHighlight() {
  d3.selectAll('circle.graphNode').attr('opacity', 1);
  d3.selectAll('circle.graphLink').attr('opacity', 1);
}

function randomGraph(n, m, type) {
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

export function create() {
  removeExistingGraph();
  const numberOfVertices = parseInt(
    document.getElementById('numberOfVertices').value,
    10,
  );
  const numberOfEdges = parseInt(
    document.getElementById('numberOfEdges').value,
    10,
  );

  let graph;

  if (document.getElementById('letters').checked) {
    graph = randomGraph(numberOfVertices, numberOfEdges, 'letters');
  } else {
    graph = randomGraph(numberOfVertices, numberOfEdges, 'numbers');
  }
  currentGraph = graph;
  drawGraph(graph);
}

export function convertNumberGraph() {
  const convertedArray = [];

  currentGraph.links.forEach((link) => {
    convertedArray.push([
      charArray[link.source.label],
      charArray[link.target.label],
    ]);
  });
  return convertedArray;
}

export function getAllEdges() {
  const convertedArray = [];
  currentGraph.links.forEach((link) => {
    convertedArray.push([link.source.id, link.target.id]);
  });
  return convertedArray;
}

export function handleGraphUpload(event) {
  const file = event.target.files[0];
  newReadGraphFile(file);
}

export function handleDrawGraph() {
  removeExistingGraph();
}
