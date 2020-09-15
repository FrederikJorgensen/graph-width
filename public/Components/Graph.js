import * as readTree from '../Utilities/readTree.js';
import { contextMenu as menu } from '../Utilities/ContextMenu.js';
import generateRandomGraph from '../Utilities/helpers.js';

const colors = d3.scaleOrdinal(d3.schemeCategory10);

function resetTreeDecompositionStyles() {
  d3.selectAll('ellipse')
    .style('fill', '#2ca02c')
    .attr('rx', 35)
    .attr('ry', 25)
    .style('opacity', 1);
}

function returnAdj(links) {
  const adjacencyList = [];
  links.forEach((d) => {
    adjacencyList[`${d.source.id}-${d.target.id}`] = true;
    adjacencyList[`${d.target.id}-${d.source.id}`] = true;
  });
  return adjacencyList;
}


function resetLinkStyles() {
  d3.selectAll('#tree-container line').style('opacity', 1);
}

function findNodeToColor(subGraph, vertex) {
  return subGraph.nodes.find((node) => node.id === vertex);
}

function resetColorsInSubgraph(subGraph) {
  subGraph.nodes.map((node) => node.color = null);
}

function resetSeparatorExerciseText() {
  d3.select('#separator-output').html('Click on a vertex to include it into the separator set.');
}

