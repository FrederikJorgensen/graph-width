/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-return */
/* eslint-disable no-bitwise */
import { generateRandomGraph } from '../helpers.js';
import * as readTree from '../readTree.js';

const colors = d3.scaleOrdinal(d3.schemeCategory10);

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
      console.log('here');
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

function adjFromLinks(links) {
  const adjacencyList = [];
  links.forEach((d) => {
    adjacencyList[`${d.source.id}-${d.target.id}`] = true;
    adjacencyList[`${d.target.id}-${d.source.id}`] = true;
  });
  return adjacencyList;
}


export default class Graph {
  constructor(container) {
    this.container = container;
    this.maxStop = false;
    this.misAnimationSpeed = 500;
    this.selectedNodes = [];
    this.isHoverEffect = false;
    this.animDuration = 1000;
    this.testingCoherence = false;
    this.cancel = false;
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

  checkIntroducedVertex(introducedNode, state, subTree) {
    const subGraph = this.newSubGraph(subTree);
    const adjList = adjFromLinks(subGraph.links);
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

  isIntroducedVertexNeighbor(set, introducedVertex, adjacencyList) {
    for (const s of set) {
      if (adjacencyList[`${s}-${introducedVertex}`]) return true;
    }
    return false;
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
      tNodes.push(node.id);
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
        if (this.isEdgeInTreeDecomposition(sourceNode, targetNode)) {
          d3.select(`#link-${edge.source.id}-${edge.target.id}`)
            .transition()
            .duration(this.animDuration)
            .delay(this.animDuration * this.anim)
            .style('stroke', 'orange')
            .style('stroke-width', '5px')
            .on('end', (edge) => {
              const allEdges = d3.selectAll('#graph-container line').data();
              if (edge === allEdges[allEdges.length - 1]) resolve();
            });
          this.anim++;
        }
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
        if (this.isNodeInTreeDecomposition(node)) {
          d3.select(`#graph-node-${node.id}`)
            .transition()
            .duration(this.animDuration)
            .delay(this.animDuration * this.anim)
            .style('fill', 'orange')
            .on('end', (node) => {
              const allNodes = d3.selectAll('#graph-container circle').data();
              if (node === allNodes[allNodes.length - 1]) resolve();
            });
          this.anim++;
        }
        return colors(1);
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
      const newJson = { edges: this.getAllEdges(), largestNode: this.getLargestNode() };
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
        d3.select('.result-text').html(null);
        this.resetNodeStyling();
        return;
      }

      /* After removing a separating node check if the remaining vertices are still adjacent */
      if (this.selectedNodes.length > 1 && this.isSeparatingNodesAdjacent() === false) {
        this.resetNodeStyling();
        this.colorNotSeparating();
        d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is a balanced separator!<span class="material-icons correct-answer">check</span>`);
        renderMathInElement(document.body);
        return;
      }
    } else {
      this.selectedNodes.push(d.id);
    }

    /* Check if the selected nodes form a connected component */
    const subSelectecNodes = this.nodes.filter((node) => this.selectedNodes.includes(node.id));

    const nonSelectedLinks = this.links.filter((l) => {
      if (
        !this.selectedNodes.includes(l.target.id)
          || !this.selectedNodes.includes(l.source.id)
      ) return true;
    });
    const subSelectedLinks = this.links.filter((link) => !nonSelectedLinks.includes(link));

    const selectedNodesConnectivity = this.checkConnectivity(subSelectecNodes, subSelectedLinks);

    /* Original graph's vertices subtracting the vertex separator set */
    const balanceLimit = (this.nodes.length - this.selectedNodes.length) / 2;

    /* Get the subgraph, sublinks and whether the graph is disconnected */
    const obj = this.isSeparatorSet(this.selectedNodes);

    /* First check if the graph is disconnected */
    if (obj.isDisconnected === true && selectedNodesConnectivity.isDisconnected === false) {
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
          d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a balanced separator!<span class="material-icons wrong-answer">clear</span>`);
          renderMathInElement(document.body);
          return;
        }
      }
      this.resetNodeStyling();
      this.colorSeparating();
      d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is a balanced separator!<span class="material-icons correct-answer">check</span>`);
      renderMathInElement(document.body);
    } else {
      this.resetNodeStyling();
      this.colorNotSeparating();
      d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a balanced separator!<span class="material-icons wrong-answer">clear</span>`);
      renderMathInElement(document.body);
    }
  }

  checkMinimalSeparator(d) {
    if (this.selectedNodes.includes(d.id)) {
      const nodeInSeparatorSet = this.selectedNodes.indexOf(d.id);
      this.selectedNodes.splice(nodeInSeparatorSet, 1);
      if (this.selectedNodes.length === 0) {
        d3.select('.result-text').html('Click on a vertex to include it into the separator set.');
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
        d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a minimal separator!<span class="material-icons wrong-answer">clear</span>`);
        renderMathInElement(document.body);
        return;
      }
    }

    const subg = this.isSeparatorSet(this.selectedNodes);

    if (subg.isDisconnected) {
      this.resetNodeStyling();
      this.colorSeparating();
      d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is a minimal separator!<span class="material-icons correct-answer">check</span>`);
      renderMathInElement(document.body);
      return;
    }
    this.resetNodeStyling();
    this.colorNotSeparating();
    d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a minimal separator!<span class="material-icons wrong-answer">clear</span>`);
    renderMathInElement(document.body);
  }

  toggleMinimalSeparatorExercise() {
    d3.selectAll('circle').on('click', (d) => this.checkMinimalSeparator(d));
  }

  checkConnectivity(subGraphNodes, subGraphLinks) {
    let componentCount;

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
      v1.cluster = componentCount;
      if (q.length === 0) {
        for (let i = 0; i < subGraphNodes.length; i++) {
          if (!subGraphNodes[i].visited) {
            q.push(subGraphNodes[i]);
            componentCount++;
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

      /* After removing a separating node check if the remaining vertices are still adjacent */
      if (this.selectedNodes.length > 1 && this.isSeparatingNodesAdjacent() === false) {
        this.resetNodeStyling();
        this.colorNotSeparating();
        // showResult(false);
        return;
      }

      /* If the new separating set is empty reset the result and the styling */
      if (this.selectedNodes.length === 0) {
        d3.select('.result-text').html('Click on a vertex to include it into the separator set.');
        this.resetNodeStyling();
        return;
      }
    } else {
      this.selectedNodes.push(d.id);
      /* If new node to the separator is not a neighbor the result is wrong */
      if (
        this.selectedNodes.length > 1
      && this.isNeighboringSeparatedNodes(d.id) === false
      ) {
        this.resetNodeStyling();
        this.colorNotSeparating();
        d3.select('.result-text').html(`\\( S = \\{ ${this.selectedNodes} \\} \\) is not a separator in the graph.  <span class="material-icons wrong-answer">clear</span>`);
        renderMathInElement(document.body);
        return;
      }
    }

    /* Check if the selected nodes form a connected component */
    const subSelectecNodes = this.nodes.filter((node) => this.selectedNodes.includes(node.id));

    const nonSelectedLinks = this.links.filter((l) => {
      if (
        !this.selectedNodes.includes(l.target.id)
          || !this.selectedNodes.includes(l.source.id)
      ) return true;
    });
    const subSelectedLinks = this.links.filter((link) => !nonSelectedLinks.includes(link));

    const selectedNodesConnectivity = this.checkConnectivity(subSelectecNodes, subSelectedLinks);

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


    if (subg.isDisconnected && selectedNodesConnectivity.isDisconnected === false) {
      this.resetNodeStyling();
      this.colorSeparating();
      d3.select('.result-text').html(`The set \\( S = \\{ ${this.selectedNodes} \\} \\) is indeed a separator in the graph. 
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

  changeMisAnimationSpeed(ms) {
    this.misAnimationSpeed = ms;
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
          if (this.misAnimationSpeed > 0) {
            highlightVertex(vertex1.id);
            highlightVertex(vertex2.id);
            await timeout(this.misAnimationSpeed);
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

          if (this.misAnimationSpeed > 0) {
            await repeat(c, this.misAnimationSpeed * 2);
            await timeout(this.misAnimationSpeed * 2);
          }

          d3.select('#result-math').html(String.raw`\( S = \{ ${result} \} \)`);
          renderMathInElement(document.body);
        }
      }
    }
    d3.selectAll('circle').filter((node) => maximumIndependentSet.includes(node)).classed('highlighted-stroke', true);
    return maximumIndependentSet;
  }

  clear() {
    this.svg.remove();
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
      this.treeEllipse.on('mouseover', null);
      this.treeEllipse.on('mouseout', null);
    } else {
      this.isHoverEffect = true;
      this.treeEllipse.on('mouseover', (d) => this.hoverEffect(d));
      this.treeEllipse.on('mouseout', this.resetNodeStyling);
    }
  }

  resetTreeDecompositionStyles() {
    d3.selectAll('ellipse')
      .style('fill', '#2ca02c')
      .attr('rx', 35)
      .attr('ry', 25)
      .style('opacity', 1);
  }

  loadGraph(graph, container, type) {
    this.container = container;
    this.graph = graph;
    this.nodes = graph.nodes;
    this.links = graph.links;
    const w = document.getElementById(container).offsetWidth;
    const h = document.getElementById(container).offsetHeight;
    const svg = d3.select(`#${container}`).append('svg').attr('width', w).attr('height', h);

    this.svg = svg;

    const linkSvg = svg.selectAll('line.graphLink')
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

      const treeEllipse = svg.selectAll('g')
        .append('ellipse')
        .attr('rx', (d) => d.label.length * 8)
        .attr('ry', 25)
        .style('fill', '#2ca02c')
        .style('stroke', 'rgb(51, 51, 51)')
        .style('stroke-width', '3.5px');

      this.treeEllipse = treeEllipse;

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
        .attr('class', 'label');

      svg.selectAll('g')
        .append('text')
        .attr('dy', 15)
        .text((d) => d.label.substring(2))
        .style('letter-spacing', '4px')
        .attr('class', 'label');
    } else {
      svg.selectAll('g')
        .data(graph.nodes)
        .enter()
        .append('g')
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

      svg.selectAll('g')
        .append('circle')
        .attr('id', (d) => `${type}-node-${d.id}`)
        .attr('r', 22)
        .style('fill', () => {
          if (type === 'tree') return '#2ca02c';
          return '#1f77b4';
        })
        .style('stroke', 'rgb(51, 51, 51)')
        .style('stroke-width', '3.5px')
        .attr('class', 'nonhighlight');

      svg.selectAll('g')
        .append('text')
        .attr('dy', 4.5)
        .text((d) => (d.label ? d.label : d.id))
        .attr('class', 'label');
    }

    const simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('x', d3.forceX(w / 2).strength(0.2))
      .force('y', d3.forceY(h / 2).strength(0.2))
      .nodes(graph.nodes)
      .force('charge', d3.forceManyBody().strength(-600).distanceMin(15))
      .force('link', d3.forceLink(graph.links).id((d) => d.id).distance(85).strength(0.8))
      .force('collision', d3.forceCollide().radius(20))
      .on('tick', () => {
        svg.selectAll('g').attr('transform', (d) => `translate(${d.x},${d.y})`);
        // svg.selectAll('ellipse').attr('transform', (d) => `translate(${d.x},${d.y})`);

        svg.selectAll('line.graphLink').attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);
      });

    simulation.force('link').links(graph.links);
    this.buildAdjacencyList();
  }

  randomGraph() {
    if (this.svg) this.clear();
    const randomGraph = generateRandomGraph(10, 10);
    this.loadGraph(randomGraph, this.container, 'graph');
  }
}
