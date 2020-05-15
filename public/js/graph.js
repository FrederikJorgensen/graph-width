/* eslint-disable no-restricted-syntax */
let lastNodeId = 0;
let mousedownNode = null;
let links = [];
let nodes = [];
let dragLine;
let linkSvg;
let nodeSvg;
let simulation;
let hullG;
let hulls;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
let points = [];
let path;
let seperatorNodes = [];
const line = d3.line().curve(d3.curveBasisClosed);

function beginDrawLine(d) {
  if (d3.event.ctrlKey) return;
  d3.event.preventDefault();
  d3.select('#graph-svg').classed('creating-link', true);
  d3.select(`#node-${d.id}`).classed('highlighted-node', true);
  d3.select(`#text-${d.id}`).classed('highlighted-text', true);
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
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  d3.selectAll('g text').classed('highlighted-text', false);
  d3.selectAll('#nice-td-svg g').remove();
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.select('#graph-svg').classed('creating-link', false);
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
    .on('mouseover', () => {
      d3.select(this).select('text').classed('highlighted-text', true);
      d3.select(this).select('circle').classed('highlighted-node', true);
    })
    .on('mouseleave', () => {
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
    .style('fill', (d) => d3.rgb(colors(1)))
    .attr('r', 17);

  g.append('text')
    .text((d) => d.id)
    .attr('dy', '.2em')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .attr('id', (d) => `text-${d.id}`);

  nodeSvg = g.merge(nodeSvg);

  simulation.nodes(nodes);
  simulation.force('link').links(links);
  simulation.alpha(0.5).restart();
}

function addNode() {
  const e = d3.event;
  console.log(d3.mouse(e.currentTarget));
  if (e.button === 0) {
    const coords = d3.mouse(e.currentTarget);
    const newNode = {
      x: coords[0], y: coords[1], id: ++lastNodeId,
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
  for (let i = 0; i < graph.nodes.length; i++) {
    points = [graph.nodes[i].x, graph.nodes[i].y];
  }
  d3.selectAll('#graph-svg g').remove();
  loadGraph();
  nodes = graph.nodes;
  links = graph.links;
  seperatorNodes = [];
  lastNodeId = nodes.length;
  restart();
}

const drag = d3.drag()
  .filter(() => d3.event.button === 0 || d3.event.button === 2)
  .on('start', (d) => {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
  })
  .on('drag', (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  })
  .on('end', (d) => {
    if (!d3.event.active) simulation.alphaTarget(0);

    d.fx = null;
    d.fy = null;
  });

function ctrlPressed() {
  if (d3.event.keyCode === 17) {
    nodeSvg.call(drag);
    d3.select('#graph-svg').classed('moving-node', true);
  }
}

function hull(points) {
  // No sense in rendering a hull for fewer than two points
  if (points.length < 2) return;

  // polygonHull seems to require a minimum of three points, but works
  // just fine if two of the points are identical, so we can patch over
  // the problem of a two point cluster by duplicating the first point.
  if (points.length < 3) return d3.polygonHull([points[0], ...points]);

  return d3.polygonHull(points);
}

function loadGraph() {
  const graphHeight = document.getElementById('graph-container').offsetHeight;
  const graphWidth = document.getElementById('graph-container').offsetWidth;
  const svg = d3.select('#graph-svg').attr('width', graphWidth).attr('height', graphHeight);

  hullG = svg.append('g')
    .attr('class', 'hulls');

  path = svg.append('path')
    .attr('fill', 'orange')
    .attr('stroke', 'orange')
    .attr('stroke-width', 16)
    .attr('opacity', 0.2);

  dragLine = svg
    .append('path')
    .attr('class', 'dragLine hidden')
    .attr('d', 'M0,0L0,0');

  linkSvg = svg
    .append('g')
    .selectAll('line');

  nodeSvg = svg
    .append('g')
    .selectAll('circle');

  function tick() {
    nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);

    linkSvg.attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    let pointArr = [];
    const padding = 3.5;

    for (let i = 0; i < seperatorNodes.length; i++) {
      const node = seperatorNodes[i];
      const pad = 17 + padding;
      pointArr = pointArr.concat([
        [node.x - pad, node.y - pad],
        [node.x - pad, node.y + pad],
        [node.x + pad, node.y - pad],
        [node.x + pad, node.y + pad],
      ]);
    }
    if (pointArr.length === 0) return;
    path.attr('d', line(hull(pointArr)));
  }

  simulation = d3
    .forceSimulation(nodes)
    .force(
      'charge',
      d3
        .forceManyBody()
        .strength(-400)
        .distanceMax(graphWidth / 2),
    )
    .force('link', d3.forceLink(links).distance(50).strength(0.9).id((d) => d.id))
    .force('x', d3.forceX(graphWidth / 2))
    .force('y', d3.forceY(graphHeight / 2))
    .force('collide', d3.forceCollide().radius(20))
    .on('tick', tick);

  svg
    .on('mousedown', addNode)
    .on('contextmenu', () => {
      d3.event.preventDefault();
    })
    .on('mousemove', updateDragLine)
    .on('mouseup', hideDragLine)
    .on('mouseleave', leftCanvas);

  nodeSvg.call(drag);
}

function ctrlRealesed() {
  if (d3.event.keyCode === 17) {
    nodeSvg.on('.drag', null);
    d3.select('#graph-svg').classed('moving-node', false);
  }
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


  d3.select('#graph-svg').selectAll('circle').classed('highlighted-node', (node) => {
    if (subGraphNodeIds.includes(node.id)) return true;
    return false;
  });

  d3.select('#graph-svg').selectAll('text').classed('highlighted-text', (node) => {
    if (subGraphNodeIds.includes(node.id)) return true;
    return false;
  });

  d3.select('#graph-svg').selectAll('line').classed('highlighted-link', (link) => {
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
  const v = parseInt(set[0], 10);
  if (!Number.isNaN(v) && v !== undefined && !maximumIndependentSet.includes(v)) maximumIndependentSet.push(v);
  if (isHovering) {
    d3.selectAll('#graph-svg circle').classed('highlighted-stroke', (node) => {
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

d3.select(window).on('keydown', ctrlPressed).on('keyup', ctrlRealesed);

window.onload = loadGraph;

d3.select('#myBtn').append('title').text('hi');

// https://www.w3schools.com/howto/howto_css_modals.asp
// Get the modal
const modal = document.getElementById('myModal');

// Get the button that opens the modal
const btn = document.getElementById('myBtn');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

export function showSeperator(vertices) {
  path.attr('opacity', 0.3);
  seperatorNodes = nodes.filter((node) => vertices.includes(node.id));
  const restNodes = nodes.filter((node) => !vertices.includes(node.id));
  simulation.alpha(0.0001).restart();
/*
  const graphWidth = document.getElementById('graph-container').offsetWidth;
  const graphHeight = document.getElementById('graph-container').offsetHeight;


  simulation
    .nodes(restNodes)
    .force('charge', d3.forceManyBody().strength(-1800).distanceMax(5000))
    .force('x', d3.forceX().strength(0.3).x(graphWidth / 2))
    .force('y', d3.forceY().strength(0.3).y(graphHeight / 2))
    .force('collide', null)
    .force('link', null);

  const simulation2 = d3.forceSimulation(seperatorNodes)
    .force('charge', d3.forceManyBody().strength(-150))
    .force('x', d3.forceX().strength(0.3).x(graphWidth / 2))
    .force('y', d3.forceY().strength(0.3).y(graphHeight / 2))
    .force('collide', d3.forceCollide().radius(30));


  // .alphaDecay(0.0005)
  // .velocityDecay(0.6);
  simulation.alpha(1).restart();
  simulation2.alpha(1).restart();


  const adjacencyList = buildAdjacencyList(links);

  const groupA = [];
  const groupB = [];
  for (let i = 0; i < restNodes.length; i++) {
    const node = restNodes[i];
    if (i < restNodes.length / 2) {
      groupA.push(node);
    } else {
      groupB.push(node);
    }
  } */
}

export function hideSeperator() {
  path.attr('opacity', 0);

  /*   const graphWidth = document.getElementById('graph-container').offsetWidth;
  const graphHeight = document.getElementById('graph-container').offsetHeight;

  simulation
    .force('link', d3.forceLink(links).distance(50).strength(0.9).id((d) => d.id))
    .force('x', d3.forceX(graphWidth / 2))
    .force('y', d3.forceY(graphHeight / 2)); */

  simulation.alpha(0.0001).restart();
}
