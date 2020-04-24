const adjlist = [];
let currentGraph;
let graphLinks;
let graphNodes;
let graphLabels;
const graphWidth = document.getElementById('graph-container').offsetWidth;
const graphHeight = document.getElementById('graph-container').offsetHeight;

const a = 97;
const charArray = {};
for (let i = 0; i < 26; i++) charArray[String.fromCharCode(a + i)] = i + 1;
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);

export function loadGraph(graph, canvas) {
  currentGraph = graph;
  const svg = d3.select(canvas).attr('viewBox', [-graphWidth / 2, -graphHeight / 2, graphWidth, graphHeight]);
  const { nodes } = graph;
  const { links } = graph;

  graphLinks = svg
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link');

  graphNodes = svg
    .append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 18)
    .attr('class', 'graphNode');

  graphLabels = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.label);

  function ticked() {
    graphNodes
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    graphLinks
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    graphLabels.attr('x', (d) => d.x).attr('y', (d) => d.y);
  }

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(50).strength(0.9))
    .force('charge', d3.forceManyBody().strength(-180))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .on('tick', ticked);

  function dragstarted(d) {
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

  graphNodes.call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  );
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

export function resetHighlight() {
  d3.selectAll('circle.graphNode').attr('opacity', 1);
  d3.selectAll('circle.graphLink').attr('opacity', 1);
}
