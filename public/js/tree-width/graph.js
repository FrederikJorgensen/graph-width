/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */

import * as helpers from '../helpers.js';

let nodes = [];
let links = [];
let nodeSvg;
let linkSvg;
let simulation;
const colors = d3.scaleOrdinal(d3.schemeCategory10);

const animDuration = 4000;

function visitBag(bag, animX) {
  d3.select(`#tree-node-${bag}`)
    .transition()
    .duration(animDuration)
    .delay(animDuration * animX)
    .style('fill', 'orange')
    .ease(d3.easeElastic)
    .attr('r', 22)
    .on('end', (d) => {
      d3.select(`#tree-node-${d.id}`)
        .transition()
        .duration(500)
        .ease(d3.easeElastic)
        .attr('r', 17);
    });
}

async function highlightNodes(node, parentNode, forgottenVertices) {
  await d3
    .selectAll('#tree-container circle')
    .filter((d) => d === node || d === parentNode)
    .transition()
    .duration(500)
    .style('fill', 'orange')
    .style('stroke', 'orange')
    .end();

  d3.select('#am')
    .selectAll('text')
    .data(forgottenVertices)
    .join(
      (enter) => enter
        .append('text')
        .attr('dx', '1.25em')
        .attr('y', '20px')
        .attr('transform', (d, i) => `translate(${i * 30},${0})`)
        .style('font-size', 24)
        .style('fill', 'green')
        .text((d) => d),
      (update) => update.style('fill', 'black'),
      (exit) => exit.remove(),
    );
}

async function animateDeleteNode(node) {
  d3.selectAll('#tree-container line')
    .filter((d) => (d.source === node) || (d.target === node))
    .style('opacity', 0);

  await d3
    .selectAll('#tree-container circle')
    .filter((d) => d === node)
    .transition()
    .duration(500)
    .style('opacity', 0)
    .end();
}

function buildAdjList(newNodes, newLinks) {
  const adjList = {};

  newNodes.forEach((v) => {
    adjList[v.id] = [];
  });

  newLinks.forEach((e) => {
    adjList[e.source.id].push(e.target);
    adjList[e.target.id].push(e.source);
  });

  return adjList;
}

function removeNode(newNodes, node) {
  newNodes.splice(newNodes.indexOf(node), 1);
  return newNodes;
}

function removeLinks(newLinks, node) {
  const linksToRemove = newLinks.filter((l) => l.source === node || l.target === node);
  linksToRemove.map((l) => newLinks.splice(newLinks.indexOf(l), 1));
  return newLinks;
}

export async function dfs() {
  let vertices = d3.selectAll('#tree-container circle').data();
  let edges = d3.selectAll('#tree-container line').data();

  const stack = [];
  const forgottenVertices = [];
  stack.push(vertices[0]);
  let currentVertex;

  /* Run DFS post order */
  while (stack.length) {
    currentVertex = stack[stack.length - 1];

    let tail = true;

    const adjList = buildAdjList(vertices, edges);
    const adj = adjList[currentVertex.id];

    if (adj === undefined) {
      stack.pop();
      continue;
    }

    for (let i = 0; i < adj.length; i++) {
      const v2 = adj[i];
      if (!v2.visited) {
        tail = false;
        v2.visited = true;
        stack.push(v2);
        break;
      }
    }

    if (tail) {
      /* Check for forgotten vertices */

      const parentBag = adjList[currentVertex.id];
      const parentNode = parentBag[0];

      for (let i = 0; i < currentVertex.vertices.length; i++) {
        const n = currentVertex.vertices[i];

        if (forgottenVertices.includes(n)) {
          console.log('this is not valid');
        } else if (parentBag.length) {
          const parentVertices = parentNode.vertices;

          if (!parentVertices.includes(n)) {
            forgottenVertices.push(n);
          }
        }
      }

      /* We visited this leaf now pop it off the stack */
      stack.pop();

      /* Once we visit a leaf we remove it */
      vertices = removeNode(vertices, currentVertex);
      edges = removeLinks(edges, currentVertex);

      /* Animate it */
      await highlightNodes(currentVertex, parentNode, forgottenVertices);
      resetStyles();
      await animateDeleteNode(currentVertex);
    }
  }

  return new Promise((resolve) => resolve());
}

