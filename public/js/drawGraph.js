/* eslint-disable no-restricted-syntax */
let nodes = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }];
let links = [
  { source: 1, target: 2 },
  { source: 1, target: 3 },
  { source: 3, target: 7 },
  { source: 6, target: 5 },
  { source: 5, target: 4 },
  { source: 5, target: 7 },
  { source: 5, target: 1 },
];

const width = document.getElementById('graph-svg-container').offsetWidth;
const height = document.getElementById('graph-svg-container').offsetHeight;
const svg = d3.select('#graphSvg').attr('width', width).attr('height', height);
let lastNodeId = 0;
let mousedownNode = null;

const dragLine = svg
  .append('path')
  .attr('class', 'dragLine hidden')
  .attr('d', 'M0,0L0,0');

let linkSvg = svg
  .append('g')
  .selectAll('line');

let nodeSvg = svg
  .append('g')
  .selectAll('circle');

function tick() {
  nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);

  linkSvg.attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);
}

const simulation = d3
  .forceSimulation(nodes)
  .force(
    'charge',
    d3
      .forceManyBody()
      .strength(-300)
      .distanceMax(width / 2),
  )
  .force('link', d3.forceLink(links).distance(60).id((d) => d.id))
  .force('x', d3.forceX(width / 2))
  .force('y', d3.forceY(height / 2))
  .on('tick', tick);

function beginDrawLine(d) {
  d3.event.preventDefault();
  mousedownNode = d;
  dragLine
    .classed('hidden', false)
    .attr(
      'd',
      `M${
        mousedownNode.x
      },${
        mousedownNode.y
      }L${
        mousedownNode.x
      },${
        mousedownNode.y}`,
    );
}

function stopDrawLine(d) {
  if (!mousedownNode || mousedownNode === d) return;
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    if (
      (l.source === mousedownNode && l.target === d)
      || (l.source === d && l.target === mousedownNode)
    ) {
      return;
    }
  }
  const newLink = { source: mousedownNode, target: d };
  links.push(newLink);
}

function removeNode(d) {
  if (d3.event.ctrlKey) return;
  const linksToRemove = links.filter((l) => l.source === d || l.target === d);
  linksToRemove.map((l) => links.splice(links.indexOf(l), 1));
  nodes.splice(nodes.indexOf(d), 1);
  d3.event.preventDefault();
  restart();
}

function restart() {
  linkSvg = linkSvg.data(links);
  linkSvg.exit().remove();

  const ed = linkSvg
    .enter()
    .append('line')
    .attr('class', 'link')
    .on('mousedown', () => {
      d3.event.stopPropagation();
    });

  linkSvg = ed.merge(linkSvg);

  nodeSvg = nodeSvg.data(nodes, (d) => d.id);
  nodeSvg.exit().remove();

  const g = nodeSvg
    .enter()
    .append('g')
    .on('mouseover', function (d) {
      d3.select(this).select('text').classed('highlighted-text', true);
      d3.select(this).select('circle').classed('highlighted-node', true);
    })
    .on('mouseleave', function (d) {
      d3.select(this).select('text').classed('highlighted-text', false);
      d3.select(this).select('circle').classed('highlighted-node', false);
    })
    .on('mousedown', () => {
      d3.event.stopPropagation();
    });

  g.append('circle')
    .attr('id', (d) => `node-${d.id}`)
    .on('mousedown', beginDrawLine)

    .on('mouseup', stopDrawLine)
    .on('contextmenu', removeNode)
    .attr('class', 'node')
    .attr('r', 12)
    .append('title')
    .text((d) => `v${d.id}`);

  g.append('text')
    .text((d) => d.id)
    .attr('dy', '.2em')
    .attr('class', 'label')
    .attr('text-anchor', 'middle');

  nodeSvg = g.merge(nodeSvg);

  simulation.nodes(nodes);
  simulation.force('link').links(links);
  simulation.alpha(0.8).restart();

  svg.property('value', {
    nodes: nodes.map((d) => ({ id: d.index })),
    links: links.map((d) => ({ source: d.source.index, target: d.target.index })),
  });
}

function addNode() {
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  d3.selectAll('g text').classed('highlighted-text', false);
  d3.selectAll('circle').style('stroke', 'black');
  d3.selectAll('#nice-td-svg g').remove();
  const e = d3.event;
  if (e.button === 0) {
    const coords = d3.mouse(e.currentTarget);
    const newNode = {
      x: coords[0], y: coords[1], id: ++lastNodeId, degree: 0,
    };
    nodes.push(newNode);
    restart();
  }
}

function updateDragLine() {
  if (!mousedownNode) return;
  const coords = d3.mouse(d3.event.currentTarget);
  dragLine.attr(
    'd',
    `M${
      mousedownNode.x
    },${
      mousedownNode.y
    }L${
      coords[0]
    },${
      coords[1]}`,
  );
}

function hideDragLine() {
  dragLine.classed('hidden', true);
  mousedownNode = null;
  restart();
}

function leftCanvas() {
  dragLine.classed('hidden', true);
  mousedownNode = null;
}

const getAllSubsets = (theArray) => theArray.reduce(
  (subsets, value) => subsets.concat(
    subsets.map((set) => [value, ...set]),
  ),
  [[]],
);

function subset(array, n) {
  const arr = getAllSubsets(array);
  const newArray = [];
  for (const a of arr) {
    if (a.length === n && a.length <= n) newArray.push(a);
  }
  return newArray;
}

