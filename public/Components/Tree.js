/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-extend-native */
/* eslint-disable func-names */
/* eslint-disable no-else-return */
/* eslint-disable no-loop-func */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-continue */
/* eslint-disable no-return-assign */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable class-methods-use-this */

import {
  getAllSubsets,
  deepClone, isMapInArray,
} from '../Utilities/helpers.js';

import { contextMenu as menu } from '../Utilities/TreeContextMenu.js';

const arraysMatch = function (arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
};

Set.prototype.subSet = function (otherSet) {
  if (this.size > otherSet.size) return false;

  for (const elem of this) {
    if (!otherSet.has(elem)) return false;
  }
  return true;
};


const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const myColor = d3.scaleOrdinal().domain(data).range(d3.schemeSet3);

function resetStyles() {
  d3.selectAll('circle')
    .classed('highlighted-vertex', false)
    .classed('nonhighlight', true);
}

function multiDimensionalUnique(arr) {
  const uniques = [];
  const itemsFound = {};
  for (let i = 0, l = arr.length; i < l; i++) {
    const stringified = JSON.stringify(arr[i]);
    if (itemsFound[stringified]) {
      continue;
    }
    uniques.push(arr[i]);
    itemsFound[stringified] = true;
  }
  return uniques;
}

function highlightVertex(nodeId) {
  resetStyles();
  d3.selectAll('circle')
    .filter((node) => nodeId === node.data.id)
    .classed('nonhighlight', false)
    .classed('highlighted-vertex', true);
}

function moveTooltip(node, maxSetIncl, maxSetExcl) {
  if ('children' in node === false) {
    d3.select('#tooltip').html('Largest set of a leaf is 1');
  } else {
    d3.select('#tooltip').html(`<div>Max set incl. node: ${maxSetIncl}</div>
    <div>
      Max set excl. node: ${maxSetExcl}
    </div>`);
  }

  const nodeSvg = d3.select(`#treeNode-${node.id}`);
  const cx = nodeSvg.attr('cx');
  const cy = nodeSvg.attr('cy');

  d3.select('#tooltip-arrow')
    .style('opacity', 1)
    .attr('x1', cx - 50)
    .attr('y1', cy)
    .attr('x2', cx - 18)
    .attr('y2', cy)
    .attr('transform', `translate(${0}, ${30})`);

  const { top } = document
    .getElementById('tooltip-arrow')
    .getBoundingClientRect();
  const { left } = document
    .getElementById('tooltip-arrow')
    .getBoundingClientRect();

  d3.select('#tooltip')
    .style('opacity', 1)
    .style('left', `${left}px`)
    .style('top', `${top}px`);
}

function getSubTree(rootOfSubtree, currentNode) {
  let subTree;
  rootOfSubtree.each((d) => {
    if (d.data.id === currentNode.id) subTree = d.descendants();
  });
  return subTree;
}

const colorArray = ['red', 'green', 'blue'];

export default class Tree {
  constructor(container, type, graph) {
    this.dpTable = new Map();
    this.container = container;
    this.isMis = false;
    this.isColor = false;
    this.root = null;
    this.currentNodeIndex = 0;
    this.graph = null;
    this.type = type;
    this.graph = graph;
    this.masterNodes = [];
  }

  getSubTree(node) {
    return node.descendants();
  }

  getRoot() {
    return this.root;
  }

  updateMasterList() {
    let temp = [];
    this.nodes.forEach((bag) => {
      if (bag.vertices) temp = temp.concat(bag.vertices);
    });

    const tempSet = [...new Set(temp)];
    this.masterNodes = tempSet;
  }

  isBinary() {
    let isBinary = true;

    this.root.sum((node) => {
      if (node.children) {
        node.children.length > 2 ? (isBinary = false) : (isBinary = true);
      }
    });

    return isBinary;
  }

  isNodeCoverage() {
    // const nodeCoverage = true;

    const tempSet = new Set();

    this.graph.nodes.forEach((node) => {
      const tempArr = node.label.split(' ');
      tempArr.forEach((ta) => tempSet.add(parseInt(ta, 10)));
    });

    const tempSet2 = new Set();

    this.root.sum((node) => {
      const tempArr2 = node.label.split(',');
      tempArr2.forEach((ta) => tempSet2.add(parseInt(ta, 10)));
    });

    return tempSet.subSet(tempSet2);
  }

  isEdgeCoverage() {
    return this.graph.links.every((link) => {
      this.root.eachAfter((node) => {
        if (
          node.data.vertices
          && node.data.vertices.includes(link.source.id)
          && node.data.vertices.includes(link.target.id)
        ) {
          return true;
        }
      });
      return false;
    });
  }

  checkNodeType() {
    let isViableNodeType = false;
    let finalBoolean = true;

    this.root.eachAfter((bag) => {
      const { vertices } = bag.data;

      isViableNodeType = false;

      if (!bag.data.children || bag.data.children.length === 0) {
        if (vertices.length <= 1) {
          isViableNodeType = true;
        }
      } else if (bag.data.children.length === 2) {
        if (
          arraysMatch(
            bag.children[0].data.vertices,
            bag.children[1].data.vertices,
          )
        ) {
          isViableNodeType = true;
        }
      } else if (vertices.length > bag.data.children[0].vertices.length) {
        const vl = vertices.length - bag.data.children[0].vertices.length;
        if (vl === 1) {
          isViableNodeType = true;
        }
      } else if (vertices.length < bag.data.children[0].vertices.length) {
        const vl = bag.data.children[0].vertices.length - vertices.length;
        if (vl === 1) {
          isViableNodeType = true;
        }
      }

      if (isViableNodeType === false) {
        finalBoolean = false;
      }
    });

    return finalBoolean;
  }