/* export async function cohorence() {
  const visited = new Set();

  const treeNodes = d3.selectAll('#tree-container circle').data();
  const treeLinks = d3.selectAll('#tree-container line').data();

  let adjList = {};

  treeNodes.forEach((v) => {
    adjList[v.id] = [];
  });

  treeLinks.forEach((e) => {
    adjList[e.source.id].push(e.target);
    adjList[e.target.id].push(e.source);
  });

  const forgottenVertices = [];

  async function dfs_walk(node) {
    setTimeout(() => console.log('sup'), 2000);
    visited.add(node);

    const adj = adjList[node.id];

    for (let i = 0; i < adj.length; i++) {
      const succ = adj[i];
      if (!visited.has(succ)) {
        dfs_walk(succ);
      }
    }

    for (let i = 0; i < node.vertices.length; i++) {
      const n = node.vertices[i];

      if (forgottenVertices.includes(n)) {
        console.log('this is not valid');
      } else {
        const parentBag = adjList[node.id];
        let parentVertices = [];
        if (parentBag.length) {
          parentVertices = parentBag[0].vertices;

          if (!parentVertices.includes(n)) {
            forgottenVertices.push(n);
            animateForgottenVertex(node, n, parentBag[0]);
            animX++;
          }
        }
      }
    }
    const linksToRemove = treeLinks.filter((l) => l.source === node || l.target === node);
    linksToRemove.map((l) => treeLinks.splice(treeLinks.indexOf(l), 1));
    treeNodes.splice(treeNodes.indexOf(node), 1);

    const newAdjList = {};

    treeNodes.forEach((v) => {
      newAdjList[v.id] = [];
    });

    treeLinks.forEach((e) => {
      newAdjList[e.source.id].push(e.target);
      newAdjList[e.target.id].push(e.source);
    });

    adjList = newAdjList;
  }
  dfs_walk(treeNodes[0]);
  console.log('this is valid');
} */

function isEdgeInTreeDecomposition(sourceNode, targetNode, animX) {
  const na = d3.selectAll('#tree-container circle').data();

  na.forEach((bag) => {
    if (bag.vertices.includes(sourceNode) && bag.vertices.includes(targetNode)) {
      visitBag(bag.id, animX);
    }
    return false;
  });
  return true;
}

export function edgeCoverage() {
  let animX = 0;

  return new Promise((resolve, reject) => {
    d3.selectAll('line').style('fill', (edge) => {
      const sourceNode = edge.source.id;
      const targetNode = edge.target.id;
      if (isEdgeInTreeDecomposition(sourceNode, targetNode, animX)) {
        d3.select(`#link-${edge.source.id}-${edge.target.id}`)
          .transition()
          .duration(animDuration)
          .delay(animDuration * animX)
          .style('stroke', 'orange')
          .on('end', (edge) => {
            const allEdges = d3.selectAll('#graph-container line').data();
            if (edge === allEdges[allEdges.length - 1]) resolve();
          });
        animX++;
      }
    });
  });
}

export function resetStyles() {
  d3.selectAll('circle')
    .transition()
    .duration(2000)
    .style('fill', colors(1))
    .style('stroke', 'rgb(51, 51, 51)');

  d3.selectAll('line')
    .transition()
    .duration(2000)
    .style('stroke', 'rgb(51, 51, 51)');
}

function isNodeInTreeDecomposition(node, animX) {
  const na = d3.selectAll('#tree-container circle').data();

  na.forEach((bag) => {
    if (bag.vertices.includes(node.id)) {
      visitBag(bag.id, animX);
    }
    return false;
  });
  return true;
}


export function testNodeCoverage() {
  let animX = 0;

  return new Promise((resolve) => {
    d3.selectAll('#graph-container circle').style('fill', (node) => {
      if (isNodeInTreeDecomposition(node, animX)) {
        d3.select(`#node-${node.id}`)
          .transition()
          .duration(animDuration)
          .delay(animDuration * animX)
          .style('fill', 'orange')
          .on('end', (node) => {
            const allNodes = d3.selectAll('#graph-container circle').data();
            if (node === allNodes[allNodes.length - 1]) resolve();
          });
        // visitNode(node, animX);
        animX++;
      }
      return colors(1);
    });
  });
}

