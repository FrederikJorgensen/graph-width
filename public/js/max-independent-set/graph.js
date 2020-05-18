/* eslint-disable no-restricted-syntax */
let mousedownNode = null;
let nodes = [];
let links = [];
let nodeSvg;
let linkSvg;
let simulation;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
let path;
let hullG;
let points;
let seperatorNodes = [];
const line = d3.line().curve(d3.curveBasisClosed);

function getAllNodes() {
  return d3.selectAll('#graph-svg circle').data();
}

function getLastNodeId() {
  return getAllNodes().length;
}

function addNode() {
  const e = d3.event;
  if (e.button === 0) {
    const coords = d3.mouse(e.currentTarget);
    let lastNodeId = getLastNodeId();
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
  d3.selectAll('path.dragLine').attr(
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
  d3.selectAll('path.dragLine').classed('hidden', true);
  mousedownNode = null;
  restart();
}

function leftCanvas() {
  d3.selectAll('path.dragLine').classed('hidden', true);
  mousedownNode = null;
}

export function getAllEdges() {
  const convertedArray = [];
  links.forEach((link) => {
    convertedArray.push([link.source.id, link.target.id]);
  });
  return convertedArray;
}

export function startDraw() {
  nodes.splice(0);
  links.splice(0);
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
    d3.selectAll('#graph-svg circle').call(drag);
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

function forceClusterCollision() {
  let nodes;
  let radii;
  let strength = 1;
  let iterations = 1;
  let clusterPadding = 0; // addition

  function radius(d) { return d.r; }
  function x(d) { return d.x + d.vx; }
  function y(d) { return d.y + d.vy; }
  function constant(x) { return function () { return x; }; }
  function jiggle() { return 1e-6; } // change - PLEASE no Math.random() in there ಥ﹏ಥ
  // function jiggle() { return (Math.random() - 0.5) * 1e-6 }

  function force() {
    let i;
    const n = nodes.length;
    let tree;
    let node;
    let xi;
    let yi;
    let ri;
    let ri2;

    for (let k = 0; k < iterations; ++k) {
      tree = d3.quadtree(nodes, x, y).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = radii[node.index];
        ri2 = ri * ri;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply);
      }// for i
    }// for k

    function apply(quad, x0, y0, x1, y1) {
      const { data } = quad;
      let rj = quad.r;
      let r = ri + rj + clusterPadding; // change
      if (data) {
        if (data.index > node.index) {
          let x = xi - data.x - data.vx;
          let y = yi - data.y - data.vy;
          let l = x * x + y * y;
          r = ri + rj + (node.cluster !== quad.data.cluster ? clusterPadding : 0); // addition

          if (l < r * r) {
            if (x === 0) x = jiggle(), l += x * x;
            if (y === 0) y = jiggle(), l += y * y;
            l = (r - (l = Math.sqrt(l))) / l * strength;
            node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
            node.vy += (y *= l) * r;
            data.vx -= x * (r = 1 - r);
            data.vy -= y * r;
          }// if
        }// if
        return;
      }// if
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }// apply
  }// force

  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (let i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }// if
    }// for i
  }

  function initialize() {
    if (!nodes) return;
    let i; const n = nodes.length; let
      node;
    radii = new Array(n);
    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
  }

  force.initialize = function (_) {
    nodes = _;
    initialize();
    return force;
  };

  force.iterations = function (_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  // I wish strength could be a function of the node as well...
  force.strength = function (_) {
    return arguments.length ? (strength = +_, force) : strength;
  };

  force.radius = function (_) {
    return arguments.length ? (radius = typeof _ === 'function' ? _ : constant(+_), force) : radius;
  };

  // addition - the actual pixels of padding
  force.clusterPadding = function (_) {
    return arguments.length ? (clusterPadding = +_, force) : clusterPadding;
  };

  return force;
}// function forceCollision


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

