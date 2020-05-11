/* eslint-disable no-restricted-syntax */

const graphWidth = document.getElementById('graph-svg-container').offsetWidth;
const graphHeight = document.getElementById('graph-svg-container').offsetHeight;
let currentGraph;
let graphNodes = [];
let graphLinks = [];
let graphLinkSvg;
let graphNodeSvg;
let graphLabelSvg;
let simulation;
const color = d3.scaleOrdinal(d3.schemeCategory10);
let svg;

export function loadGraph(graph) {
  d3.select('#graphSvg').selectAll('g').remove();
  currentGraph = graph;
  const { nodes } = graph;
  const { links } = graph;
  graphNodes = nodes;
  graphLinks = links;

  svg = d3.select('#graphSvg').attr('width', graphWidth).attr('height', graphHeight);

  graphLinkSvg = svg
    .append('g')
    .selectAll('line')
    .data(graphLinks)
    .enter()
    .append('line')
    .attr('class', 'link');

  graphNodeSvg = svg
    .append('g')
    .selectAll('g')
    .data(graphNodes)
    .enter()
    .append('circle')
    .attr('r', 20)
    .attr('class', 'node')
    .attr('id', (d) => `graphNode-${d.id}`)
    .attr('fill', (d) => color(d.cluster));

  graphLabelSvg = svg
    .append('g')
    .selectAll('text')
    .data(graphNodes)
    .enter()
    .append('text')
    .attr('dy', '.2em')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.id);

  function ticked() {
    graphNodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);

    graphLabelSvg.attr('x', (d) => d.x).attr('y', (d) => d.y);

    graphLinkSvg
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  }

  simulation = d3.forceSimulation(graphNodes)
    .force('link', d3.forceLink(graphLinks).id((d) => d.id))
    .force('charge', d3.forceManyBody().strength(-400))
    .on('tick', ticked)
    .force('center', d3.forceCenter().x(graphWidth / 2).y(graphHeight / 2));


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

  graphNodeSvg.call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  );
}

export function resetHighlight() {
  if (graphLinkSvg && graphNodeSvg && graphLabelSvg) {
    graphLinkSvg.attr('opacity', 1);
    graphNodeSvg.attr('opacity', 1);
    graphNodeSvg.style('fill', 'yellow');
    graphLabelSvg.attr('opacity', 1);
  }
}

export function getAllEdges() {
  const convertedArray = [];
  currentGraph.links.forEach((link) => {
    convertedArray.push([link.source.id, link.target.id]);
  });
  return convertedArray;
}

const numberOfColors = 3;
const result = [];
const adjlist = [];

function isSafe(k, subGraphNodes, color) {
  for (let i = 0; i < subGraphNodes.length; i++) {
    if (adjlist[`${k}-${i}`] && color === result[i]) {
      return false;
    }
  }
  return true;
}

function getColor(colorNumber) {
  if (colorNumber === 1) {
    return 'red';
  } if (colorNumber === 2) {
    return 'green';
  } if (colorNumber === 3) {
    return 'blue';
  }
  return 'pink';
}

const coloredNodes = {};

function colorNode(nodeToColor, color) {
  d3.select(`#graphNode-${nodeToColor}`).style('fill', (d) => {
    const nodeColor = getColor(color);
    d.color = nodeColor;
    coloredNodes[nodeToColor] = nodeColor;
    return nodeColor;
  });
}

/* export function graphColoring(k, subGraphNodes) {
  for (let color = 1; color <= numberOfColors; color++) {
    if (isSafe(k, subGraphNodes, color)) {
      result[k] = color;
      const nodeToColor = subGraphNodes[k].id;
      colorNode(nodeToColor, color);
      if ((k + 1) < subGraphNodes.length) {
        graphColoring(k + 1, subGraphNodes);
      } else {
        return;
      }
    }
  }
}

function highlightSubgraph(vertices, filteredNodesById) {
  graphLinkSvg.attr('opacity', (link) => {
    if (vertices.includes(link.source.id) && !filteredNodesById.includes(link.target.id)) return 1;
    return 0.2;
  });

  graphNodeSvg.attr('opacity', (node) => {
    if (vertices.includes(node.id)) return 1;
    return 0.2;
  });

  graphLabelSvg.attr('opacity', (node) => {
    if (vertices.includes(node.id)) return 1;
    return 0.2;
  });
}

export function createSubGraph(currentTreeNode) {
  const { vertices } = currentTreeNode.data;
  const filteredNodes = graphNodes.filter((node) => !vertices.includes(node.id));
  const filteredNodesById = [];
  result = [];
  adjlist = [];
  coloredNodes = {};

  filteredNodes.forEach((node) => {
    filteredNodesById.push(node.id);
  });

  const subGraphNodes = graphNodes.filter((node) => vertices.includes(node.id));

  for (let i = 0; i < subGraphNodes.length; i++) {
    subGraphNodes[i].index = i;
  }

  const subGraphLinks = graphLinks.filter(
    (link) => vertices.includes(link.source.id)
      && !filteredNodesById.includes(link.target.id),
  );

  if (subGraphLinks !== undefined) {
    subGraphLinks.forEach((d) => {
      adjlist[`${d.source.index}-${d.target.index}`] = true;
      adjlist[`${d.target.index}-${d.source.index}`] = true;
      adjlist[`${d.source.index}-${d.source.index}`] = true;
      adjlist[`${d.target.index}-${d.target.index}`] = true;
    });
  } else {
    return true;
  }

  resetHighlight();
  highlightSubgraph(vertices, filteredNodesById);
  graphColoring(0, subGraphNodes);

  // eslint-disable-next-line no-restricted-syntax
  for (const link of subGraphLinks) {
    if (link.source.color === link.target.color) {
      return false;
    }
  }
  return { isColorable: true, coloredNodes };
} */