export function newSubGraph(subTree) {
  const subGraphNodeIds = [];

  subTree.forEach((node) => {
    for (const v of node.data.vertices) {
      if (!subGraphNodeIds.includes(v)) subGraphNodeIds.push(v);
    }
  });

  const subGraphNodes = nodes.filter((currentNode) => subGraphNodeIds.includes(currentNode.id));
  const subGraphLinks = links.filter((currentLink) => subGraphNodeIds
    .includes(currentLink.source.id)
    && subGraphNodeIds.includes(currentLink.target.id));


  d3.select('#graphSvg').selectAll('circle').classed('highlighted-node', (node) => {
    if (subGraphNodeIds.includes(node.id)) return true;
    return false;
  });

  d3.select('#graphSvg').selectAll('text').classed('highlighted-text', (node) => {
    if (subGraphNodeIds.includes(node.id)) return true;
    return false;
  });

  d3.select('#graphSvg').selectAll('line').classed('highlighted-link', (link) => {
    if (subGraphNodeIds.includes(link.source.id) && subGraphNodeIds.includes(link.target.id)) {
      return true;
    }
  });

  return { nodes: subGraphNodes, links: subGraphLinks };
}

export function buildAdjacencyList(links) {
  const adjacencyList = [];
  links.forEach((d) => {
    adjacencyList[`${d.source.id}-${d.target.id}`] = true;
    adjacencyList[`${d.target.id}-${d.source.id}`] = true;
  });
  return adjacencyList;
}

function maximumIndependentSet(verticesInSubGraph, adj, set, isHovering) {
  let maximumSet = 0;
  let maximumIndependentSet = [];
  let candidato = true;

  for (let i = 2; i < verticesInSubGraph.length + 1; i++) {
    const conjunto = subset(verticesInSubGraph, i);

    for (const c of conjunto) {
      candidato = true;

      const pares = subset(c, 2);

      for (const par of pares) {
        const test1 = par[0];
        const test2 = par[1];

        for (const s of set) {
          if (adj[`${test1}-${s}`]) {
            candidato = false;
            break;
          }

          if (adj[`${test2}-${s}`]) {
            candidato = false;
            break;
          }
        }

        if (adj[`${test1}-${test2}`]) {
          candidato = false;
          break;
        }
      }

      if (candidato && c.length > maximumSet) {
        maximumSet = c.length;
        maximumIndependentSet = c;
      }
    }
  }
  // if (set !== undefined && set.length > 0) maximumIndependentSet.push(set);
  const v = parseInt(set[0], 10);
  if (!Number.isNaN(v) && v !== undefined && !maximumIndependentSet.includes(v)) maximumIndependentSet.push(v);
  if (isHovering) {
    d3.selectAll('#graphSvg circle').classed('highlighted-stroke', (node) => {
      if (maximumIndependentSet.includes(node.id)) return true;
    });
  }
  return maximumIndependentSet;
}

function isNeighboring(set, introducedVertex, adjacencyList) {
  for (const s of set) {
    if (adjacencyList[`${s}-${introducedVertex}`]) return true;
  }
  return false;
}

function isNeighborInSet(set, adjacencyList) {
  for (let i = 0; i < set.length; i++) {
    const vertex1 = set[i];
    for (let j = 0; j < set.length; j++) {
      const vertex2 = set[j];
      if (vertex1 !== vertex2 && adjacencyList[`${vertex1}-${vertex2}`]) return true;
    }
  }
  return false;
}

export function runMis(subTree, set, introducedVertex, isHovering) {
  if (set.length === 0) return 0;
  const subGraph = newSubGraph(subTree);

  const verticesInSubGraph = [];
  subGraph.nodes.forEach((node) => {
    verticesInSubGraph.push(node.id);
  });

  const adjacencyList = buildAdjacencyList(subGraph.links);
  if (isNeighboring(set, introducedVertex, adjacencyList)) return -9999;
  if (isNeighborInSet(set, adjacencyList)) return -9999;
  const mis = maximumIndependentSet(verticesInSubGraph, adjacencyList, set, isHovering);
  return mis.length;
}

svg
  .on('mousedown', addNode)
  .on('contextmenu', () => {
    d3.event.preventDefault();
  })
  .on('mousemove', updateDragLine)
  .on('mouseup', hideDragLine)
  .on('mouseleave', leftCanvas);

export function getAllEdges() {
  const convertedArray = [];
  links.forEach((link) => {
    convertedArray.push([link.source.id, link.target.id]);
  });
  return convertedArray;
}

export function getLargestNode() {
  return nodes.length;
}

export function startDraw() {
  nodes.splice(0);
  links.splice(0);
  lastNodeId = 0;
  restart();
}

export function loadRandomGraph(graph) {
  nodes = graph.nodes;
  links = graph.links;
  lastNodeId = nodes.length;
  restart();
}

export function checkIntroducedVertex(introducedNode, state, subTree) {
  const subGraph = newSubGraph(subTree);
  const adjList = buildAdjacencyList(subGraph.links);
  adjList[`${introducedNode}-${introducedNode}`] = true;
  const adjacentNodes = subGraph.nodes.filter((node) => adjList[`${node.id}-${introducedNode}`]);
  const adjacentLinks = subGraph.links.filter((link) => link.source.id === introducedNode || link.target.id === introducedNode);
  adjacentNodes.reverse();

  for (let i = 0; i < adjacentNodes.length; i++) {
    const node = adjacentNodes[i];
    node.color = state[i];
  }

  for (const link of adjacentLinks) {
    if (link.source.color === link.target.color) {
      return false;
    }
  }
  return true;
}

restart();