function checkConnectivity(restNodes, restLinks) {
  let componentCount;

  if (restNodes.length === 0) {
    componentCount = 0;
    return;
  }

  componentCount = 1;
  restNodes.forEach((v) => {
    v.visited = false;
  });

  // construct adjacency list of graph
  const adjList = {};
  restNodes.forEach((v) => {
    adjList[v.id] = [];
  });
  restLinks.forEach((e) => {
    adjList[e.source.id].push(e.target);
    adjList[e.target.id].push(e.source);
  });

  // perform DFS on nodes
  const q = [];
  q.push(restNodes[0]);

  while (q.length > 0) {
    const v1 = q.shift();
    const adj = adjList[v1.id];

    for (let i = 0; i < adj.length; i++) {
      const v2 = adj[i];
      if (v2.visited) continue;
      q.push(v2);
    }

    v1.visited = true;
    v1.cluster = componentCount;
    // check for unvisited nodes
    if (q.length === 0) {
      for (let i = 0; i < restNodes.length; i++) {
        if (!restNodes[i].visited) {
          q.push(restNodes[i]);
          componentCount++;
          break;
        }
      }
    }
  } // while ends here
  d3.selectAll('#graph-svg circle').style('fill', (d) => d3.rgb(colors(d.cluster)));
}

export function showSeperator(vertices) {
  path.attr('opacity', 0.3);
  seperatorNodes = nodes.filter((node) => vertices.includes(node.id));
  const restNodes = nodes.filter((node) => !vertices.includes(node.id));

  const restLinks = links.filter((link) => {
    if (vertices.includes(link.source.id)) return false;
    if (vertices.includes(link.target.id)) return false;
    return true;
  });

  checkConnectivity(restNodes, restLinks);

  const graphWidth = document.getElementById('graph-container').offsetWidth;
  const graphHeight = document.getElementById('graph-container').offsetHeight;

  const m = 10;

  nodes.map((node) => {
    const i = Math.floor(Math.random() * m); // the cluster id
    const focusX = 110 * Math.cos(i / m * Math.PI * 2);
    const focusY = 110 * Math.sin(i / m * Math.PI * 2);
    if ('cluster' in node === false) {
      node.cluster = 99;
      return;
    }
    node.x = focusX;
    node.y = focusY;
    node.focusX = focusX;
    node.focusY = focusY;
  });

  nodeSvg = nodeSvg.data(nodes);

  simulation
    .alphaDecay(0.0005)
    .velocityDecay(0.6)
    .force('forceInABox',
      forceInABox()
        .strength(0.1) // Strength to cluster center
        .template('force') // Either treemap or force
        .groupBy('cluster') // Node attribute to group
        .forceNodeSize((d) => 70)
        .size([graphWidth, graphHeight]));

  simulation.alpha(0.1).restart();

  d3.selectAll('circle').style('fill', (d) => colors(d.cluster));
}

export function hideSeperator() {
  path.attr('opacity', 0);
  d3.selectAll('#graph-svg circle').style('fill', colors(1));

  nodes.forEach((node) => node.cluster = null);

  simulation
    .force('forceInABox', null)
    .force('charge', d3.forceManyBody().strength(-500));
  simulation.alpha(0.1).restart();
}