  checkNiceProperties() {
    if (this.checkNodeType()) {
      d3.select('#output').html(`
        All nodes are either a leaf, join, introduce or a forget node <span class="material-icons correct-answer">check</span>
      `);
    } else {
      d3.select('#output').html(`
      Some nodes are NOT a leaf, join, introduce or a forget node <span class="material-icons wrong-answer">clear</span>
      `);
    }
  }

  restart() {
    this.updateMasterList();
    this.setAllG();

    const treeData = this.treeLayout(this.root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    nodes.forEach((d) => {
      d.y = d.depth * 180;
    });

    this.svg
      .selectAll('line')
      .data(links, (d) => d.id)
      .join(
        (enter) => enter
          .append('line')
          .lower()
          .attr('class', 'tree-link')
          .attr('x1', (d) => d.parent.x + 12.5)
          .attr('y1', (d) => d.parent.y)
          .attr('x2', (d) => d.x + 12.5)
          .attr('y2', (d) => d.y),
        (update) => update
          .attr('x1', (d) => d.parent.x + 12.5)
          .attr('y1', (d) => d.parent.y)
          .attr('x2', (d) => d.x + 12.5)
          .attr('y2', (d) => d.y),
        (exit) => exit.remove(),
      );

    this.svg
      .selectAll('rect')
      .data(nodes, (d) => d.id)
      .join(
        (enter) => enter
          .append('rect')
          .attr('width', (d) => {
            const splitted = d.data.label.split(',');
            return splitted.length * 25;
          })
          .attr('height', 25)
          .attr('x', (d) => d.x - (d.data.label.split(',').length * 25) / 2)
          .attr('y', (d) => d.y)
          // .attr('transform', (d) => `translate(${d.x},${d.y})`)
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('class', 'tree-node')
          .on('contextmenu', d3.contextMenu(menu)),
        (update) => update
          .attr('x', (d) => d.x - (d.data.label.split(',').length * 25) / 2)
          // .attr('x', (d) => d.x)
          .attr('y', (d) => d.y),
        (exit) => exit.remove(),
      );

    this.svg
      .selectAll('text')
      .data(nodes, (d) => d.label)
      .join(
        (enter) => enter
          .append('text')
          .attr('x', (d) => d.x)
          .attr('y', (d) => d.y)
          .attr('dy', '1.1em')
          .attr('class', 'graph-label')
          .text((d) => d.data.label),
        (update) => update.text((d) => d.data.label),
        (exit) => exit.remove(),
      );

    this.checkNiceProperties();
  }

  addNode(parentNode, label, vertices) {
    const newNodeObject = {
      id: ++this.nodes.length,
      label,
      children: null,
      tree: this,
      vertices,
    };

    const newNode = d3.hierarchy(newNodeObject);
    newNode.depth = parentNode.depth + 1;
    newNode.parent = parentNode;
    newNode.children = null;

    if (!parentNode.children) {
      parentNode.children = [];
      parentNode.data.children = [];
    }

    parentNode.children.push(newNode);
    parentNode.data.children.push(newNode.data);

    this.currentParent = parentNode;
    this.restart();
  }

  removeNode(d) {
    this.root.each((node) => {
      if (d === node) {
        node.children = null;
        node.data.children = null;
        const nIndex = node.parent.data.children.indexOf(node);
        node.parent.data.children.splice(nIndex, 1);

        if (node.parent.children.length === 1) node.parent.children = null;
      }
    });
    this.restart();
  }

  clear() {
    this.svg.remove();
  }

  hideTooltip() {
    d3.select('#tooltip').style('opacity', 0);
    d3.select('#tooltip-arrow').style('opacity', 0);
  }

  setGraph(graph) {
    this.graph = graph;
  }

  setAllNodes() {
    this.root.eachAfter((node) => {
      node.largestSet = 0;
    });
  }

  highlightMaxSet(setToHighlight) {
    let sb = '';
    sb += setToHighlight.replace('{', '').replace('}', '');
    if (sb === 'Ø') return;
    sb = `[${sb}]`;
    const set = JSON.parse(sb);
    this.graph.runMis(this.currentSubTree, set, 0, true);
  }

  convertMapToHTMLTable() {
    const solutionTypes = [...this.dpTable.keys()];
    const solutionTypesBooleans = [...this.dpTable.values()];
    const tableHeader = this.createTableHeader();
    const tableRows = this.createTableRows(solutionTypes, solutionTypesBooleans);
    const htmlTable = this.createHTMLTable(tableHeader, tableRows);
    return htmlTable;
  }

  createTableHeader() {
    return String.raw`
    <thead>
      <tr>
        <th>d</th>
        <th>M</th>
      </tr>
    </thead>
    `;
  }

  createTableRows(solutionTypes) {
    let tableRowString = '';
    solutionTypes.forEach((solutionType) => {
      const verticesDegrees = solutionType[0];
      const matching = solutionType[1];
      const degreeString = this.createDegreeString(verticesDegrees, matching);
      const matchingString = this.createMatchingString(matching);
      tableRowString += this.createRow(degreeString, matchingString);
    });
    return tableRowString;
  }

  createMatchingString(matching) {
    let matchingString = '[ ';
    matching.forEach((pair) => {
      if (pair.length !== 0) matchingString += JSON.stringify(pair);
    });

    matchingString += ' ]';
    return matchingString;
  }

  createHTMLTable(tableHeader, tableRows) {
    return `<table id="dp-table" class="hamiltonianTable">${tableHeader}<tbody>${tableRows}</tbody></table>`;
  }

  createDegreeString(verticesDegrees) {
    const verticesIds = Array.from(Object.keys(verticesDegrees));
    let matrixString = '';
    for (const vertexId of verticesIds) {
      const degree = verticesDegrees[vertexId];
      matrixString += String.raw`${vertexId} → ${degree} <br>`;
    }
    return matrixString;
  }

  createRow(matrixString, matchingString) {
    return String.raw`
    <tr>
      <td>${matrixString}</td>
      <td>${matchingString}</td>
    </tr>`;
  }

  drawHamiltonianTable(node, tableData) {
    const nodeSvg = d3.select(`#treeNode-${node.id}`);
    const x = parseInt(nodeSvg.attr('x'), 10);
    let y = parseInt(nodeSvg.attr('y'), 10);

    y += 12.5;

    this.moveTooltipArrow(x, y);

    const { top } = document
      .getElementById('tooltip-arrow')
      .getBoundingClientRect();

    const { left } = document
      .getElementById('tooltip-arrow')
      .getBoundingClientRect();

    d3.select('#dp-container')
      .html(tableData);

    this.moveDpTable(left, top);
    renderMathInElement(document.body);
  }

  moveDpTable(left, top) {
    d3.select('#dp-container')
      .style('left', `${left}px`)
      .style('top', `${top}px`);
  }

  moveTooltipArrow(x, y) {
    d3.select('#tooltip-arrow')
      .attr('x1', x - 50)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y)
      .attr('transform', `translate(${0}, ${30})`);
  }