function hull(points) {
  if (points.length < 2) return;
  if (points.length < 3) return d3.polygonHull([points[0], ...points]);
  return d3.polygonHull(points);
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


function errorSvg() {
  return `<svg class="exercise-icon incorrect-answer-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
}

function checkmarkSvg() {
  return `<svg class="exercise-icon correct-answer-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`;
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

function getComponents(subGraph) {
  const subGraphNodes = subGraph.nodes;
  const components = {};

  for (const node of subGraphNodes) {
    if ('cluster' in node) {
      const nc = node.cluster;
      components[nc] = components[nc] + 1 || 1;
    }
  }

  const componentLength = Object.values(components);
  return componentLength;
}

function createLabelForNode(node) {
  return JSON.stringify(node).replace('[', '').replace(']', '');
}

const stopAllTransitions = () => {
  d3.selectAll('circle').interrupt();
  d3.selectAll('line').interrupt();
  d3.selectAll('ellipse').interrupt();
  d3.selectAll('text').interrupt();
};

export default class Graph {
  constructor(container, type, graphOfTd) {
    this.container = container;
    this.type = type;
    this.graphOfTd = graphOfTd;
    this.width = document.getElementById(this.container).offsetWidth;
    this.height = document.getElementById(this.container).offsetHeight;
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

  async runCoherence() {
    this.resetLinkStyles();
    this.resetTextStyles();
    this.resetTreeDecompositionStyles();
    stopAllTransitions();
    this.cancel = true;
    await this.testCoherence();
    this.cancel = false;
    await this.testCoherence();
    return new Promise((resolve) => resolve());
  }

  async runEdgeCoverage() {
    this.anim = 0;
    resetLinkStyles();
    resetTreeDecompositionStyles();
    stopAllTransitions();
    await this.edgeCoverage();
  }

  async runNodeCoverage() {
    stopAllTransitions();
    resetTreeDecompositionStyles();
    this.anim = 0;
    await this.testNodeCoverage();
  }

  isEdge(w, v) {
    return this.adjacencyList[`${w}-${v}`];
  }

  getNeighbors(node) {
    const temp = [];
    this.links.forEach((link) => {
      if (link.source.id === node) temp.push(link.target.id);
      if (link.target.id === node) temp.push(link.source.id);
    });
    return temp;
  }

  isVertexAdjacent(subTree, array) {
    const subGraph = this.createSubgraph(subTree);

    const verticesInSubGraph = [];
    subGraph.nodes.forEach((node) => {
      verticesInSubGraph.push(node.id);
    });

    const adjacencyList = returnAdj(subGraph.links);

    if (this.isNeighborInSet(array, adjacencyList)) return true;
    return false;
  }

  showSeparator(vertices) {
    this.separatorNodes = this.nodes.filter((node) => vertices.includes(node.id));
    this.path.style('opacity', 0.3);
    const restNodes = this.nodes.filter((node) => !vertices.includes(node.id));
    const restLinks = this.links.filter((link) => {
      if (vertices.includes(link.source.id)) return false;
      if (vertices.includes(link.target.id)) return false;
      return true;
    });

    this.isSubGraphDisconnected({ nodes: restNodes, links: restLinks });
    this.nodes.map((node) => {
      if ('cluster' in node === false || node.cluster === null) {
        node.cluster = 1;
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
      .strength(0.4)
      .template('force')
      .groupBy('cluster')
      .links(this.links)
      .enableGrouping(true)
      .linkStrengthInterCluster(0)
      .linkStrengthIntraCluster(0)
      .forceLinkDistance(250)
      .forceCharge(-2000);

    this.simulation.force('group', groupingForce);
    this.simulation.alpha(0.07).restart();
  }

  hideSeparator() {
    this.path.style('opacity', 0);
    d3.selectAll('circle').style('fill', '#1f77b4');
    this.nodes.forEach((node) => node.cluster = null);
    const groupingForce = forceInABox()
      .strength(0)
      .template('force')
      .groupBy('cluster')
      .links(this.links)
      .linkStrengthInterCluster(0)
      .linkStrengthIntraCluster(0)
      .forceCharge(0);

    this.simulation
      .force('group', groupingForce)
      .force('link', d3.forceLink(this.links).id((d) => d.id).distance(85).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-600).distanceMin(15));

    this.simulation.alpha(0.1).restart();
  }

  toggleSeparator() {
    d3.selectAll('ellipse').on('mouseover', (d) => this.graphOfTd.showSeparator(d.vertices));
    d3.selectAll('ellipse').on('mouseout', () => this.graphOfTd.hideSeparator());
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

  checkIfIntroducedVertex(childState, subTree) {
    const subGraph = this.createSubgraph(subTree);
    resetColorsInSubgraph(subGraph);
    const vertices = [...childState.keys()];

    for (const vertex of vertices) {
      const nodeToColor = findNodeToColor(subGraph, vertex);
      const color = childState.get(vertex);
      nodeToColor.color = color;
    }

    for (const link of subGraph.links) {
      if (link.source.color !== null && !link.target.color !== null) {
        if (link.source.color === link.target.color) {
          return true;
        }
      }
    }
    return false;
  }

  checkIntroducedVertex(introducedNode, positionTracker, oldState, color, subTree) {
    const subGraph = this.createSubgraph(subTree);
    subGraph.nodes.map((node) => node.color = null);

    for (let i = 0; i < positionTracker.length; i++) {
      const n = subGraph.nodes.find((node) => node.id === positionTracker[i]);
      n.color = oldState[i];
    }
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

  createSubgraph(subTree) {
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

    return { nodes: subGraphNodes, links: subGraphLinks };
  }

  highlightSubGraph(subGraph) {
    const { nodes } = subGraph;
    this.path.style('opacity', 0.5);
    this.separatorNodes = nodes;
    this.simulation.restart();
  }

  addTooltip() {
    if (this.tooltip) this.tooltip.remove();

    this.tooltip = d3.select('#main')
      .append('div')
      .attr('id', 'graph-tooltip')
      .style('opacity', 0);
  }

  hideTooltip() {
    if (this.tooltip) this.tooltip.style('opacity', 0);
  }

  hideArrow() {
    if (this.arrow) this.arrow.style('opacity', 0);
  }

  hideHull() {
    if (this.path) this.path.style('opacity', 0);
  }

  addNodeArrow(nodeId, text) {
    this.addTooltip();
    if (this.arrow) this.arrow.remove();

    const nodeSvg = d3.select(`#graph-node-${nodeId}`);
    const x = parseInt(nodeSvg.attr('cx'), 10);
    const y = parseInt(nodeSvg.attr('cy'), 10);

    this.arrow = this.svg
      .append('line')
      .style('opacity', 1)
      .attr('id', 'arrow-line')
      .attr('x1', x - 50)
      .attr('y1', y)
      .attr('x2', x - nodeSvg.attr('r') - 4)
      .attr('y2', y)
      .attr('marker-end', 'url(#arrow)')
      .attr('stroke', 'rgb(51, 51, 51)')
      .attr('stroke-width', '3.5px');

    const { top } = document.getElementById('arrow-line').getBoundingClientRect();
    const { left } = document.getElementById('arrow-line').getBoundingClientRect();

    this.tooltip
      .html(text)
      .style('opacity', 1)
      .style('left', `${left}px`)
      .style('top', `${top}px`);
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

  computeTrivialTreeDecomposition() {
    const bag = [];
    const nodes = [];
    this.nodes.forEach((node) => node.id !== 0 && bag.push(node.id));
    const createLabel = createLabelForNode(bag);
    const singleNode = { id: 1, label: createLabel };
    nodes.push(singleNode);
    return { nodes, links: [] };
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

  highlightCoherence() {
    this.anim = 0;
    d3.selectAll('#graph-container circle').style('fill', (node) => {
      d3.select(`#graph-node-${node.id}`)
        .transition()
        .duration(this.animDuration)
        .delay(this.animDuration * this.anim)
        .style('fill', 'orange')
        .on('end', () => d3.selectAll('#graph-container circle').style('fill', '#1f77b4'));

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

      const newBags = d3.selectAll('ellipse').data().filter((bag) => bag.vertices.includes(node.id));

      d3.selectAll('#tree-container line')
        .filter((link) => newBags.includes(link.source) && newBags.includes(link.target))
        .transition()
        .duration(this.animDuration)
        .delay(this.animDuration * this.anim)
        .style('stroke', 'orange')
        .style('stroke-width', '5px')
        .on('end', () => {
          d3.selectAll('#tree-container line')
            .style('stroke', 'black')
            .style('stroke-width', '2.5px');
        });


      this.anim++;
    });
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

  highlightNodeColor(nodeId, color) {
    d3.select(`#graph-node-${nodeId}`).style('fill', color);
  }

  resetNodeColors() {
    d3.selectAll('#graph-container circle').style('fill', 'rgb(31, 119, 180)');
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
  }

  colorCorrectNodes() {
    d3.selectAll('circle')
      .filter((node) => this.selectedNodes.includes(node.id))
      .classed('separating-node', true);
  }

  colorIncorrectNodes() {
    d3.selectAll('circle')
      .filter((node) => this.selectedNodes.includes(node.id))
      .classed('not-separating-node', true);
  }

  checkBalanceSeparator(node) {
    this.insertNodeIntoSelectedNodes(node);
    if (this.isSelectedNodesEmpty()) {
      resetSeparatorExerciseText();
      this.resetNodeStyling();
      return;
    }

    if (this.selectedNodes.length > 1 && this.isSeparatingNodesAdjacent() === false) {
      this.setBalancedSeparatorExerciseWrong();
      return;
    }

    const balanceLimit = this.calculateBalanceLimit();
    const subGraph = this.createSubgraphFromSelectedNodes();

    if (this.isSubGraphDisconnected(subGraph)) {
      const components = getComponents(subGraph);
      this.isComponentLengthGreaterThanBalanceLimit(components, balanceLimit);
    } else {
      this.setBalancedSeparatorExerciseWrong();
    }
  }

  isSelectedNodesEmpty() {
    if (this.selectedNodes.length === 0) return true;
    return false;
  }

  insertNodeIntoSelectedNodes(node) {
    if (this.selectedNodes.includes(node.id)) {
      this.removeNodeFromSelectedNodes(node);
    } else {
      this.selectedNodes.push(node.id);
    }
  }

  isComponentLengthGreaterThanBalanceLimit(components, balanceLimit) {
    for (const component of components) {
      if (component > balanceLimit) {
        this.setBalancedSeparatorExerciseWrong();
        return;
      }
    }
    this.setBalancedSeparatorExerciseCorrect();
  }


  calculateBalanceLimit() {
    return (this.nodes.length - this.selectedNodes.length) / 2;
  }

  setBalancedSeparatorExerciseCorrect() {
    this.resetNodeStyling();
    this.colorCorrectNodes();
    this.setBalancedSeparatorExerciseTextCorrect();
  }

  setBalancedSeparatorExerciseTextCorrect() {
    d3.select('#separator-output').html(`${checkmarkSvg()} \\( S = \\{ ${this.selectedNodes} \\} \\) is a balanced separator`);
    renderMathInElement(document.body);
  }

  setBalancedSeparatorExerciseTextWrong() {
    d3.select('#separator-output').html(`${errorSvg()} \\( S = \\{ ${this.selectedNodes} \\} \\) is not a balanced separator`);
    renderMathInElement(document.body);
  }

  setBalancedSeparatorExerciseWrong() {
    this.resetNodeStyling();
    this.colorIncorrectNodes();
    this.setBalancedSeparatorExerciseTextWrong();
  }

  checkMinimalSeparator() {
    const allProperSubsets = this.getAllProperSubsets();

    for (const set of allProperSubsets) {
      const subGraph = this.createSubgraphExcludingSet(set);
      if (this.isSubGraphDisconnected(subGraph)) {
        this.setMinimalSeparatorExerciseWrong();
        return;
      }
    }

    const subGraph = this.createSubgraphFromSelectedNodes();
    this.isSubGraphDisconnected(subGraph) ? this.setMinimalSeparatorExerciseCorrect() : this.setMinimalSeparatorExerciseWrong();
  }

  setMinimalSeparatorExerciseCorrect() {
    this.resetNodeStyling();
    this.colorCorrectNodes();
    this.setMinimalSeparatorExerciseTextCorrect();
  }

  setMinimalSeparatorExerciseWrong() {
    this.resetNodeStyling();
    this.colorIncorrectNodes();
    this.setMinimalSeparatorExerciseTextIncorrect();
  }

  setMinimalSeparatorExerciseTextCorrect() {
    d3.select('#separator-output').html(`${checkmarkSvg()} \\( S = \\{ ${this.selectedNodes} \\} \\) is a minimal separator`);
    renderMathInElement(document.body);
  }

  setMinimalSeparatorExerciseTextIncorrect() {
    d3.select('#separator-output').html(`${errorSvg()} \\( S = \\{ ${this.selectedNodes} \\} \\) is not a minimal separator`);
    renderMathInElement(document.body);
  }

  getAllProperSubsets() {
    const allSubsets = getAllSubsets(this.selectedNodes);
    const allProperSubsets = allSubsets.filter((subset) => subset.length !== this.selectedNodes.length && subset.length !== 0);
    return allProperSubsets;
  }

  fol(node) {
    if (this.selectedNodes.includes(node.id)) {
      this.removeNodeFromSelectedNodes(node);
    } else {
      this.selectedNodes.push(node.id);
    }

    if (this.selectedNodes.length === 0) {
      resetSeparatorExerciseText();
      this.resetNodeStyling();
    } else {
      this.checkMinimalSeparator();
    }
  }


  removeNodeFromSelectedNodes(node) {
    const nodeIndex = this.selectedNodes.indexOf(node.id);
    this.selectedNodes.splice(nodeIndex, 1);
  }

  isSubGraphDisconnected(graph) {
    const { nodes } = graph;
    const { links } = graph;

    let componentCount = 1;

    if (nodes.length === 0) {
      componentCount = 0;
      return;
    }

    let cluster = 2;

    componentCount = 1;
    nodes.forEach((v) => {
      v.visited = false;
    });

    const adjList = {};
    nodes.forEach((v) => {
      adjList[v.id] = [];
    });

    links.forEach((e) => {
      adjList[e.source.id].push(e.target);
      adjList[e.target.id].push(e.source);
    });

    const q = [];
    q.push(nodes[0]);

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
        for (let i = 0; i < nodes.length; i++) {
          if (!nodes[i].visited) {
            q.push(nodes[i]);
            componentCount++;
            cluster++;
            break;
          }
        }
      }
    }
    this.componentCount = componentCount;
    return componentCount > 1;
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

  isSetSeparating() {
    const subGraph = this.createSubgraphFromSelectedNodes();
    this.resetNodeStyling();

    if (this.isSubGraphDisconnected(subGraph)) {
      this.colorCorrectNodes();
      this.setCorrectSeparatorExerciseOutput();
    } else {
      this.colorIncorrectNodes();
      this.setIncorrectSeparatorExerciseOutput();
    }
  }

  createSubgraphExcludingSet(separator) {
    const nodes = this.nodes.filter((node) => !separator.includes(node.id));
    const linksToRemove = this.links.filter((link) => separator.includes(link.target.id) || separator.includes(link.source.id));
    const links = this.links.filter((link) => !linksToRemove.includes(link));
    return { nodes, links };
  }

  createSubgraphFromSelectedNodes() {
    const nodes = this.removeSelectedNodes();
    const linksToRemove = this.findLinksToRemove();
    const links = this.removeSelectedLinks(linksToRemove);
    return { nodes, links };
  }

  removeSelectedLinks(linksToRemove) {
    return this.links.filter((link) => !linksToRemove.includes(link));
  }

  enableBalanceSeparatorExercise() {
    this.resetSeparatorExerciseOutput();
    d3.selectAll('circle').on('click', (node) => this.checkBalanceSeparator(node));
  }

  enableMinimalSeparatorExercise() {
    this.resetSeparatorExerciseOutput();
    d3.selectAll('circle').on('click', (node) => this.fol(node));
  }

  enableSeparatorExercise() {
    this.resetSeparatorExerciseOutput();
    d3.selectAll('circle').on('click', (node) => {
      if (this.selectedNodes.includes(node.id)) {
        this.removeSelectedNodeFromSet(node);
        if (this.selectedNodes.length === 0) return this.resetSeparatorExerciseOutput();
      } else {
        this.selectedNodes.push(node.id);
      }
      this.isSetSeparating(node);
    });
  }

  setIncorrectSeparatorExerciseOutput() {
    d3.select('#separator-output').html(`
    <svg class="exercise-icon incorrect-answer-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>\\( S = \\{ ${this.selectedNodes} \\} \\) is not a separator in the graph</span>
    `);
    renderMathInElement(document.body);
  }

  setCorrectSeparatorExerciseOutput() {
    d3.select('#separator-output').html(`
    <svg class="exercise-icon correct-answer-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p>\\( S = \\{ ${this.selectedNodes} \\} \\) is a separator in the graph</p>
    `);
    renderMathInElement(document.body);
  }

  resetSeparatorExerciseOutput() {
    d3.select('#separator-output').html('Click on a vertex to include it into the separator set.');
    this.resetNodeStyling();
  }

  removeSelectedNodeFromSet(node) {
    const nodeInSeparatorSetIndex = this.selectedNodes.indexOf(node.id);
    this.selectedNodes.splice(nodeInSeparatorSetIndex, 1);
  }

  findLinksToRemove() {
    return this.links.filter((link) => this.selectedNodes.includes(link.target.id) || this.selectedNodes.includes(link.source.id));
  }

  removeSelectedNodes() {
    return this.nodes.filter((node) => !this.selectedNodes.includes(node.id));
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

  removeSvg() {
    if (this.svg) this.svg.remove();
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
      const obj = this.isSubGraphDisconnected(tempNodes, tempLinks);
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
    if (this.svg) this.removeSvg();
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

  createSvg() {
    this.svg = d3.select(`#${this.container}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  loadGraph(graph) {
    if (this.svg) this.removeSvg();
    this.createSvg();
    this.graph = graph;
    this.nodes = graph.nodes;
    this.links = graph.links;
    this.createSimulation();
    this.createArrow();
    this.createLinkSvg();
    this.addHullPath();
    if (this.type === 'tree') {
      this.createGroupElementForTreeNodes();
      this.createTreeDecompositionNodeSvgs();
      this.createTreeDecompositionLabels();
      this.createTreeDecompositionLabels2();
    } else {
      this.createGraphNodeSvg();
      this.createGraphLabels();
    }
    this.simulation.force('link').links(this.links);
    this.buildAdjacencyList();
    this.setg();
  }

  createGroupElementForTreeNodes() {
    this.svg.selectAll('g')
      .data(this.nodes)
      .enter()
      .append('g')
      .attr('class', 'td')
      .call(d3.drag()
        .on('start', (v) => {
          if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
          [v.fx, v.fy] = [v.x, v.y];
        })
        .on('drag', (v) => {
          [v.fx, v.fy] = [d3.event.x, d3.event.y];
        })
        .on('end', (v) => {
          if (!d3.event.active) this.simulation.alphaTarget(0);
          [v.fx, v.fy] = [null, null];
        }));
  }

  createGraphLabels() {
    this.svg.selectAll('text')
      .data(this.nodes)
      .enter()
      .append('text')
      .style('opacity', (d) => {
        if (d.id === 0) return 0;
      })
      .attr('dy', 4.5)
      .text((d) => (d.label ? d.label : d.id))
      .attr('class', 'graph-label');
  }

  createGraphNodeSvg() {
    this.nodeSvg = this.svg.selectAll('circle')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('id', (d) => `graph-node-${d.id}`)
      .style('opacity', (d) => {
        if (d.id === 0) return 0;
      })
      .attr('r', 18)
      .style('fill', '#1f77b4')
      .attr('class', 'nonhighlight')
      .call(d3.drag()
        .on('start', (v) => {
          d3.selectAll('circle').style('cursor', 'grabbing');
          this.svg.style('cursor', 'grabbing');
          if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
          [v.fx, v.fy] = [v.x, v.y];
        })
        .on('drag', (v) => [v.fx, v.fy] = [d3.event.x, d3.event.y])
        .on('end', (v) => {
          d3.selectAll('circle').style('cursor', 'grab');
          this.svg.style('cursor', 'auto');
          if (!d3.event.active) this.simulation.alphaTarget(0);
          [v.fx, v.fy] = [null, null];
        }));
  }

  createSimulation() {
    const line = d3.line().curve(d3.curveBasisClosed);

    this.simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('x', d3.forceX(this.width / 2).strength(0.1))
      .force('y', d3.forceY(this.height / 2).strength(0.1))
      .nodes(this.nodes)
      .force('charge', d3.forceManyBody().strength(-900))
      .force('link', d3.forceLink(this.links).id((d) => d.id).distance(() => {
        if (this.type === 'tree') {
          return 100;
        }
        return 50;
      }).strength(0.9))
      .force('collision', d3.forceCollide().radius((d) => {
        if (this.type === 'tree') {
          return 50;
        }
        return d.r + 10;
      }))
      .on('tick', () => {
        this.svg.selectAll('circle').attr('cx', (d) => d.x).attr('cy', (d) => d.y);
        this.svg.selectAll('ellipse').attr('transform', (d) => `translate(${d.x},${d.y})`);
        this.svg.selectAll('text').attr('x', (d) => d.x).attr('y', (d) => d.y);

        this.svg.selectAll('line.graphLink').attr('x1', (d) => d.source.x)
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
  }

  createTreeDecompositionLabels2() {
    this.svg.selectAll('g')
      .append('text')
      .attr('dy', 15)
      .text((d) => d.label.substring(2))
      .style('letter-spacing', '4px')
      .attr('class', 'graph-label');
  }

  createTreeDecompositionLabels() {
    this.svg.selectAll('g')
      .append('text')
      .attr('dy', -4)
      .text((d) => d.label.substring(0, 2))
      .style('letter-spacing', '6px')
      .attr('class', 'graph-label');
  }

  createTreeDecompositionNodeSvgs() {
    this.nodeSvg = this.svg.selectAll('g')
      .append('ellipse')
      .attr('rx', (d) => d.label.length * 8)
      .attr('ry', 25)
      .style('fill', '#2ca02c');
  }

  createLinkSvg() {
    this.svg.selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('id', (d) => `link-${d.source.id}-${d.target.id}`)
      .attr('class', 'graphLink');
  }

  addHullPath() {
    this.path = this.svg.append('path')
      .attr('fill', 'orange')
      .attr('stroke', 'orange')
      .attr('stroke-width', 16)
      .attr('opacity', 0);
  }

  createArrow() {
    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('oriten', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5');
  }

  randomGraph(vertices, edges) {
    if (this.svg) this.removeSvg();
    let randomGraph;
    if (vertices === undefined && edges === undefined) randomGraph = generateRandomGraph(10, 10);
    else randomGraph = generateRandomGraph(vertices, edges);
    randomGraph = this.loadGraph(randomGraph, this.container, 'graph');
  }
}
