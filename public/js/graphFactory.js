
const graphWidth = document.getElementById('graph-container').offsetWidth;
const graphHeight = document.getElementById('graph-container').offsetHeight;
const a = 97;
const charArray = {};
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray[String.fromCharCode(a + i)] = i + 1;
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);

let isRepeling = false;
let currentGraph;
let graphNodes = [];
let graphLinks = [];
let graphLinkSvg;
let graphNodeSvg;
let graphLabelSvg;
let simulation;

export function loadGraph(graph) {
  currentGraph = graph;
  const { nodes } = graph;
  const { links } = graph;
  graphNodes = nodes;
  graphLinks = links;

  const svg = d3.select('#graphSvg').attr('viewBox', [-graphWidth / 2, -graphHeight / 2, graphWidth, graphHeight]);

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
    .attr('r', 18)
    .attr('class', 'graphNode')
    .attr('id', (d) => `graphNode-${d.id}`);

  graphLabelSvg = svg
    .append('g')
    .selectAll('text')
    .data(graphNodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.id);

  /*   graphLinks.forEach((d) => {
    adjlist[`${d.source.index}-${d.target.index}`] = true;
  });
  console.log(adjlist);
 */

  function ticked() {
    graphNodeSvg
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    graphLinkSvg
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    graphLabelSvg.attr('x', (d) => d.x).attr('y', (d) => d.y);
  }

  function repel() {
    if (!isRepeling) return;
    for (let i = 0; i < graphNodes.length; i++) {
      const currentNode = graphNodes[i];
      if (currentNode.repel) {
        currentNode.x += 2;
      } else {
        currentNode.x -= 1.5;
      }
    }
  }

  simulation = d3.forceSimulation(graphNodes)
    .force('link', d3.forceLink(graphLinks).id((d) => d.id).distance(0).strength(0.9))
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .on('tick', ticked)
    .force('repel', repel);

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

function resetGraph(linksToAdd) {
  graphLinkSvg.exit().remove();
  graphLinkSvg = graphLinkSvg
    .data(linksToAdd)
    .join('line');
  isRepeling = false;
  graphNodes.forEach((node) => {
    node.repel = false;
  });
  simulation.alpha(1).restart();
}

function updateGraph(linksToUpdate) {
  graphLinkSvg = graphLinkSvg.data(linksToUpdate);
  graphLinkSvg.exit().remove();
}

export function highlightNodes(hoveredNode) {
  const { vertices } = hoveredNode.data;
  if (vertices === undefined) return;

  isRepeling = true;

  for (let i = 0; i < graphNodes.length; i++) {
    const currentNode = graphNodes[i];
    if (vertices.includes(currentNode.id)) {
      const currentNode = graphNodes[i];
      currentNode.repel = true;
    }
  }
  const newLinks = graphLinkSvg.data();
  const updatedLinks = newLinks.filter((d) => !vertices.includes(d.source.id) && !vertices.includes(d.target.id));
  updateGraph(updatedLinks);
}

export function resetHighlight() {
  graphLinkSvg.attr('opacity', 1);
  graphNodeSvg.attr('opacity', 1);
  graphNodeSvg.style('fill', 'yellow');
  graphLabelSvg.attr('opacity', 1);
  // resetGraph(startGraphLinks);
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

const numberOfColors = 3;
let result = [];
let adjlist = [];

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

export function graphColoring(k, subGraphNodes) {
  // debugger;
  for (let color = 1; color <= numberOfColors; color++) {
    if (isSafe(k, subGraphNodes, color)) {
      result[k] = color;
      const nodeToColor = subGraphNodes[k].id;
      d3.select(`#graphNode-${nodeToColor}`).style('fill', (d) => {
        d.color = getColor(color);
        return getColor(color);
      });

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
  const { vertices } = currentTreeNode;
  const filteredNodes = graphNodes.filter((node) => !vertices.includes(node.id));
  const filteredNodesById = [];
  result = [];
  adjlist = [];

  filteredNodes.forEach((node) => {
    filteredNodesById.push(node.id);
  });

  const subGraphNodes = graphNodes.filter((node) => vertices.includes(node.id));

  for (let i = 0; i < subGraphNodes.length; i++) {
    subGraphNodes[i].index = i;
  }

  const subGraphLinks = graphLinks.filter((link) => vertices.includes(link.source.id) && !filteredNodesById.includes(link.target.id));

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
  return true;
}
