
const graphWidth = document.getElementById('graph-container').offsetWidth;
const graphHeight = document.getElementById('graph-container').offsetHeight;
const a = 97;
const charArray = {};
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray[String.fromCharCode(a + i)] = i + 1;
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);

let isRepeling = false;
const adjlist = [];
let currentGraph;
let graphNodes = [];
let graphLinks = [];
let graphLinkSvg;
let graphNodeSvg;
let graphLabelSvg;
let startGraphLinks;
let simulation;

export function loadGraph(graph) {
  currentGraph = graph;
  const { nodes } = graph;
  const { links } = graph;
  graphNodes = nodes;
  graphLinks = links;
  startGraphLinks = links;

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
    .attr('class', 'graphNode');

  graphLabelSvg = svg
    .append('g')
    .selectAll('text')
    .data(graphNodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.label);

  graphLinks.forEach((d) => {
    adjlist[`${d.source.index}-${d.target.index}`] = true;
  });

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
    .force('link', d3.forceLink(graphLinks).id((d) => d.id).distance(40).strength(0.9))
    .force('charge', d3.forceManyBody().strength(-800))
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
  graphLabelSvg.attr('opacity', 1);
  resetGraph(startGraphLinks);
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

const testGraph = {
  nodes: [
    {
      id: 1,
      label: 1,
    },
    {
      id: 2,
      label: 2,
    },
    {
      id: 3,
      label: 3,
    },
    {
      id: 4,
      label: 4,
    },
    {
      id: 5,
      label: 5,
    },
    {
      id: 6,
      label: 6,
    },
    {
      id: 7,
      label: 7,
    },
    {
      id: 9,
      label: 9,
    },
    {
      id: 10,
      label: 10,
    },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 7 },
    { source: 7, target: 6 },
    { source: 6, target: 2 },
    { source: 6, target: 10 },
    { source: 6, target: 9 },
    { source: 4, target: 9 },
    { source: 4, target: 5 },
    { source: 5, target: 10 },
  ],
};

loadGraph(testGraph, '#graphSvg');