function getAllNodes() {
  return d3.selectAll('circle').data();
}

export function getLargestNode() {
  return getAllNodes().length;
}

export function getAllEdges() {
  const convertedArray = [];
  links.forEach((link) => {
    convertedArray.push([link.source.id, link.target.id]);
  });
  return convertedArray;
}

function restart() {
  linkSvg = linkSvg.data(links, (d) => `v${d.source.id}-v${d.target.id}`);
  linkSvg.exit().remove();

  const ed = linkSvg
    .enter()
    .append('line')
    .attr('id', (d) => `link-${d.source.id}-${d.target.id}`)
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
    .call(
      d3
        .drag()
        .on('start', (v) => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          [v.fx, v.fy] = [v.x, v.y];
        })
        .on('drag', (v) => {
          [v.fx, v.fy] = [d3.event.x, d3.event.y];
        })
        .on('end', (v) => {
          if (!d3.event.active) simulation.alphaTarget(0);
          [v.fx, v.fy] = [null, null];
        }),
    );

  g.append('circle')
    .attr('id', (d) => `node-${d.id}`)
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

function recenter() {
  const w = document.getElementById('graph-container').offsetWidth;
  const h = document.getElementById('graph-container').offsetHeight;
  simulation
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('x', d3.forceX(w / 2).strength(0.2))
    .force('y', d3.forceY(h / 2).strength(0.2))
    .alpha(1)
    .restart();
}

function loadGraph() {
  const w = document.getElementById('graph-container').offsetWidth;
  const h = document.getElementById('graph-container').offsetHeight;
  const svg = d3.select('#graph-container').append('svg').attr('width', w).attr('height', h);

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

export function loadAnyGraph(graph, container) {
  const w = document.getElementById(container).offsetWidth;
  const h = document.getElementById(container).offsetHeight;
  const svg = d3.select(`#${container}`).append('svg').attr('width', w).attr('height', h);

  svg.selectAll('line.treeLink')
    .data(graph.links)
    .enter()
    .append('line')
    .attr('class', 'treeLink');

  svg.selectAll('#tree-container g').data(graph.nodes).enter().append('g');

  /*   svg.selectAll('ellipse.treeNode')
  .data(graph.nodes)
  .enter() */

  svg.selectAll('#tree-container g')
    .append('ellipse')
    .attr('rx', (d) => d.label.length * 4.5)
    .attr('ry', 40)
    .attr('class', 'treeNode');

  svg.selectAll('#tree-container g')
    .append('text')
    .text((d) => d.label)
    .attr('class', 'label');

  d3.forceSimulation()
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('x', d3.forceX(w / 2).strength(0.2))
    .force('y', d3.forceY(h / 2).strength(0.2))
    .nodes(graph.nodes)
    .force('charge', d3.forceManyBody().strength(-400))
    .force('link', d3.forceLink(links).id((d) => d.id).distance(50).strength(0.9))
    .on('tick', () => {
      svg.selectAll('#tree-container g').attr('transform', (d) => `translate(${d.x},${d.y})`);

      svg.selectAll('line.treeLink').attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    });

  simulation.force('link').links(graph.links);
}

export function createTrivialTreeDecomposition() {
  const tNodes = [];
  const lol = [];
  const yup = d3.selectAll('#graph-container circle').data();

  yup.forEach((n) => {
    tNodes.push(n.id);
  });

  const onenode = { id: 1, label: JSON.stringify(tNodes).replace('[', '').replace(']', '') };
  lol.push(onenode);
  const tLinks = [];

  return { nodes: lol, links: tLinks };
}


export function main() {
  simulation = d3.forceSimulation();
  recenter();
  window.onresize = recenter;
  loadGraph();
  const randomGraph = helpers.generateRandomGraph(10, 10);
  nodes = randomGraph.nodes;
  links = randomGraph.links;
  restart();
}
