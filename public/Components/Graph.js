/* eslint-disable func-names */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-return-assign */
/* eslint-disable array-callback-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-async-promise-executor */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-return */
/* eslint-disable no-bitwise */
import generateRandomGraph from '../Utilities/helpers.js';
import * as readTree from '../Utilities/readTree.js';
import { contextMenu as menu } from './ContextMenu.js';

const colors = d3.scaleOrdinal(d3.schemeCategory10);

function hull(points) {
  if (points.length < 2) return;
  if (points.length < 3) return d3.polygonHull([points[0], ...points]);
  return d3.polygonHull(points);
}

function generatePowerSet(array, n) {
  const result = [];

  for (let i = 1; i < (1 << array.length); i++) {
    const subset = [];
    for (let j = 0; j < array.length; j++) if (i & (1 << j)) subset.push(array[j]);

    if (subset.length === n) result.push(subset);
  }

  return result;
}

function highlightVertex(nodeId) {
  d3.select(`#graph-node-${nodeId}`)
    .transition()
    .duration(200)
    .style('fill', 'orange');
}

function removeHighlightVertex(nodeId) {
  d3.select(`#graph-node-${nodeId}`)
    .transition()
    .duration(200)
    .style('fill', '#1f77b4');
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function repeat(nodesToHighlight, animationSpeed) {
  return new Promise(async (resolve) => {
    let i = 0;
    while (i < 5) {
      d3.selectAll('circle')
        .filter((node) => nodesToHighlight.includes(node))
        .transition()
        .duration(200)
        .style('fill', 'orange')
        .transition()
        .duration(200)
        .style('fill', '#1f77b4');
      i++;
      await timeout(animationSpeed);
      if (i === 4) {
        resolve();
      }
    }
  });
}

/* https://stackoverflow.com/a/47147597/4169689 */
const getAllSubsets = (theArray) => theArray.reduce(
  (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
  [[]],
);

function makeRequest(method, url, data) {
  return new Promise(((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send(data);
  }));
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

export default class Graph {
  constructor(container) {
    this.container = container;
    this.maxStop = false;
    this.animationSpeed = 500;
    this.selectedNodes = [];
    this.isHoverEffect = false;
    this.animDuration = 2000;
    this.testingCoherence = false;
    this.cancel = false;
    this.lastNodeId = 0;
    this.masterNodes = new Set();
    this.nodes = [];
    this.links = [];
  }

  isIntroducedVertexNeighbor(set, introducedVertex, adjacencyList) {
    for (const s of set) {
      if (adjacencyList[`${s}-${introducedVertex}`]) return true;
    }
    return false;
  }

  isVertexAdjacent(subTree, array) {
    const subGraph = this.newSubGraph(subTree);

    const verticesInSubGraph = [];
    subGraph.nodes.forEach((node) => {
      verticesInSubGraph.push(node.id);
    });

    const adjacencyList = this.returnAdj(subGraph.links);

    if (this.isNeighborInSet(array, adjacencyList)) return true;
    return false;
  }

  showSeparator(vertices) {
    /* Keep track of the separating nodes for the overlay */
    this.separatorNodes = this.nodes.filter((node) => vertices.includes(node.id));

    /* Make overlay visible */
    this.path.style('opacity', 0.3);

    /* Get all the nodes that are not part of the separating set */
    const restNodes = this.nodes.filter((node) => !vertices.includes(node.id));

    /* Get all the links after removing separating set */
    const restLinks = this.links.filter((link) => {
      if (vertices.includes(link.source.id)) return false;
      if (vertices.includes(link.target.id)) return false;
      return true;
    });
    /* Check connectivity such that we can assign a cluster to each component */
    this.checkConnectivity(restNodes, restLinks);

    this.nodes.map((node) => {
      if ('cluster' in node === false || node.cluster === null) {
        node.cluster = 1;
        return;
      }
    });

    d3.selectAll('circle').style('fill', (d) => colors(d.cluster));

    this.simulation.force('link',
      d3.forceLink(this.links)
        .distance(2)
        .strength(0.1))
      .force('collision', d3.forceCollide().radius(30));

    this.simulation.force('charge', d3.forceManyBody().strength(-1500));

    const groupingForce = forceInABox()
      .strength(0.4) // Strength to foci
      .template('force') // Either treemap or force
      .groupBy('cluster') // Node attribute to group
      .links(this.links)
      .enableGrouping(true)
      .linkStrengthInterCluster(0) // linkStrength between nodes of different clusters
      .linkStrengthIntraCluster(0) // linkStrength between nodes of the same cluster
      .forceLinkDistance(250)
      .forceCharge(-2000); // Charge between the meta-nodes (Force template only)

    this.simulation.force('group', groupingForce);
    this.simulation.alpha(0.07).restart();
  }

  hideSeparator() {
    this.path.style('opacity', 0);

    d3.selectAll('circle').style('fill', '#1f77b4');

    this.nodes.forEach((node) => node.cluster = null);

    /*     d3.forceSimulation()
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('x', d3.forceX(w / 2).strength(0.2))
      .force('y', d3.forceY(h / 2).strength(0.2))
      .nodes(graph.nodes)
      .force('charge', d3.forceManyBody().strength(-600).distanceMin(15))
      .force('link', d3.forceLink(graph.links).id((d) => d.id).distance(85).strength(0.8))
      .force('collision', d3.forceCollide().radius(20)) */

    const groupingForce = forceInABox()
      .strength(0) // Strength to foci
      .template('force') // Either treemap or force
      .groupBy('cluster') // Node attribute to group
      .links(this.links)
      .linkStrengthInterCluster(0) // linkStrength between nodes of different clusters
      .linkStrengthIntraCluster(0) // linkStrength between nodes of the same cluster
      .forceCharge(0); // Charge between the meta-nodes (Force template only)

    this.simulation
      .force('group', groupingForce)
      .force('link', d3.forceLink(this.links).id((d) => d.id).distance(85).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-600).distanceMin(15));

    this.simulation.alpha(0.1).restart();
  }

  showCoherence(vertices) {
    d3.selectAll('circle')
      .filter((node) => vertices.includes(node.id))
      .transition()
      .duration(300)
      .style('opacity', 0);

    d3.selectAll('#graph-container text')
      .filter((node) => vertices.includes(node.id))
      .transition()
      .duration(300)
      .style('opacity', 0);

    d3.selectAll('#graph-container line')
      .filter((link) => vertices.includes(link.source.id) || vertices.includes(link.target.id))
      .transition()
      .duration(300)
      .style('opacity', 0);
  }

  hideCoherence() {
    d3.selectAll('circle')
      .filter((node) => node.id !== 0)
      .transition()
      .duration(300)
      .style('opacity', 1);

    d3.selectAll('line')
      .transition()
      .duration(300)
      .style('opacity', 1);

    d3.selectAll('#graph-container text')
      .filter((node) => node.id !== 0)
      .transition()
      .duration(300)
      .style('opacity', 1);
  }

  toggleCoherenceProof() {
    d3.selectAll('ellipse').on('mouseover', (d) => this.graphOfTd.showCoherence(d.vertices));
    d3.selectAll('ellipse').on('mouseout', () => this.graphOfTd.hideCoherence());
  }

  toggleSeparator() {
    d3.selectAll('ellipse').on('mouseover', (d) => this.graphOfTd.showSeparator(d.vertices));
    d3.selectAll('ellipse').on('mouseout', () => this.graphOfTd.hideSeparator());
  }

  async animateDeleteNode(node) {
    if (this.cancel) return;

    d3.selectAll('#tree-container line')
      .filter((d) => (d.source === node) || (d.target === node))
      .transition()
      .duration(this.animDuration)
      .style('opacity', 0);

    d3
      .selectAll('#tree-container text')
      .filter((d) => d === node)
      .transition()
      .duration(this.animDuration)
      .style('opacity', 0);

    await d3
      .selectAll('#tree-container ellipse')
      .filter((d) => d === node)
      .transition()
      .duration(this.animDuration)
      .style('opacity', 0)
      .end();
  }

  async highlightNodes(node, parentNode, forgottenVertices) {
    if (this.cancel) return;
    await d3
      .selectAll('#tree-container ellipse')
      .filter((d) => d === node || d === parentNode)
      .transition()
      .duration(this.animDuration)
      .style('fill', 'orange')
      .end();

    d3.select('.math-container').html(`Forgotten vertices: ${forgottenVertices}`);
  }

  visitBag(bagId) {
    d3.selectAll('ellipse')
      .filter((treeNode) => treeNode.id === bagId)
      .transition()
      .duration(this.animDuration)
      .delay(this.animDuration * this.anim)
      .style('fill', 'orange')
      .ease(d3.easeElastic)
      .attr('rx', 40)
      .attr('ry', 30)
      .on('end', () => {
        d3.selectAll('ellipse').style('fill', '#2ca02c');
        d3.selectAll('ellipse')
          .filter((treeNode) => treeNode.id === bagId)
          .transition()
          .duration(this.animDuration)
          .ease(d3.easeElastic)
          .attr('rx', 35)
          .attr('ry', 25);
      });
  }

  isEdgeInTreeDecomposition(sourceNode, targetNode) {
    const na = d3.selectAll('#tree-container ellipse').data();

    na.forEach((bag) => {
      if (bag.vertices.includes(sourceNode) && bag.vertices.includes(targetNode)) {
        this.visitBag(bag.id);
      }
      return false;
    });
    return true;
  }

  isNodeInTreeDecomposition(node) {
    const na = d3.selectAll('#tree-container ellipse').data();

    na.forEach((bag) => {
      if (bag.vertices.includes(node.id)) {
        this.visitBag(bag.id);
      }
      return false;
    });
    return true;
  }

  checkIntroducedVertex(introducedNode, positionTracker, oldState, color, subTree) {
    /* Get the subgraph rooted at this tree */
    const subGraph = this.newSubGraph(subTree);

    /* Reset the coloring */
    subGraph.nodes.forEach((node) => node.color = null);

    /* Color the nodes according to the oldState */
    for (let i = 0; i < positionTracker.length; i++) {
      const n = subGraph.nodes.find((node) => node.id === positionTracker[i]);
      n.color = oldState[i];
    }

    /* Give the introduced vertex a color */
    const iNode = subGraph.nodes.find((node) => node.id === introducedNode);
    iNode.color = color;

    for (const link of subGraph.links) {
      if (link.source.color !== null && !link.target.color !== null) {
        if (link.source.color === link.target.color) {
          return false;
        }
      }
    }
    return true;
  }

  newSubGraph(subTree) {
    const subGraphNodeIds = [];

    subTree.forEach((node) => {
      for (const v of node.data.vertices) {
        if (!subGraphNodeIds.includes(v)) subGraphNodeIds.push(v);
      }
    });

    const subGraphNodes = this.nodes.filter((currentNode) => subGraphNodeIds.includes(currentNode.id));
    const subGraphLinks = this.links.filter((currentLink) => subGraphNodeIds
      .includes(currentLink.source.id)
        && subGraphNodeIds.includes(currentLink.target.id));

    d3.select('#graph-container').selectAll('circle').classed('highlighted-node', (node) => {
      if (subGraphNodeIds.includes(node.id)) return true;
      return false;
    });

    d3.select('#graph-container').selectAll('text').classed('highlighted-text', (node) => {
      if (subGraphNodeIds.includes(node.id)) return true;
      return false;
    });

    d3.select('#graph-container').selectAll('line').classed('highlighted-link', (link) => {
      if (subGraphNodeIds.includes(link.source.id) && subGraphNodeIds.includes(link.target.id)) {
        return true;
      }
    });

    return { nodes: subGraphNodes, links: subGraphLinks };
  }


  isNeighborInSet(set, adjacencyList) {
    for (let i = 0; i < set.length; i++) {
      const vertex1 = set[i];
      for (let j = 0; j < set.length; j++) {
        const vertex2 = set[j];
        if (vertex1 !== vertex2 && adjacencyList[`${vertex1}-${vertex2}`]) return true;
      }
    }
    return false;
  }

  max(verticesInSubGraph, adj, set, isHovering) {
    let maximumSet = 0;
    let maximumIndependentSet = [];
    let candidato = true;

    for (let i = 2; i < verticesInSubGraph.length + 1; i++) {
      const conjunto = generatePowerSet(verticesInSubGraph, i);

      for (const c of conjunto) {
        candidato = true;

        const pares = generatePowerSet(c, 2);

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
      d3.selectAll('#graph-container circle').classed('highlighted-stroke', (node) => {
        if (maximumIndependentSet.includes(node.id)) return true;
      });
    }
    return maximumIndependentSet;
  }

  returnAdj(links) {
    const adjacencyList = [];
    links.forEach((d) => {
      adjacencyList[`${d.source.id}-${d.target.id}`] = true;
      adjacencyList[`${d.target.id}-${d.source.id}`] = true;
    });
    return adjacencyList;
  }

  runMis(subTree, set, introducedVertex, isHovering) {
    if (set.length === 0) return 0;
    const subGraph = this.newSubGraph(subTree);

    const verticesInSubGraph = [];
    subGraph.nodes.forEach((node) => {
      verticesInSubGraph.push(node.id);
    });

    const adjacencyList = this.returnAdj(subGraph.links);

    /* Check if the introduced vertex is a neighbor to any of the vertices in the set */
    if (this.isIntroducedVertexNeighbor(set, introducedVertex, adjacencyList)) return -9999;

    /* Check if any vertex in the set is neighboring eachother */
    if (this.isNeighborInSet(set, adjacencyList)) return -9999;

    const mis = this.max(verticesInSubGraph, adjacencyList, set, isHovering);
    return mis.length;
  }

  computeTrivialTreeDecomposition() {
    const tNodes = [];
    const lol = [];

    this.nodes.forEach((node) => {
      if (node.id !== 0) tNodes.push(node.id);
    });

    const onenode = { id: 1, label: JSON.stringify(tNodes).replace('[', '').replace(']', '') };
    lol.push(onenode);
    const tLinks = [];

    return { nodes: lol, links: tLinks };
  }

  async testCoherence() {
    let vertices = d3.selectAll('#tree-container ellipse').data();
    let edges = d3.selectAll('#tree-container line').data();

    /* Make sure all nodes are unvisited */
    vertices.forEach((vertex) => vertex.visited = false);

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
            /* not valid coherence */
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
        await this.highlightNodes(currentVertex, parentNode, forgottenVertices);
        d3.selectAll('ellipse').transition().duration(this.animDuration).style('fill', '#2ca02c');
        await this.animateDeleteNode(currentVertex);
      }
    }

    return new Promise(async (resolve) => {
      await timeout(3000);
      resolve();
    });
  }

  edgeCoverage() {
    return new Promise((resolve) => {
      d3.selectAll('#graph-container line').style('fill', (edge) => {
        const sourceNode = edge.source.id;
        const targetNode = edge.target.id;
        d3.select(`#link-${edge.source.id}-${edge.target.id}`)
          .transition()
          .duration(this.animDuration)
          .delay(this.animDuration * this.anim)
          .style('stroke', 'orange')
          .style('stroke-width', '5px')
          .on('end', (edge) => {
            d3.selectAll('#graph-container line')
              .style('stroke', 'rgb(51, 51, 51)')
              .style('stroke-width', '3.5px');

            const allEdges = d3.selectAll('#graph-container line').data();
            if (edge === allEdges[allEdges.length - 1]) resolve();
          });

        d3.selectAll('#tree-container ellipse')
          .filter((bag) => bag.vertices.includes(sourceNode) && bag.vertices.includes(targetNode))
          .transition()
          .duration(this.animDuration)
          .delay(this.animDuration * this.anim)
          .style('fill', 'orange')
          .on('end', () => {
            d3.selectAll('ellipse').style('fill', '#2ca02c');
          });

        this.anim++;
      });
    });
  }

  resetLinkStyles() {
    d3.selectAll('#tree-container line').style('opacity', 1);
  }

  resetTextStyles() {
    d3.selectAll('#tree-container text')
      .style('opacity', 1);
  }

  testNodeCoverage() {
    return new Promise((resolve) => {
      d3.selectAll('#graph-container circle').style('fill', (node) => {
        d3.select(`#graph-node-${node.id}`)
          .transition()
          .duration(this.animDuration)
          .delay(this.animDuration * this.anim)
          .style('fill', 'orange')
          .on('end', (node) => {
            d3.selectAll('#graph-container circle')
              .style('fill', '#1f77b4');
            const allNodes = d3.selectAll('#graph-container circle').data();
            if (node === allNodes[allNodes.length - 1]) resolve();
          });


        d3.selectAll('ellipse')
          .filter((bag) => bag.vertices.includes(node.id))
          .transition()
          .duration(this.animDuration)
          .delay(this.animDuration * this.anim)
          .style('fill', 'orange')
          .on('end', () => {
            d3.selectAll('ellipse')
              .style('fill', '#2ca02c');
          });

        this.anim++;
      });
    });
  }

  stopAllTransitions() {
    d3.selectAll('circle').interrupt();
    d3.selectAll('line').interrupt();
    d3.selectAll('ellipse').interrupt();
    d3.selectAll('text').interrupt();
  }

  async runCoherence() {
    /* Reset all the styling and stop any running transitions */
    this.resetLinkStyles();
    this.resetTextStyles();
    this.resetTreeDecompositionStyles();
    this.stopAllTransitions();

    /* Run the the algorithm without animation if it is already running */
    this.cancel = true;
    await this.testCoherence();
    this.cancel = false;

    /* Run the  algorithm normally with animation */
    await this.testCoherence();
    return new Promise((resolve) => resolve());
  }

  async runEdgeCoverage() {
    d3.select('.math-container').html(null);
    this.anim = 0;
    this.resetLinkStyles();
    this.resetTreeDecompositionStyles();
    this.stopAllTransitions();
    await this.edgeCoverage();
    d3.select('.math-container').html(`<span class="material-icons correct-answer">check</span> Since every edge and its adjacent vertices appear in some 
    bag of the tree decomposition it also satifies <strong>property 2</strong>.
    <br><br>
    NOTE: It's possible not all the bags in the tree decomposition is highlighted if the graph contains isolated vertices since they obviously do not have an edge and therefor we don't test it.`);
  }


  async runNodeCoverage() {
    d3.select('.math-container').html(null);
    this.stopAllTransitions();
    this.resetTreeDecompositionStyles();
    this.anim = 0;
    await this.testNodeCoverage();
    d3.select('.math-container').html('<span class="material-icons correct-answer">check</span> Every vertex in the graph appears in some bag of the tree decomposition, so it satifies <strong>property 1</strong>.');
  }

  getAllEdges() {
    const convertedArray = [];
    this.links.forEach((link) => {
      convertedArray.push([link.source.id, link.target.id]);
    });
    return convertedArray;
  }

  getLargestNode() {
    return this.nodes.length;
  }

  getTreeDecomposition() {
    return readTree.readTreeDecomposition(this.td);
  }

  getNiceTreeDecomposition() {
    return readTree.readNiceTreeDecomposition(this.nicetd);
  }

  async readNiceTreeDecomposition() {
    return new Promise(async (resolve) => {
      const response = await fetch('../../tree-decomposition-files/nicetd.td');
      const text = await response.text();
      this.nicetd = text.split('\n');
      resolve();
    });
  }

  async readTreeDecomposition() {
    return new Promise(async (resolve) => {
      const response = await fetch('../../tree-decomposition-files/td.td');
      const text = await response.text();
      this.td = text.split('\n');
      resolve();
    });
  }

  async computeTreeDecomposition() {
    return new Promise((resolve) => {
      const newJson = { edges: this.getAllEdges(), largestNode: this.getLargestNode() - 1 };
      const jsonString = JSON.stringify(newJson);
      makeRequest('POST', '/compute', jsonString).then(() => resolve());
    });
  }

  resetExercises() {
    this.resetNodeStyling();
    this.selectedNodes = [];
  }

  resetNodeStyling() {
    d3.selectAll('circle').style('fill', null);

    d3.selectAll('circle')
      .classed('nonhighlight', true)
      .classed('not-separating-node', false)
      .classed('separating-node', false);

    d3.selectAll('line').style('stroke', 'black');
  }

  colorSeparating() {
    d3.selectAll('circle')
      .filter((node) => this.selectedNodes.includes(node.id))
      .classed('separating-node', true);
  }

  colorNotSeparating() {
    d3.selectAll('circle')
      .filter((node) => this.selectedNodes.includes(node.id))
      .classed('not-separating-node', true);
  }

  toggleBalanceSeparatorExercise() {
    d3.selectAll('circle').on('click', (d) => this.checkBalanceSeparator(d));
  }

  isSeparatorSet(set) {
    /* Remove the current separtor nodes */
    const subGraphNodes = this.nodes.filter((node) => !set.includes(node.id));

    /* Remove the links from the separator node */
    const linksToRemove = this.links.filter((l) => {
      if (set.includes(l.target.id) || set.includes(l.source.id)) return true;
    });
    const subGraphLinks = this.links.filter((link) => !linksToRemove.includes(link));

    /* Check if the new subgraph after deleting the separating set is connected */
    return this.checkConnectivity(subGraphNodes, subGraphLinks);
  }

  checkBalanceSeparator(d) {
    if (this.selectedNodes.includes(d.id)) {
      const nodeToRemove = this.selectedNodes.indexOf(d.id);
      this.selectedNodes.splice(nodeToRemove, 1);

      if (this.selectedNodes.length === 0) {
        d3.select('#separator-output').html(null);
        this.resetNodeStyling();
        return;
      }

      /* After removing a separating node check if the remaining vertices are still adjacent */
      if (this.selectedNodes.length > 1 && this.isSeparatingNodesAdjacent() === false) {
        this.resetNodeStyling();
        this.colorNotSeparating();
        d3.select('#separator-output').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is a balanced separator!<span class="material-icons correct-answer">check</span>`);
        renderMathInElement(document.body);
        return;
      }
    } else {
      this.selectedNodes.push(d.id);
    }

    /* Original graph's vertices subtracting the vertex separator set */
    const balanceLimit = (this.nodes.length - this.selectedNodes.length) / 2;

    /* Get the subgraph, sublinks and whether the graph is disconnected */
    const obj = this.isSeparatorSet(this.selectedNodes);

    /* First check if the graph is disconnected */
    if (obj.isDisconnected === true) {
      const newnodes = obj.subGraphNodes;
      const connectedComponents = {};

      /* Count the vertices in each component */
      for (const node of newnodes) {
        if ('cluster' in node) {
          const nc = node.cluster;
          connectedComponents[nc] = connectedComponents[nc] + 1 || 1;
        }
      }

      const componentLength = Object.values(connectedComponents);

      /* Test each component length against the balance limit */
      for (const cl of componentLength) {
        if (cl > balanceLimit) {
          this.resetNodeStyling();
          this.colorNotSeparating();
          d3.select('#separator-output').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a balanced separator!<span class="material-icons wrong-answer">clear</span>`);
          renderMathInElement(document.body);
          return;
        }
      }
      this.resetNodeStyling();
      this.colorSeparating();
      d3.select('#separator-output').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is a balanced separator!<span class="material-icons correct-answer">check</span>`);
      renderMathInElement(document.body);
    } else {
      this.resetNodeStyling();
      this.colorNotSeparating();
      d3.select('#separator-output').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a balanced separator!<span class="material-icons wrong-answer">clear</span>`);
      renderMathInElement(document.body);
    }
  }

  checkMinimalSeparator(d) {
    if (this.selectedNodes.includes(d.id)) {
      const nodeInSeparatorSet = this.selectedNodes.indexOf(d.id);
      this.selectedNodes.splice(nodeInSeparatorSet, 1);
      if (this.selectedNodes.length === 0) {
        d3.select('#separator-output').html('Click on a vertex to include it into the separator set.');
        this.resetNodeStyling();
        return;
      }
    } else {
      this.selectedNodes.push(d.id);
    }

    /* Get all proper subsets of current selected separator */
    const allSubsets = getAllSubsets(this.selectedNodes);
    const allProperSubsets = allSubsets.filter(
      (subset) => subset.length !== this.selectedNodes.length && subset.length !== 0,
    );

    /* Get the sub graph and whether it is disconnected */

    /* Check if any the proper subsets is a separator in the graph */
    for (const set of allProperSubsets) {
      const sg = this.isSeparatorSet(set);
      if (sg.isDisconnected) {
        this.resetNodeStyling();
        this.colorNotSeparating();
        d3.select('#separator-output').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a minimal separator!<span class="material-icons wrong-answer">clear</span>`);
        renderMathInElement(document.body);
        return;
      }
    }

    const subg = this.isSeparatorSet(this.selectedNodes);

    if (subg.isDisconnected) {
      this.resetNodeStyling();
      this.colorSeparating();
      d3.select('#separator-output').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is a minimal separator!<span class="material-icons correct-answer">check</span>`);
      renderMathInElement(document.body);
      return;
    }
    this.resetNodeStyling();
    this.colorNotSeparating();
    d3.select('#separator-output').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a minimal separator!<span class="material-icons wrong-answer">clear</span>`);
    renderMathInElement(document.body);
  }

  toggleMinimalSeparatorExercise() {
    d3.selectAll('circle').on('click', (d) => this.checkMinimalSeparator(d));
  }

  checkConnectivity(subGraphNodes, subGraphLinks) {
    let componentCount = 1;
    let cluster = 2;

    if (subGraphNodes.length === 0) {
      componentCount = 0;
      return;
    }

    componentCount = 1;
    subGraphNodes.forEach((v) => {
      v.visited = false;
    });

    const adjList = {};
    subGraphNodes.forEach((v) => {
      adjList[v.id] = [];
    });

    subGraphLinks.forEach((e) => {
      adjList[e.source.id].push(e.target);
      adjList[e.target.id].push(e.source);
    });

    const q = [];
    q.push(subGraphNodes[0]);

    while (q.length > 0) {
      const v1 = q.shift();
      const adj = adjList[v1.id];

      for (let i = 0; i < adj.length; i++) {
        const v2 = adj[i];
        if (v2.visited) continue;
        q.push(v2);
      }

      v1.visited = true;
      v1.cluster = cluster.toString();
      if (q.length === 0) {
        for (let i = 0; i < subGraphNodes.length; i++) {
          if (!subGraphNodes[i].visited) {
            q.push(subGraphNodes[i]);
            componentCount++;
            cluster++;
            break;
          }
        }
      }
    }

    this.componentCount = componentCount;

    // d3.selectAll('circle.node').style('fill', (d) => colors(d.cluster));

    const isDisconnected = componentCount > 1;

    return { subGraphNodes, subGraphLinks, isDisconnected };
  }

  isNeighboringSeparatedNodes(newNode) {
    for (const node of this.selectedNodes) {
      if (this.adjacencyList[`${node}-${newNode}`]) return true;
    }
    return false;
  }


  isNeighboring(nodeToCheck) {
    return this.selectedNodes.some((selectNode) => {
      if (this.adjacencyList[`${selectNode}-${nodeToCheck}`]) {
        return true;
      }
      return false;
    });
  }

  isSeparatingNodesAdjacent() {
    return this.selectedNodes.every((node) => {
      if (this.isNeighboring(node)) {
        return true;
      }
      return false;
    });
  }

  checkSeparator(d) {
    /* If node clicked on is already in the separator set we remove it */
    if (this.selectedNodes.includes(d.id)) {
      const nodeInSeparatorSet = this.selectedNodes.indexOf(d.id);
      this.selectedNodes.splice(nodeInSeparatorSet, 1);

      /* If the new separating set is empty reset the result and the styling */
      if (this.selectedNodes.length === 0) {
        d3.select('#separator-output').html('Click on a vertex to include it into the separator set.');
        this.resetNodeStyling();
        return;
      }
    } else {
      this.selectedNodes.push(d.id);
    }

    /* Remove the current separator nodes */
    const subGraphNodes = this.nodes.filter(
      (node) => !this.selectedNodes.includes(node.id),
    );

    /* Remove the links from the separator node */
    const linksToRemove = this.links.filter((l) => {
      if (
        this.selectedNodes.includes(l.target.id)
      || this.selectedNodes.includes(l.source.id)
      ) return true;
    });
    const subGraphLinks = this.links.filter((link) => !linksToRemove.includes(link));

    /* Check if the new subgraph after deleteing the separating set is connected */
    const subg = this.checkConnectivity(subGraphNodes, subGraphLinks);


    if (subg.isDisconnected) {
      this.resetNodeStyling();
      this.colorSeparating();
      d3.select('#separator-output').html(`The set \\( S = \\{ ${this.selectedNodes} \\} \\) is indeed a separator in the graph. 
      <span class="material-icons correct-answer">check</span> 
      <br/><br/>Because if we remove the separator it would disconnect the graph into <strong>${this.componentCount}</strong> different components.`);
      renderMathInElement(document.body);
    } else {
      this.resetNodeStyling();
      this.colorNotSeparating();
      d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a separator in the graph.  <span class="material-icons wrong-answer">clear</span>`);
      renderMathInElement(document.body);
    }
  }

  toggleSeparatorExercise() {
    d3.selectAll('circle').on('click', (d) => this.checkSeparator(d));
  }

  toggleMaxStop() {
    if (this.maxStop) {
      this.maxStop = false;
    } else {
      this.maxStop = true;
    }
  }

  buildAdjacencyList() {
    const adjacencyList = [];
    this.links.forEach((d) => {
      adjacencyList[`${d.source.id}-${d.target.id}`] = true;
      adjacencyList[`${d.target.id}-${d.source.id}`] = true;
    });
    this.adjacencyList = adjacencyList;
  }

  async maximumIndependentSet() {
    return new Promise(async (resolve) => {
      let maximumSet = 0;
      let maximumIndependentSet = [];
      let possibleMaxSet = true;

      for (let i = 2; i < this.nodes.length + 1; i++) {
        if (this.maxStop === true) break;
        const conjunto = generatePowerSet(this.nodes, i);

        for (const c of conjunto) {
          possibleMaxSet = true;
          const pair = generatePowerSet(c, 2);

          if (this.maxStop === true) break;

          for (const par of pair) {
            const vertex1 = par[0];
            const vertex2 = par[1];
            if (this.animationSpeed > 0) {
              highlightVertex(vertex1.id);
              highlightVertex(vertex2.id);
              await timeout(this.animationSpeed);
              removeHighlightVertex(vertex1.id);
              removeHighlightVertex(vertex2.id);
            }

            if (this.maxStop === true) break;

            if (this.adjacencyList[`${vertex1.id}-${vertex2.id}`]) {
              possibleMaxSet = false;
              break;
            }
          }

          if (possibleMaxSet && c.length > maximumSet) {
            maximumSet = c.length;
            maximumIndependentSet = c;
            const result = [];
            maximumIndependentSet.forEach((n) => {
              n.isMax = true;
              result.push(n.id);
            });

            if (this.animationSpeed > 0) {
              await repeat(c, this.animationSpeed * 1.5);
              await timeout(this.animationSpeed * 1.5);
            }

            d3.select('#max-output').html(String.raw`Maximum Independent Set = \( \{ ${result} \} \)`);
            renderMathInElement(document.body);
          }
        }
      }
      this.resetNodeStyling();
      d3.selectAll('circle').interrupt();
      d3.selectAll('circle').filter((node) => maximumIndependentSet.includes(node)).style('fill', 'orange');
      resolve();
    });
  }

  async runMaximumIndependentSet() {
    if (this.isMisRunning === true) {
      this.animationSpeed = 0;
      await timeout(1500);
      d3.select('#max-output').html(null);
      d3.selectAll('circle').interrupt();
      d3.selectAll('circle').style('fill', '#1f77b4');
      this.animationSpeed = 500;
      this.maximumIndependentSet();
    } else {
      this.animationSoeed = 500;
      this.isMisRunning = true;
      this.maximumIndependentSet();
    }
  }

  skipForwardMaximumIndependentSet() {
    this.animationSpeed = 0;
  }

  clear() {
    this.svg.remove();
    this.nodes = [];
    this.links = [];
    this.lastNodeId = 0;
  }

  hoverEffect(d) {
    d3.selectAll('#graph-container circle')
      .filter((node) => d.vertices.includes(node.id))
      .transition()
      .duration(100)
      .style('fill', 'orange');
  }

  toggleHoverEffect() {
    if (this.isHoverEffect) {
      this.isHoverEffect = false;
      this.nodeSvg.on('mouseover', null);
      this.nodeSvg.on('mouseout', null);
    } else {
      this.isHoverEffect = true;
      this.nodeSvg.on('mouseover', (d) => this.hoverEffect(d));
      this.nodeSvg.on('mouseout', this.resetNodeStyling);
    }
  }

  resetTreeDecompositionStyles() {
    d3.selectAll('ellipse')
      .style('fill', '#2ca02c')
      .attr('rx', 35)
      .attr('ry', 25)
      .style('opacity', 1);
  }

  isConnected() {
    let componentCount = 1;
    let cluster = 2;

    if (this.nodes.length === 0) {
      componentCount = 0;
      return;
    }

    componentCount = 1;
    this.nodes.forEach((v) => {
      v.visited = false;
    });

    const adjList = {};
    this.nodes.forEach((v) => {
      adjList[v.id] = [];
    });

    this.links.forEach((e) => {
      adjList[e.source.id].push(e.target);
      adjList[e.target.id].push(e.source);
    });

    const q = [];
    q.push(this.nodes[0]);

    while (q.length > 0) {
      const v1 = q.shift();
      const adj = adjList[v1.id];

      for (let i = 0; i < adj.length; i++) {
        const v2 = adj[i];
        if (v2.visited) {
          continue;
        }
        q.push(v2);
      }

      v1.visited = true;
      v1.cluster = cluster.toString();
      if (q.length === 0) {
        for (let i = 0; i < this.nodes.length; i++) {
          if (!this.nodes[i].visited) {
            q.push(this.nodes[i]);
            componentCount++;
            cluster++;
            break;
          }
        }
      }
    }

    this.componentCount = componentCount;

    const isConnected = componentCount === 1;

    return isConnected;
  }

  isTree() {
    const isConnected = this.isConnected();
    if (isConnected && this.nodes.length - 1 === this.links.length) {
      return true;
    }
    return false;
  }

  areNodesInTree() {
    return this.graphOfTd.nodes.every((node) => this.masterNodes.includes(node.id));
  }

  isEveryGraphLinkInTree() {
    return this.graphOfTd.links.every((link) => {
      for (let i = 0; i < this.nodes.length; i++) {
        const currentBag = this.nodes[i];
        if (currentBag.vertices === undefined) continue;
        if (currentBag.vertices.includes(link.source.id) && currentBag.vertices.includes(link.target.id)) return true;
      }
      return false;
    });
  }

  checkCoherence() {
    if (this.nodes.length === 0 || this.links.length === 0) return false;

    /* Check if a node exists in multiple bags */
    for (let i = 0; i < this.graphOfTd.nodes.length; i++) {
      const currentNode = this.graphOfTd.nodes[i];
      currentNode.counter = 0;

      for (let j = 0; j < this.nodes.length; j++) {
        const currentBag = this.nodes[j];
        if (currentBag.vertices === undefined) continue;
        if (currentBag.vertices.includes(currentNode.id)) {
          currentNode.counter++;
        }
      }
    }

    const multipleNodes = this.graphOfTd.nodes.filter((node) => node.counter > 1);

    for (let i = 0; i < multipleNodes.length; i++) {
      const node = multipleNodes[i];
      /* find all bags with this node */

      const tempNodes = this.nodes.filter((bag) => {
        if (bag.vertices) return bag.vertices.includes(node.id);
      });

      const tempLinks = this.links.filter((link) => tempNodes.includes(link.source) && tempNodes.includes(link.target));
      const obj = this.checkConnectivity(tempNodes, tempLinks);
      if (obj.isDisconnected) return false;
    }
    return true;
  }

  checkTreeDecomposition() {
    let treeString;
    let nodeCoverageString;
    let edgeCoverageString;
    let coherenceString;
    let validString;

    if (this.isTree()) {
      treeString = 'Tree decomposition is a tree  <span class="material-icons correct-answer">check</span>';
    } else {
      treeString = 'Tree decomposition must be a tree. <span class="material-icons wrong-answer">clear</span>';
    }

    /* Check node coverage */
    if (this.areNodesInTree()) {
      nodeCoverageString = 'Node coverage  <span class="material-icons correct-answer">check</span>';
    } else {
      nodeCoverageString = 'Node coverage <span class="material-icons wrong-answer">clear</span>';
    }

    /* Check edge coverage */
    if (this.isEveryGraphLinkInTree()) {
      edgeCoverageString = 'Edge coverage <span class="material-icons correct-answer">check</span>';
    } else {
      edgeCoverageString = 'Edge coverage <span class="material-icons wrong-answer">clear</span>';
    }

    /* Check coherence property */
    if (this.checkCoherence()) {
      coherenceString = 'Coherence <span class="material-icons correct-answer">check</span>';
    } else {
      coherenceString = 'Coherence <span class="material-icons wrong-answer">clear</span>';
    }

    if (this.isTree() && this.areNodesInTree() && this.isEveryGraphLinkInTree() && this.checkCoherence()) {
      validString = 'This is a valid tree decomposition <span class="material-icons correct-answer">check</span>';
    } else {
      validString = 'This is not a valid tree decomposition <span class="material-icons wrong-answer">clear</span>';
    }

    d3.select('#output').html(`
      <div>${treeString}</div>
      <div>${nodeCoverageString}</div>
      <div>${edgeCoverageString}</div>
      <div>${coherenceString}</div>
      <div>${validString}</div>
    `);
  }

  updateMasterList() {
    let temp = [];
    this.nodes.forEach((bag) => {
      if (bag.vertices) temp = temp.concat(bag.vertices);
    });

    const tempSet = [...new Set(temp)];
    this.masterNodes = tempSet;
  }

  removeEdge(d) {
    this.links.splice(this.links.indexOf(d), 1);
    d3.event.preventDefault();
    this.restart();
  }

  restart() {
    this.updateMasterList();
    /* Enter, update, remove link SVGs */
    this.svg.selectAll('line')
      .data(this.links, (d) => `v${d.source.id}-v${d.target.id}`)
      .join(
        (enter) => enter
          .append('line')
          .lower()
          .attr('class', 'graphLink')
          .on('contextmenu', (d) => this.removeEdge(d)),
        (update) => update,
        (exit) => exit.remove(),
      );

    /* Enter, update, remove ellipse SVGs */
    this.svg.selectAll('circle')
      .data(this.nodes, (d) => d.id)
      .join(
        (enter) => {
          enter.append('circle')
            .attr('r', 20)
            .style('fill', '#1f77b4')
            .style('stroke', 'rgb(51, 51, 51)')
            .style('stroke-width', '3.5px')
            .on('mouseover', () => this.disableAddNode())
            .on('mouseleave', () => this.enableAddNode())
            .on('mousedown', (d) => this.beginDrawLine(d))
            .on('mouseup', (d) => this.stopDrawLine(d))
            .on('contextmenu', d3.contextMenu(menu));
        },
        (update) => update,
        (exit) => exit.remove(),
      );

    this.svg.selectAll('text')
      .data(this.nodes, (d) => d.id)
      .join(
        (enter) => enter.append('text')
          .attr('dy', 4.5)
          .text((d) => d.id)
          .attr('class', 'graph-label'),
        (update) => update,
        (exit) => exit.remove(),
      );

    this.simulation.force('link').links(this.links);
    this.simulation.nodes(this.nodes);
    this.simulation.alpha(0.5).restart();
  }

  addNode() {
    if (this.canAddNode === false) return;
    const e = d3.event;
    if (e.button === 0) {
      const coords = d3.mouse(e.currentTarget);
      const newNode = {
        x: coords[0], y: coords[1], id: ++this.lastNodeId,
      };
      this.nodes.push(newNode);
      this.setg();
      this.restart();
    }
  }

  enableAddNode() {
    this.canAddNode = true;
  }

  disableAddNode() {
    this.canAddNode = false;
  }

  removeNode(d) {
    d3.event.preventDefault();
    const linksToRemove = this.links.filter((l) => l.source === d || l.target === d);
    linksToRemove.map((l) => this.links.splice(this.links.indexOf(l), 1));
    const indexOfNode = this.nodes.indexOf(d);
    this.nodes.splice(indexOfNode, 1);
    this.restart();
  }

  leftCanvas() {
    this.dragLine.classed('hidden', true);
    this.mousedownNode = null;
  }

  updateDragLine() {
    if (!this.mousedownNode) return;
    const coords = d3.mouse(d3.event.currentTarget);
    this.dragLine.attr(
      'd',
      `M${
        this.mousedownNode.x
      },${
        this.mousedownNode.y
      }L${
        coords[0]
      },${
        coords[1]}`,
    );
  }

  hideDragLine() {
    this.svg.selectAll('circle').style('fill', '#1f77b4');
    this.dragLine.classed('hidden', true);
    this.mousedownNode = null;
    this.restart();
  }

  beginDrawLine(d) {
    this.svg.selectAll('circle').filter((node) => node === d).style('fill', 'orange');
    if (d3.event.ctrlKey) return;
    d3.event.preventDefault();
    this.mousedownNode = d;
    this.dragLine
      .classed('hidden', false)
      .attr(
        'd',
        `M${
          this.mousedownNode.x
        },${
          this.mousedownNode.y
        }L${
          this.mousedownNode.x
        },${
          this.mousedownNode.y}`,
      );
  }

  stopDrawLine(d) {
    this.svg.selectAll('circle').style('fill', '#1f77b4');
    if (!this.mousedownNode || this.mousedownNode === d) return;
    for (let i = 0; i < this.links.length; i++) {
      const l = this.links[i];
      if (
        (l.source === this.mousedownNode && l.target === d)
        || (l.source === d && l.target === this.mousedownNode)
      ) {
        return;
      }
    }
    const newLink = { source: this.mousedownNode, target: d };
    this.links.push(newLink);
  }

  enableDrawing() {
    if (this.svg) this.clear();
    const w = document.getElementById(this.container).offsetWidth;
    const h = document.getElementById(this.container).offsetHeight;
    this.width = w;
    this.height = h;
    const svg = d3.select(`#${this.container}`).append('svg').attr('width', w).attr('height', h);
    this.svg = svg;
    this.svg.style('cursor', 'crosshair');

    this.restartSimulation();

    this.svg
      .on('mousedown', () => this.addNode())
      .on('contextmenu', () => d3.event.preventDefault())
      .on('mousemove', () => this.updateDragLine())
      .on('mouseup', () => this.hideDragLine())
      .on('mouseleave', () => this.leftCanvas());

    this.dragLine = this.svg
      .append('path')
      .attr('class', 'dragLine hidden')
      .attr('d', 'M0,0L0,0');
  }

  setg() {
    this.nodes.forEach((node) => {
      node.graph = this;
    });
  }

  restartSimulation() {
    const simulation = d3.forceSimulation()
      // .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('x', d3.forceX(this.width / 2).strength(0.1))
      .force('y', d3.forceY(this.height / 2).strength(0.1))
      .nodes(this.nodes)
      .force('charge', d3.forceManyBody().strength(-500))
      .force('link', d3.forceLink(this.links).id((d) => d.id).distance(70).strength(0.5))
      .force('collision', d3.forceCollide().radius(20))
      .on('tick', () => {
        this.svg.selectAll('circle').attr('cx', (d) => d.x).attr('cy', (d) => d.y);
        this.svg.selectAll('text').attr('x', (d) => d.x).attr('y', (d) => d.y);

        this.svg.selectAll('line').attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);
      });

    simulation.force('link').links(this.links);
    this.simulation = simulation;
  }

  loadGraph(graph, type, graphOfTd) {
    this.graphOfTd = graphOfTd;
    if (this.svg) this.clear();
    this.graph = graph;
    this.nodes = graph.nodes;
    this.links = graph.links;
    const w = document.getElementById(this.container).offsetWidth;
    const h = document.getElementById(this.container).offsetHeight;
    this.width = w;
    this.height = h;
    const svg = d3.select(`#${this.container}`).append('svg').attr('width', this.width).attr('height', this.height);

    this.svg = svg;

    const path = svg.append('path')
      .attr('fill', 'orange')
      .attr('stroke', 'orange')
      .attr('stroke-width', 16)
      .attr('opacity', 0);

    this.path = path;

    const linkSvg = svg.selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('id', (d) => `link-${d.source.id}-${d.target.id}`)
      .attr('class', 'graphLink');

    this.linkSvg = linkSvg;

    if (type === 'tree') {
      const treeg = svg.selectAll('g')
        .data(graph.nodes)
        .enter()
        .append('g')
        .attr('class', 'td')
        .call(d3.drag()
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
          }));

      this.treeg = treeg;

      this.nodeSvg = svg.selectAll('g')
        .append('ellipse')
        .attr('rx', (d) => d.label.length * 8)
        .attr('ry', 25)
        .style('fill', '#2ca02c')
        .style('stroke', 'rgb(51, 51, 51)')
        .style('stroke-width', '3.5px');

      svg.selectAll('g')
        .append('text')
        .attr('dy', -4)
        .text((d) => {
          if (type === 'tree') {
            return d.label.substring(0, 2);
          }
          return d.id;
        })
        .style('letter-spacing', '6px')
        .attr('class', 'graph-label');

      svg.selectAll('g')
        .append('text')
        .attr('dy', 15)
        .text((d) => d.label.substring(2))
        .style('letter-spacing', '4px')
        .attr('class', 'graph-label');
    } else {
      this.nodeSvg = svg.selectAll('circle')
        .data(graph.nodes)
        .enter()
        .append('circle')
        .attr('id', (d) => `graph-node-${d.id}`)
        .style('opacity', (d) => {
          if (d.id === 0) return 0;
        })
        .attr('r', 18)
        .style('fill', () => {
          if (type === 'tree') return '#2ca02c';
          return '#1f77b4';
        })
        .style('stroke', 'rgb(51, 51, 51)')
        .style('stroke-width', '3.5px')
        .attr('class', 'nonhighlight')
        .call(d3.drag()
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
          }));

      svg.selectAll('text')
        .data(graph.nodes)
        .enter()
        .append('text')
        .style('opacity', (d) => {
          if (d.id === 0) return 0;
        })
        .attr('dy', 4.5)
        .text((d) => (d.label ? d.label : d.id))
        .attr('class', 'graph-label');
    }

    const line = d3.line().curve(d3.curveBasisClosed);

    const simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('x', d3.forceX(w / 2).strength(0.1))
      .force('y', d3.forceY(h / 2).strength(0.1))
      .nodes(graph.nodes)
      .force('charge', d3.forceManyBody().strength(-900))
      .force('link', d3.forceLink(graph.links).id((d) => d.id).distance((d) => {
        if (type === 'tree') {
          return 100;
        }
        return 50;
      }).strength(0.9))
      .force('collision', d3.forceCollide().radius((d) => {
        if (type === 'tree') {
          return 50;
        }
        return d.r + 10;
      }))
      .on('tick', () => {
        this.svg.selectAll('circle').attr('cx', (d) => d.x).attr('cy', (d) => d.y);
        this.svg.selectAll('ellipse').attr('transform', (d) => `translate(${d.x},${d.y})`);
        this.svg.selectAll('text').attr('x', (d) => d.x).attr('y', (d) => d.y);

        this.svg.selectAll('line').attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        if (this.separatorNodes) {
          let pointArr = [];
          const padding = 3.5;

          for (let i = 0; i < this.separatorNodes.length; i++) {
            const node = this.separatorNodes[i];
            const pad = 17 + padding;
            pointArr = pointArr.concat([
              [node.x - pad, node.y - pad],
              [node.x - pad, node.y + pad],
              [node.x + pad, node.y - pad],
              [node.x + pad, node.y + pad],
            ]);
          }
          if (pointArr.length === 0) return;
          this.path.attr('d', line(hull(pointArr)));
        }
      });

    simulation.force('link').links(graph.links);
    this.buildAdjacencyList();
    this.simulation = simulation;
    this.setg();
  }

  randomGraph(vertices, edges) {
    if (this.svg) this.clear();
    let randomGraph;
    if (vertices === undefined && edges === undefined) randomGraph = generateRandomGraph(10, 10);
    else randomGraph = generateRandomGraph(vertices, edges);
    randomGraph = this.loadGraph(randomGraph, this.container, 'graph');
  }
}