  drawTable(node) {
    const keys = Object.keys(node.table);
    const values = Object.values(node.table);
    let sb = '';

    keys.forEach((key, index) => {
      if (key === '') {
        key = 'Ø';
        keys.splice(index, 1);
        keys.unshift(key);
        const val = values[index];
        values.splice(index, 1);
        values.unshift(val);
      }
    });

    keys.forEach((key, index) => {
      const value = values[index];
      if (value < -1000) return;
      if (key !== 'Ø') {
        key = `{${key}}`;
      }
      sb += `<tr id=${key} class="mis-row"><td class="sets">${key}</td><td>${value}</td></tr>`;
    });

    const start = `<table><tbody id="tbody">${sb}</tbody></table>`;

    const nodeSvg = d3.select(`#treeNode-${node.id}`);
    const x = parseInt(nodeSvg.attr('x'), 10);
    let y = parseInt(nodeSvg.attr('y'), 10);

    y += 12.5;

    d3.select('#tooltip-arrow')
      .style('opacity', 1)
      .attr('x1', x - 50)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y)
      .attr('transform', `translate(${0}, ${30})`);

    const { top } = document
      .getElementById('tooltip-arrow')
      .getBoundingClientRect();
    const { left } = document
      .getElementById('tooltip-arrow')
      .getBoundingClientRect();