function restart(canDraw) {
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  d3.selectAll('g text').classed('highlighted-text', false);
  d3.selectAll('#nice-td-svg g').remove();
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.select('#graph-svg').classed('creating-link', false);

  linkSvg = linkSvg.data(links, (d) => `v${d.source.id}-v${d.target.id}`);
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
    .on('mousedown', (d) => {
      if (canDraw) beginDrawLine(d);
      console.log('clicky');
    })
    .on('mouseup', stopDrawLine)
    .on('contextmenu', removeNode)
    .attr('class', 'node')
    .style('fill', d3.rgb(colors(1)))
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
/*
function loadRandomGraph(graph) {
  for (let i = 0; i < graph.nodes.length; i++) {
    points = [graph.nodes[i].x, graph.nodes[i].y];
  }
  d3.selectAll('#graph-svg g').remove();
  loadGraph();
  nodes = graph.nodes;
  links = graph.links;
  seperatorNodes = [];
  restart();
} */

function beginDrawLine(d) {
  if (d3.event.ctrlKey) return;
  d3.event.preventDefault();
  d3.select('#graph-svg').classed('creating-link', true);
  d3.select(`#node-${d.id}`).classed('highlighted-node', true);
  d3.select(`#text-${d.id}`).classed('highlighted-text', true);
  mousedownNode = d;
  d3.selectAll('path.dragLine')
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

/* function reload() {
  d3.selectAll('g').selectAll('text').classed('highlighted-text', false);
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  const numberOfVertices = document.getElementById('number-of-vertices').textContent;
  const numberOfEdges = document.getElementById('number-of-edges').textContent;
  const randomGraph = generateRandomGraph(numberOfVertices, numberOfEdges);
  graph.loadRandomGraph(randomGraph);
} */

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

/* function tick() {
  d3.selectAll('#graph-svg g circle').attr('transform', (d) => `translate(${d.x},${d.y})`);
  d3.selectAll('#graph-svg g text').attr('transform', (d) => `translate(${d.x},${d.y})`);

  d3.selectAll('#graph-svg g line').attr('x1', (d) => d.source.x)
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
} */

function ctrlRealesed() {
  if (d3.event.keyCode === 17) {
    d3.selectAll('#graph-svg circle').on('.drag', null);
    d3.select('#graph-svg').classed('moving-node', false);
  }
}

function recenter() {
  const w = document.getElementById('graph-container').offsetWidth;
  const h = document.getElementById('graph-container').offsetHeight;
  simulation
    // .force('center', d3.forceCenter(w / 2, h / 2))
    .force('x', d3.forceX(w / 2).strength(0.2))
    .force('y', d3.forceY(h / 2).strength(0.2))
    .alpha(1)
    .restart();
}

export function disableDrawing() {
  d3.select('circle.node').classed('drawing-disabled', true);
}

function loadGraph() {
  const w = document.getElementById('graph-container').offsetWidth;
  const h = document.getElementById('graph-container').offsetHeight;
  const svg = d3.select('#graph-svg').attr('width', w).attr('height', h);
  d3.select('#graph-svg').classed('loading', true);

  linkSvg = svg.append('g').selectAll('link');

  svg
    .append('path')
    .attr('class', 'dragLine hidden')
    .attr('d', 'M0,0L0,0');

  svg.append('g')
    .attr('class', 'hulls');

  svg.append('path')
    .attr('fill', 'orange')
    .attr('stroke', 'orange')
    .attr('stroke-width', 16)
    .attr('opacity', 0.2);

  nodeSvg = svg.selectAll('circle');

  simulation
    .nodes(nodes)
    .force('charge', d3.forceManyBody().strength(-400))
    .force('link', d3.forceLink(links).distance(50).strength(0.9))
    .on('tick', () => {
      nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);

      linkSvg.attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    });

  simulation.force('link').links(links);
  recenter();
  d3.select('#graph-svg').classed('loading', false);
}

d3.select('#graph-svg')
  .on('mousedown', addNode)
  .on('contextmenu', () => {
    d3.event.preventDefault();
  })
  .on('mousemove', updateDragLine)
  .on('mouseup', hideDragLine)
  .on('mouseleave', leftCanvas);

export function main() {
  let query = window.location.search;
  query = query.substr(1);

  let canDraw = true;

  if (query === 'graph-separator') {
    canDraw = false;
    d3.select('#graph-svg').on('mousedown', null)
      .on('mousemove', null)
      .on('mouseup', null)
      .on('mouseleave', null);
  }

  simulation = d3.forceSimulation();
  recenter();
  window.onresize = recenter;
  loadGraph();
  const randomGraph = generateRandomGraph(10, 10);
  nodes = randomGraph.nodes;
  links = randomGraph.links;
  restart(canDraw);
  // loadRandomGraph(randomGraph);
}

window.onload = main;