    d3.select('#tooltip')
      .html(start)
      .style('opacity', 1)
      .style('left', `${left}px`)
      .style('top', `${top}px`);
  }

  async misiterative() {
    let i = 0;
    this.root.eachAfter(async (currentNode) => {
      i++;
      if (this.currentNodeIndex !== i) return;
      const node = currentNode.data;

      if ('children' in node === false) {
        moveTooltip(node);
        highlightVertex(node.id);
        node.largestSet = 1;
        return node.largestSet;
      }

      let maxSetExcl = 0;

      if (node.children.length === 1) {
        maxSetExcl = node.children[0].largestSet;
      }

      if (node.children.length === 2) {
        maxSetExcl = node.children[0].largestSet + node.children[1].largestSet;
      }

      let maxSetIncl = 1;

      if (node.children[0] !== undefined && 'children' in node.children[0]) {
        const left = node.children[0].children[0].largestSet;
        let right = 0;
        if (node.children[0].children.length === 2) right = node.children[0].children[1].largestSet;
        maxSetIncl += left + right;
      }

      if (node.children[1] !== undefined && 'children' in node.children[1]) {
        const left = node.children[1].children[0].largestSet;
        let right = 0;
        if (node.children[1].children.length === 2) right = node.children[1].children[1].largestSet;

        maxSetIncl += left + right;
      }

      moveTooltip(node, maxSetIncl, maxSetExcl);
      highlightVertex(node.id);

      node.largestSet = Math.max(maxSetExcl, maxSetIncl);
      return node.largestSet;
    });
  }

  setMisNormalTree() {
    this.isMisNormalTree = true;
  }

  nextStep() {
    const N = this.root.descendants().length;
    this.currentNodeIndex++;
    if (this.currentNodeIndex !== N) this.currentNodeIndex %= N;
    if (this.isMisNormalTree) this.misiterative(this.currentNodeIndex);
    if (this.isColor) this.threeColor(this.currentNodeIndex);
  }

  previousStep() {
    if (this.currentNodeIndex === 0) return;
    const N = this.root.descendants().length;
    --this.currentNodeIndex;
    this.currentNodeIndex %= N;
    if (this.isMisNormalTree) this.misiterative(this.currentNodeIndex);
    if (this.isColor) this.threeColor(this.currentNodeIndex);
  }

  animateNode(nodeToAnimate) {
    const descendants = nodeToAnimate.descendants();

    const descendantsIds = [];

    descendants.forEach((currentNode) => {
      descendantsIds.push(currentNode.data.id);
    });

    this.svg.selectAll('rect').classed('highlighted-node', (currentNode) => {
      if (descendantsIds.includes(currentNode.data.id)) return true;
      return false;
    });
  }

  animateLink(node) {
    const desLinks = node.links();
    const wat = [];

    desLinks.forEach((currentLink) => {
      wat.push(currentLink.source.data);
      wat.push(currentLink.target.data);
    });

    this.svg.selectAll('line.tree-link').style('stroke', (link) => {
      if (wat.includes(link.source.data)) return 'orange';
    });
  }

  isArrayInArray(arr, item) {
    const item_as_string = JSON.stringify(item);
    const contains = arr.some((ele) => JSON.stringify(ele) === item_as_string);
    return contains;
  }

  getNodeType(node) {
    let type = '';
    if ('children' in node === false) type = 'leaf';
    else if (node.children.length === 2) type = 'join';
    else if (node.vertices.length > node.children[0].vertices.length) type = 'introduce';
    else if (node.vertices.length < node.children[0].vertices.length) type = 'forget';
    return type;
  }

  createLeafNodeTable() {
    const verticesDegrees = {};
    const matching = [];
    const state = [verticesDegrees, matching];
    this.dpTable.set(state, true);
  }

  setTableForNodeAboveLeaf() {
    const solutionType = [];
    const d = {};
    d[this.introducedVertex] = 0;
    const matching = [];
    const pair = [];
    pair.push(this.introducedVertex);
    matching.push(pair);
    solutionType.push(d, matching);
    this.dpTable.set(solutionType, true);
  }

  createSolutionTypeForDegreeZero(verticesDegrees, matching) {
    const solutionType = [];
    const pair = [];
    verticesDegrees[this.introducedVertex] = 0;
    pair.push(this.introducedVertex);
    matching.push(pair);
    solutionType.push(verticesDegrees, matching);
    this.dpTable.set(solutionType, true);
  }

  getKeysAsInts(obj) {
    const keys = Object.keys(obj);

    const intArray = [];

    keys.forEach((key) => {
      const int = parseInt(key, 10);
      intArray.push(int);
    });

    return intArray;
  }

  setTableForIntroduceNode(partialSolutions) {
    if (partialSolutions === undefined) {
      this.setTableForNodeAboveLeaf();
      return;
    }

    partialSolutions.forEach((partialSolution) => {
      for (let i = 0; i <= 2; i++) {
        const verticesDegrees = deepClone(partialSolution[0]);
        const matching = deepClone(partialSolution[1]);
        const childVertices = this.getKeysAsInts(verticesDegrees);

        switch (i) {
          case 0:
            this.createSolutionTypeForDegreeZero(verticesDegrees, matching);
            break;
          case 1:
            this.createSolutionTypeForDegreeOne(childVertices, verticesDegrees, matching);
            break;
          case 2:
            this.createSolutionTypeForDegreeTwo(childVertices, verticesDegrees, matching);
            break;
        }
      }
    });
  }

  createSolutionTypeForDegreeTwo(childVertices, verticesDegrees, matching) {
    verticesDegrees[this.introducedVertex] = 2;

    const solutionType = [];
    const neighbors = this.graph.getNeighbors(this.introducedVertex);
    const neighborsInSubGraph = neighbors.filter((value) => childVertices.includes(value));

    if (neighborsInSubGraph.length === 2) {
      const neighborOne = neighborsInSubGraph[0];
      const neighborTwo = neighborsInSubGraph[1];

      let oldVal = verticesDegrees[neighborOne];
      let oldVal2 = verticesDegrees[neighborTwo];

      verticesDegrees[neighborOne] = ++oldVal;
      verticesDegrees[neighborTwo] = ++oldVal2;

      matching = matching.filter((pair) => !pair.includes(neighborOne));
      matching = matching.filter((pair) => !pair.includes(neighborTwo));

      if (verticesDegrees[neighborOne] === 1 && verticesDegrees[neighborTwo] === 1) {
        const pair = [neighborOne, neighborTwo];
        matching.push(pair);
      }

      solutionType.push(verticesDegrees, matching);
      this.dpTable.set(solutionType, true);
    }
  }

  createSolutionTypeForDegreeOne(childVertices, verticesDegrees, matching) {
    verticesDegrees[this.introducedVertex] = 1;

    for (const childVertex of childVertices) {
      if (this.graph.isEdge(childVertex, this.introducedVertex)) {
        const solutionType = [];
        const degreeOfW = verticesDegrees[childVertex];

        switch (degreeOfW) {
          case 0:
            verticesDegrees[childVertex] = 1;
            matching = this.updateMatching(matching, childVertex);
            solutionType.push(verticesDegrees, matching);
            this.dpTable.set(solutionType, true);
            break;
          case 1:
            for (let pair of matching) {
              if (pair.includes(childVertex)) {
                matching = this.removePairFromMatching(matching, pair);
                pair = pair.filter((x) => x !== childVertex);
                pair.push(this.introducedVertex);
                matching.push(pair);
                verticesDegrees[childVertex] = 2;
                solutionType.push(verticesDegrees, matching);
                this.dpTable.set(solutionType, true);
              } else {
                solutionType.push(verticesDegrees, matching);
                this.dpTable.set(solutionType, false);
              }
            }
            break;
        }

        return;
      }
    }
  }

  removePairFromMatching(matching, pair) {
    const pairIndex = matching.indexOf(pair);
    matching.splice(pairIndex, 1);
    return matching;
  }

  updateMatching(matching, w) {
    matching = matching.filter((pair) => !pair.includes(w));
    const pair = [];
    pair.push(w, this.introducedVertex);
    matching.push(pair);
    return matching;
  }

  isIntroducedVertexInMatching(matching) {
    return matching.some((pair) => {
      if (pair.length > 1 && pair.includes(this.introducedVertex)) return true;
      else return false;
    });
  }

  isForgottenVertexInMatching(matching) {
    return matching.some((pair) => {
      if (pair.length > 1 && pair.includes(this.forgottenVertex)) return true;
      else return false;
    });
  }

  setTableForForgetNode(partialSolutions) {
    partialSolutions.forEach((partialSolution) => {
      const solutionType = [];
      const degreeVertices = deepClone(partialSolution[0]);
      const matching = deepClone(partialSolution[1]);
      const valueOfForgottenVertex = degreeVertices[this.forgottenVertex];
      delete degreeVertices[this.forgottenVertex];

      if (valueOfForgottenVertex === 2) {
        solutionType.push(degreeVertices, matching);
        this.dpTable.set(solutionType, true);
      }
    });
  }

  removeSingletonsFromMatching(matching) {
    return matching.filter((pair) => pair.length > 1);
  }

  removeForgottenVertexFromMatching(matching) {
    for (const pair of matching) {
      if (pair.includes(this.forgottenVertex)) {
        const pairIndex = matching.indexOf(pair);
        matching.splice(pairIndex, 1);
      }
    }
    return matching;
  }

  setTableForJoinNode(leftChildPartialSolutions, rightChildPartialSolutions) {

    /*     const leftTableKeys = childStates;
    const child2 = this.getChild2(node);
    const rightTableKeys = [...child2.table.keys()];

    for (let i = 0; i < leftTableKeys.length; i++) {
      const state = [];
      const leftState = leftTableKeys[i];
      const rightState = rightTableKeys[i];

      const leftD = leftState[0];
      const rightD = rightState[0];

      const combinedObject = sumObjectsByKey(leftD, rightD);
      const values = Object.values(combinedObject);

      for (const value of values) {
        if (value > 2) leq2 = false;
      }

      const hasCycle = false;
      const leftMatching = leftState[1];
      const rightMatching = rightState[1];
      const newMatching = leftMatching.concat(rightMatching);
    } */
  }

  runHamiltonianCycle() {
    let i = 1;
    this.root.eachAfter((currentNode) => {
      if (this.currentNodeIndex !== i++) return;
      const node = currentNode.data;
      const type = this.getNodeType(node);
      const subTree = getSubTree(this.root, node);
      const inducedSubgraph = this.graph.createSubgraph(subTree);
      this.graph.highlightSubGraph(inducedSubgraph);

      let child;
      let partialSolutions;
      let partialSolutionBooleans;
      if ('children' in node) {
        child = this.getChild(node);
        if (child.table.size !== 0) {
          partialSolutions = [...child.table.keys()];
          partialSolutionBooleans = [...child.table.values()];
        }
      }

      this.dpTable = new Map();

      switch (type) {
        case 'leaf':
          this.createLeafNodeTable();
          break;
        case 'introduce':
          this.setIntroducedVertex(node);
          if (child.vertices.length === 0) {
            this.setTableForNodeAboveLeaf();
          } else {
            this.setTableForIntroduceNode(partialSolutions, partialSolutionBooleans);
          }
          break;
        case 'forget':
          this.setForgottenVertex(node);
          this.setTableForForgetNode(partialSolutions);
          break;
        case 'join':
          const child2 = this.getChild2(node);
          const partialSolutions2 = [...child2.table.keys()];
          this.setTableForJoinNode(partialSolutions, partialSolutions2);
          break;
      }
      node.table = this.dpTable;
      const tableData = this.convertMapToHTMLTable();
      this.moveTableArrow(node);
      this.moveTable(tableData);
      // this.drawHamiltonianTable(node, tableData);
    });
  }

  createStatesIntroduceNodeAboveLeafThreeColor() {
    const newStates = [];
    for (const color of colorArray) {
      const colorMap = new Map();
      colorMap.set(this.introducedVertex, color);
      newStates.push(colorMap);
    }
    return newStates;
  }

  threeColor() {
    let i = 0;
    this.root.eachAfter((currentNode) => {
      if (this.currentNodeIndex !== ++i) return;
      const node = currentNode.data;
      const nodeType = this.getNodeType(node);
      const subTree = getSubTree(this.root, node);
      const inducedSubgraph = this.graph.createSubgraph(subTree);
      this.graph.highlightSubGraph(inducedSubgraph);
      this.dpTable = {};
      this.graph.resetNodeColors();

      let child;
      let childStates;
      if ('children' in node) {
        child = this.getChild(node);
        childStates = child.states;
      }

      switch (nodeType) {
        case 'leaf':
          this.graph.hideTooltip();
          this.graph.hideArrow();
          this.graph.hideHull();
          node.states = [[]];
          break;
        case 'introduce':
          this.setIntroducedVertex(node);
          this.graph.addNodeArrow(this.introducedVertex, 'Introduced vertex');
          this.graph.highlightNodeColor(this.introducedVertex, 'rgb(128, 177, 211)');
          if (child.vertices.length === 0) {
            node.states = this.createStatesIntroduceNodeAboveLeafThreeColor();
          } else {
            node.states = this.createStatesIntroduceNodeThreeColor(childStates, subTree);
          }
          break;
        case 'forget':
          this.setForgottenVertex(node);
          this.graph.addNodeArrow(this.forgottenVertex, 'Forgotten vertex');
          this.graph.highlightNodeColor(this.forgottenVertex, 'rgb(251, 128, 114)');
          node.states = this.createStatesForForgetNodeThreeColor(childStates);
          break;
        case 'join':
          node.states = this.createStatesJoinNodeThreeColor(node);
          break;
      }
      const threeColorTableHtmlString = this.createThreeColorTableHtmlString(node);
      this.moveTableArrow(node);
      this.moveTable(threeColorTableHtmlString);
    });
  }

  createStatesJoinNodeThreeColor(node) {
    const newStates = [];

    const child1 = this.getChild(node);
    const child1States = child1.states;

    const child2 = this.getChild2(node);
    const child2States = child2.states;

    if (child1States.length < child2States.length) {
      for (const childState of child1States) {
        if (isMapInArray(childState, child2States)) newStates.push(childState);
      }
    } else {
      for (const childState of child2States) {
        if (isMapInArray(childState, child1States)) newStates.push(childState);
      }
    }
    return newStates;
  }

  createStatesForForgetNodeThreeColor(childStates) {
    const newStates = [];
    const duplicateTracker = [];

    for (const childState of childStates) {
      childState.delete(this.forgottenVertex);
      const stateString = JSON.stringify([...childState]);

      if (duplicateTracker.includes(stateString)) {
        // do nothing
      } else {
        duplicateTracker.push(stateString);
        newStates.push(childState);
      }
    }
    return newStates;
  }

  createStatesIntroduceNodeThreeColor(childsStates, subTree) {
    const newStates = [];

    for (const childState of childsStates) {
      for (const color of colorArray) {
        const cs = deepClone(childState);
        cs.set(this.introducedVertex, color);
        if (this.graph.checkIfIntroducedVertex(cs, subTree)) {
          // do nothing.
        } else {
          newStates.push(cs);
        }
      }
    }
    return newStates;
  }

  createThreeColorTableHtmlString(node) {
    const header = '<thead><tr><td>c → {R, G, B}</td></tr></thead>';

    let rowString = '';
    const { states } = node;

    for (const state of states) {
      const vertices = [...state.keys()];
      let mapString = '';
      for (const vertex of vertices) {
        const color = state.get(vertex);
        mapString += `${vertex} → <span class="${color}">${color}</span><br/>`;
      }
      rowString += `<tr><td>${mapString}</td></tr>`;
    }
    return `<table class="hamiltonianTable">${header}${rowString}</table>`;

    /*     for (const state of node.states) {
      rowString += '<tr>';
      for (const s of state) {
        let color = '';
        if (s === 'red') {
          color = 'red';
        }
        if (s === 'green') {
          color = 'green';
        }
        if (s === 'blue') {
          color = 'blue';
        }

        rowString += `<td class="${color}">${s}</td>`;
      }
      rowString += '</tr>';
    }
 */
  }

  runThreeColor() {
    this.currentNodeIndex = 0;
    this.threeColor();
  }

  getChild(node) {
    const child = node.children[0];
    const clone1 = deepClone(child);
    return clone1;
  }

  getChild2(node) {
    const child = node.children[1];
    const clone = deepClone(child);
    return clone;
  }

  getChildTable(node) {
    const child = node.children[0];
    const childClone = JSON.parse(JSON.stringify(child));
    const childTable = childClone.table;
    return childTable;
  }

  getChildTable2(node) {
    const child = node.children[1];
    const childClone = JSON.parse(JSON.stringify(child));
    const childTable = childClone.table;
    return childTable;
  }

  setIntroducedVertex(node) {
    const { vertices } = node;
    const childsVertices = node.children[0].vertices;
    const difference = vertices.filter((x) => !childsVertices.includes(x));
    const introducedVertex = difference[0];
    this.introducedVertex = introducedVertex;
  }

  setForgottenVertex(node) {
    const childsVertices = node.children[0].vertices;
    const forgottenVertex = childsVertices.filter(
      (x) => !node.vertices.includes(x),
    );
    const f = forgottenVertex[0];
    this.forgottenVertex = f;
  }

  mis() {
    let i = 0;
    this.root.copy().eachAfter((currentNode) => {
      if (this.currentNodeIndex !== ++i) return;
      const node = currentNode.data;
      const nodeType = this.getNodeType(node);
      const subTree = getSubTree(this.root, node);
      const inducedSubgraph = this.graph.createSubgraph(subTree);
      this.graph.highlightSubGraph(inducedSubgraph);
      const allSubsets = getAllSubsets(currentNode.data.vertices);
      allSubsets.map((s) => s.sort());
      let childTable;
      if ('children' in node) childTable = this.getChildTable(node);
      this.dpTable = {};
      this.graph.resetNodeColors();

      switch (nodeType) {
        case 'leaf':
          this.dpTable[''] = 0;
          this.graph.hideArrow();
          this.graph.hideHull();
          this.graph.hideTooltip();
          break;
        case 'introduce':
          this.setIntroducedVertex(node);
          this.graph.addNodeArrow(this.introducedVertex, 'Introduced Vertex');
          this.graph.highlightNodeColor(this.introducedVertex, 'rgb(128, 177, 211)');
          this.setTableForIntroduceNodeMis(allSubsets, subTree, childTable);
          break;
        case 'forget':
          this.setForgottenVertex(node);
          this.graph.addNodeArrow(this.forgottenVertex, 'Forgotten Vertex');
          this.graph.highlightNodeColor(this.forgottenVertex, 'rgb(251, 128, 114)');
          this.setTableForgetNodeMis(allSubsets, childTable, currentNode);
          break;
        case 'join':
          const childTableLeft = this.getChildTable(node);
          const childTableRight = this.getChildTable2(node);
          this.setTableJoinNodeMis(allSubsets, childTableLeft, childTableRight);
          break;
      }
      node.table = this.dpTable;
      const tableHTMLString = this.createTableHtmlString(currentNode);
      this.moveTableArrow(node);
      this.moveTable(tableHTMLString);
    });
  }

  createTableX() {
    d3.select('#main')
      .append('table')
      .attr('class', 'hamiltonianTable')
      .attr('id', 'tableX');
  }

  moveTable(tableHTMLString) {
    if (!this.table) {
      this.createTableX();
      this.table = true;
    }
    const { top } = this.getTopOfArrow();
    const { left } = this.getLeftOfArrow();

    d3.select('#tableX')
      .html(tableHTMLString)
      .style('left', `${left}px`)
      .style('top', `${top}px`)
      .style('transform', 'translate(-100%, 0)');
  }

  getLeftOfArrow() {
    return document
      .getElementById('tooltip-arrow')
      .getBoundingClientRect();
  }

  getTopOfArrow() {
    return document
      .getElementById('tooltip-arrow')
      .getBoundingClientRect();
  }

  moveTableArrow(node) {
    const nodeSvg = d3.select(`#treeNode-${node.id}`);
    const x = parseInt(nodeSvg.attr('x'), 10);
    let y = parseInt(nodeSvg.attr('y'), 10);

    y += 12.5;

    d3.select('#tooltip-arrow')
      .style('opacity', 1)
      .attr('x1', x - 50)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y)
      .attr('transform', `translate(${0}, ${30})`);
  }

  createTableHtmlString() {
    const keys = Object.keys(this.dpTable);
    const values = Object.values(this.dpTable);
    let htmlString = '';

    keys.forEach((key, index) => {
      if (key === '') {
        key = 'Ø';
        keys.splice(index, 1);
        keys.unshift(key);
        const val = values[index];
        values.splice(index, 1);
        values.unshift(val);
      }
    });

    keys.forEach((key, index) => {
      const value = values[index];
      if (value < -1000) return;
      if (key !== 'Ø') {
        key = `{${key}}`;
      }
      htmlString += `<tr id=${key}><td>${key}</td><td>${value}</td></tr>`;
    });

    return `<table><thead><tr><td>S</td><td>MIS</td></tr></thead><tbody id="tbody">${htmlString}</tbody></table>`;
  }

  setTableJoinNodeMis(allSubsets, childTableLeft, childTableRight) {
    for (const set of allSubsets) {
      const child1value = childTableLeft[set];
      const child2value = childTableRight[set];
      const currentNodeValue = set.length;
      this.dpTable[set] = child1value + child2value - currentNodeValue;
    }
  }

  setTableForgetNodeMis(allSubsets, childTable) {
    for (const set of allSubsets) {
      const concatV = set.concat(this.forgottenVertex);
      concatV.sort();
      const setWithoutV = childTable[set];
      const setWithV = childTable[concatV];
      if (setWithoutV > setWithV) {
        this.dpTable[set] = setWithoutV;
      } else {
        this.dpTable[set] = setWithV;
      }
    }
  }

  setTableForIntroduceNodeMis(allSubsets, subTree, childTable) {
    this.dpTable = childTable;
    for (const set of allSubsets) {
      if (set.includes(this.introducedVertex)) {
        const setWithoutV = set.filter((s) => s !== this.introducedVertex);
        if (this.graph.isVertexAdjacent(subTree, set)) {
          this.dpTable[set] = -9999;
        } else {
          let oldValue = childTable[setWithoutV];
          oldValue++;
          this.dpTable[set] = oldValue;
        }
      }
    }
  }

  disableAllAlgorithms() {
    this.isMis = false;
    this.isThreeColor = false;
  }

  addColorTable() {
    if (this.colorTable) this.colorTable.remove();

    this.colorTable = d3
      .select('#main')
      .append('table')
      .style('opacity', 0)
      .attr('id', 'color-table')
      .attr('class', 'table');
  }

  addTable() {
    if (this.table) this.table.remove();

    this.table = d3
      .select('#main')
      .append('table')
      .attr('id', 'dp-table')
      .attr('class', 'hamiltonianTable');
  }

  addTooltip() {
    if (this.tooltip) this.tooltip.remove();

    this.tooltip = d3
      .select('#main')
      .append('div')
      .attr('class', 'hamiltonianTable')
      .attr('id', 'tooltip');
  }

  addArrow() {
    if (this.arrow) this.arrow.remove();
    this.arrow = this.svg
      .append('line')
      .attr('id', 'tooltip-arrow')
      .attr('x1', 200)
      .attr('y1', 100)
      .attr('x2', 300)
      .attr('y2', 100)
      .attr('marker-end', 'url(#Triangle)')
      .style('opacity', 0);
  }

  removeColorTable() {
    if (this.colorTable) this.colorTable.remove();
  }

  removeMisTable() {
    if (this.tooltip) this.tooltip.remove();
  }

  enableMaximumIndependentSet() {
    this.removeColorTable();
    this.disableAllAlgorithms();

    this.addArrow();
    this.addTooltip();

    this.isMis = true;
    this.currentNodeIndex = 0;
  }

  enableThreeColor() {
    this.removeMisTable();
    this.disableAllAlgorithms();

    this.addArrow();
    this.addColorTable();

    this.isColor = true;
    this.currentNodeIndex = 0;
  }

  enableHamiltonianCycle() {
    this.disableAllAlgorithms();
    window.tableIsVisible = true;
    this.isHamiltonianPath = true;
  }

  nextDPStep() {
    const numberOfNodes = this.root.descendants().length;
    this.currentNodeIndex++;
    if (this.currentNodeIndex !== numberOfNodes) this.currentNodeIndex %= numberOfNodes;
    if (this.isMis) this.mis(this.currentNodeIndex);
    if (this.isColor) this.threeColor(this.currentNodeIndex);
    if (this.isHamiltonianPath) this.runHamiltonianCycle(this.currentNodeIndex);
  }

  previousDPStep() {
    if (this.currentNodeIndex === 0) return;
    const N = this.root.descendants().length;
    --this.currentNodeIndex;
    this.currentNodeIndex %= N;
    if (this.isMis) this.mis(this.currentNodeIndex);
    if (this.isColor) this.threeColor(this.currentNodeIndex);
    if (this.isHamiltonianPath) this.runHamiltonianCycle(this.currentNodeIndex);
  }

  setAllG() {
    this.root.eachAfter((node) => {
      node.tree = this;
    });
  }

  load(treeData, type) {
    if (this.svg) this.clear();
    let height = document.getElementById(this.container).offsetHeight;
    let width = document.getElementById(this.container).offsetWidth;

    this.treeData = treeData;
    this.height = height;
    this.width = width;

    if (this.type === 'normal-tree') {
      width /= 2;
      height /= 3;
    }

    const svg = d3
      .select(`#${this.container}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree();
    treeLayout.size([width, height - 80]);
    treeLayout(root);

    this.root = root;
    this.treeLayout = treeLayout;
    this.nodes = root.descendants();

    svg
      .append('marker')
      .attr('id', 'triangle')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 10)
      .attr('refY', 5)
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .style('fill', 'rgb(51, 51, 51)');

    this.svg = svg;

    this.svg.on('contextmenu', () => d3.event.preventDefault());

    this.path = this.svg
      .append('path')
      .attr('fill', 'orange')
      .attr('stroke', 'orange')
      .attr('stroke-width', 16)
      .attr('opacity', 0);

    this.path2 = this.svg
      .append('path')
      .attr('fill', 'steelblue')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 16)
      .attr('opacity', 0);

    svg
      .selectAll('line')
      .data(root.links())
      .enter()
      .append('line')
      .attr('class', 'tree-link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .lower()
      .attr('transform', `translate(${0}, ${30})`);

    if (this.type === 'normal-tree') {
      svg
        .selectAll('circle')
        .data(root.descendants())
        .enter()
        .append('circle')
        .attr('id', (d) => `treeNode-${d.data.id}`)
        .attr('r', 18)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('class', 'normal-tree-node')
        .attr('transform', `translate(${0}, ${30})`);

      svg
        .selectAll('line').style('stroke', 'rgb(51, 51, 51)');
    } else {
      svg
        .selectAll('rect')
        .data(root.descendants())
        .enter()
        .append('rect')
        .attr('id', (d) => `treeNode-${d.data.id}`)
        .attr('width', (d) => {
          const splitted = d.data.label.split(',');
          return splitted.length * 18;
        })
        .attr('height', 25)
        .attr('x', (d) => d.x - (d.data.label.split(',').length * 18) / 2)
        .attr('y', (d) => d.y)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('transform', `translate(${0}, ${30})`)
        .attr('class', 'tree-node')
        .style('fill', (d) => {
          if ('children' in d.data === false || d.data.children.length === 0) return myColor(9);
          if (d.data.children.length === 2) return myColor(6);
          if (d.data.vertices.length > d.data.children[0].vertices.length) return myColor(5);
          if (d.data.vertices.length < d.data.children[0].vertices.length) return myColor(4);
        })
        .on('contextmenu', d3.contextMenu(menu));
    }

    svg
      .selectAll('text')
      .data(root.descendants())
      .enter()
      .append('text')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('dy', () => {
        if (type === 'normal-tree') return '5px';
        return '17px';
      })
      .attr('class', () => {
        if (type === 'normal-tree') return 'label';
        return 'graph-label';
      })
      .text((d) => {
        if (type === 'normal-tree') return d.data.label;
        if ('children' in d.data === false || d.data.children.length === 0) return;
        if (d.data.children.length === 2) return `${d.data.label}`;
        if (d.data.vertices.length > d.data.children[0].vertices.length) return `${d.data.label}`;
        if (d.data.vertices.length < d.data.children[0].vertices.length) return `${d.data.label}`;
        return d.data.label;
      })
      .attr('transform', `translate(${0}, ${30})`);

    this.setAllG();
  }
}
