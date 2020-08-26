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
  hull,
  getAllSubsets,
  deepClone,
} from '../Utilities/helpers.js';
import { contextMenu as menu } from './TreeContextMenu.js';

const arraysMatch = function (arr1, arr2) {
  // Check if the arrays are the same length
  if (arr1.length !== arr2.length) return false;

  // Check if all items exist and are in the same order
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  // Otherwise, return true
  return true;
};

Set.prototype.subSet = function (otherSet) {
  // if size of this set is greater
  // than otherSet then it can'nt be
  //  a subset
  if (this.size > otherSet.size) return false;

  for (const elem of this) {
    // if any of the element of
    // this is not present in the
    // otherset then return false
    if (!otherSet.has(elem)) return false;
  }
  return true;
};

// Include in your code!
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

function moveColorTable(node) {
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
    if (this.isBinary()) {
      // console.log('is binary');
    } else {
      // console.log('not binary');
    }

    if (this.isNodeCoverage()) {
      // console.log('node coverage true');
    } else {
      // console.log('node coverage false');
    }

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

  removeFromMatching() {
    this.svg.remove();
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
        <th>i</th>
        <th>d</th>
        <th>M</th>
        <th>bool</th>
      </tr>
    </thead>
    `;
  }

  createTableRows(solutionTypes, solutionTypesBooleans) {
    let tableRowString = '';
    solutionTypes.forEach((solutionType, i) => {
      const isPartialSolution = solutionTypesBooleans[i];
      const verticesDegrees = solutionType[0];
      const matching = solutionType[1];
      const degreeString = this.createDegreeString(verticesDegrees, matching);
      const matchingString = this.createMatchingString(matching);
      tableRowString += this.createRow(degreeString, matchingString, isPartialSolution, i);
    });
    return tableRowString;
  }

  createMatchingString(matching) {
    let matchingString = '';
    matching.forEach((pair) => {
      matchingString += JSON.stringify(pair);
    });
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

  createRow(matrixString, matchingString, isPartialSolution, i) {
    return String.raw`<tr><td>${++i}</td><td>${matrixString}</td>
    <td>${matchingString}</td>
    <td>${
  isPartialSolution
    ? 'true<span class="material-icons correct-answer">check</span>'
    : 'false<span class="material-icons wrong-answer">clear</span>'}</td></tr>`;
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

    this.moveDpTable(tableData, left, top);
    renderMathInElement(document.body);
  }

  moveDpTable(tableData, left, top) {
    d3.select('#dp-container')
      .html(tableData)
      .style('opacity', 1)
      .style('left', `${left}px`)
      .style('top', `${top}px`)
      .style('padding', '0');
  }

  moveTooltipArrow(x, y) {
    d3.select('#tooltip-arrow')
      .style('opacity', 1)
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

      /* We hit a leaf */
      if ('children' in node === false) {
        moveTooltip(node);
        highlightVertex(node.id);
        node.largestSet = 1;
        return node.largestSet;
      }
      /* Exclude current node */

      let maxSetExcl = 0;

      if (node.children.length === 1) {
        maxSetExcl = node.children[0].largestSet;
      }

      if (node.children.length === 2) {
        maxSetExcl = node.children[0].largestSet + node.children[1].largestSet;
      }

      let maxSetIncl = 1;

      /* Include current node */
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
    // const table = new Map();
    const verticesDegrees = {};
    const matching = [];
    const state = [verticesDegrees, matching];
    this.dpTable.set(state, true);
    // return table;
  }

  setTableForNodeAboveLeaf() {
    // const dpTable = new Map();
    for (let i = 0; i <= 2; i++) {
      const solutionType = [];
      const d = {};
      d[this.introducedVertex] = i;
      const matching = [];
      const pair = [];
      pair.push(this.introducedVertex);
      matching.push(pair);
      solutionType.push(d, matching);

      switch (i) {
        case 0:
          this.dpTable.set(solutionType, true);
          break;
        case 1:
          this.dpTable.set(solutionType, false);
          break;
        case 2:
          this.dpTable.set(solutionType, false);
          break;
      }
    }
  }

  createSolutionTypeForDegreeZero(verticesDegrees, matching, oldBool) {
    const solutionType = [];
    const pair = [];
    verticesDegrees[this.introducedVertex] = 0;
    pair.push(this.introducedVertex);
    matching.push(pair);
    solutionType.push(verticesDegrees, matching);
    this.dpTable.set(solutionType, oldBool);
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

  setTableForIntroduceNode(partialSolutions, partialSolutionBooleans) {
    partialSolutions.forEach((partialSolution, i) => {
      const oldBool = partialSolutionBooleans[i];

      for (let i = 0; i <= 2; i++) {
        const verticesDegrees = deepClone(partialSolution[0]);
        const matching = deepClone(partialSolution[1]);
        const childVertices = this.getKeysAsInts(verticesDegrees);

        switch (i) {
          case 0:
            this.createSolutionTypeForDegreeZero(verticesDegrees, matching, oldBool);
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
    const solutionType = [];
    verticesDegrees[this.introducedVertex] = 2;
    const neighbors = this.graph.getNeighbors(this.introducedVertex);
    const neighborsInSubGraph = neighbors.filter((value) => childVertices.includes(value));

    if (neighborsInSubGraph.length === 2) {
      const neighborOne = neighborsInSubGraph[0];
      const neighborTwo = neighborsInSubGraph[1];

      let oldVal = verticesDegrees[neighborOne];
      let oldVal2 = verticesDegrees[neighborTwo];

      verticesDegrees[neighborOne] = ++oldVal;
      verticesDegrees[neighborTwo] = ++oldVal2;

      solutionType.push(verticesDegrees, matching);

      // pair.push(this.introducedVertex);
      // matching.push(pair);
      this.dpTable.set(solutionType, true);
    } else {
      matching.push([this.introducedVertex]);
      solutionType.push(verticesDegrees, matching);
      this.dpTable.set(solutionType, false);
    }
  }

  createSolutionTypeForDegreeOne(childVertices, verticesDegrees, matching) {
    for (const childVertex of childVertices) {
      if (this.graph.isEdge(childVertex, this.introducedVertex)) {
        const solutionType = [];
        const degreeOfW = verticesDegrees[childVertex];
        verticesDegrees[this.introducedVertex] = 1;

        switch (degreeOfW) {
          case 0:
            verticesDegrees[childVertex] = 1;
            matching = this.updateMatching(matching, childVertex);
            solutionType.push(verticesDegrees, matching);
            this.dpTable.set(solutionType, true);
            break;
          case 1:
            for (const pair of matching) {
              if (pair.includes(childVertex)) {
                matching = this.removePairFromMatching(matching, pair);
                const newPair = [this.introducedVertex, childVertex];
                matching.push(newPair);
                verticesDegrees[childVertex] = 2;
                solutionType.push(verticesDegrees, matching);
                // const newPair = pair.filter((x) => x !== childVertex);
                // newPair.push(this.introducedVertex);
                this.dpTable.set(solutionType, true);
              } else {
                solutionType.push(verticesDegrees, matching);
                this.dpTable.set(solutionType, false);
              }
            }
            break;
          case 2:
            const pair = [this.introducedVertex];
            matching.push(pair);
            solutionType.push(verticesDegrees, matching);
            this.dpTable.set(solutionType, false);
            break;
        }
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

  setTableForForgetNode(partialSolutions, partialSolutionBooleans) {
    const duplicateTracker = [];

    partialSolutions.forEach((partialSolution, i) => {
      const bool = partialSolutionBooleans[i];
      const solutionType = [];
      const degreeVertices = deepClone(partialSolution[0]);
      let matching = deepClone(partialSolution[1]);
      delete degreeVertices[this.forgottenVertex];
      matching = this.removeForgottenVertexFromMatching(matching);


      const d = JSON.stringify(degreeVertices);

      if (!duplicateTracker.includes(d)) {
        duplicateTracker.push(d);


        if (bool) {
          if (this.isIntroducedVertexInMatching(matching)) {
            matching = this.removeForgottenVertexFromMatching(matching);
            this.dpTable.set(solutionType, false);
          } else {
            matching = this.removeForgottenVertexFromMatching(matching);
            this.dpTable.set(solutionType, false);
          }
        } else {
          solutionType.push(degreeVertices, matching);
          this.dpTable.set(solutionType, false);
        }


        solutionType.push(degreeVertices, matching);
        this.dpTable.set(solutionType, false);
      }


      /* matching = this.removeForgottenVertexFromMatching(matching);

      solutionType.push(degreeVertices, matching); */

      // const filtered = this.removeSingletonsFromMatching(matching);

      /*       if (filtered.length === 0) {
        this.dpTable.set(solutionType, false);
      } else {
        this.dpTable.set(solutionType, true);
      } */
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

  handleJoinNode() {
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

  runHamiltonianPath() {
    let i = 1;
    this.root.eachAfter((currentNode) => {
      if (this.currentNodeIndex !== i++) return;
      this.animateNode(currentNode);
      this.animateLink(currentNode);
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
          this.introducedVertex = this.setIntroducedVertex(node);
          if (child.vertices.length === 0) this.setTableForNodeAboveLeaf();
          else this.setTableForIntroduceNode(partialSolutions, partialSolutionBooleans);
          break;
        case 'forget':
          this.forgottenVertex = this.setForgottenVertex(node);
          this.setTableForForgetNode(partialSolutions, partialSolutionBooleans);
          break;
        case 'join':
          this.handleJoinNode();
          break;
      }
      node.table = this.dpTable;
      const tableData = this.convertMapToHTMLTable();
      this.drawHamiltonianTable(node, tableData);
    });
  }

  threeColor() {
    const colorArray = ['red', 'green', 'blue'];
    let i = 1;
    this.root.copy().eachAfter((currentNode) => {
      if (this.currentNodeIndex !== i++) return;

      const node = currentNode.data;
      const subTree = getSubTree(this.root, currentNode.data);

      /* Leaf node */
      if ('children' in node === false) {
        this.graph.hideTooltip();
        this.graph.hideArrow();
        this.graph.hideHull();
        moveColorTable(node);

        const { top } = document
          .getElementById('tooltip-arrow')
          .getBoundingClientRect();
        const { left } = document
          .getElementById('tooltip-arrow')
          .getBoundingClientRect();

        d3.select('#color-table')
          .html(null)
          .style('opacity', 1)
          .style('left', `${left}px`)
          .style('top', `${top}px`);

        node.positionTracker = [];

        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        for (let i = 0; i < subTree.length; i++) {
          const node = subTree[i];
          const pad = 17 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path.attr('d', line(hull(pointArr)));
        this.path.style('opacity', 0.3);

        return;
      }

      const child = node.children[0];

      const inducedSubgraph = this.graph.createSubgraph(subTree);

      this.graph.highlightSubGraph(inducedSubgraph);

      // this.graph.createSubgraph(subTree);

      /* Introduce Node */
      if (node.vertices.length > child.vertices.length) {
        /* Get child states */
        const childClone = JSON.parse(JSON.stringify(child));
        const childsStates = childClone.states;

        /* Find the introduced vertex */
        const difference = node.vertices.filter(
          (x) => !child.vertices.includes(x),
        );
        const introducedVertex = difference[0];

        this.graph.addNodeArrow(introducedVertex, 'Introduced Vertex');
        this.graph.resetNodeColors();
        this.graph.highlightNodeColor(introducedVertex, 'rgb(128, 177, 211)');

        /* Initialize new states */
        const newStates = [];

        if (child.vertices.length === 0) {
          for (const color of colorArray) {
            const newState = [];
            newState.push(color);
            newStates.push(newState);
          }
          const ps = childClone.positionTracker;
          if (!ps.includes(introducedVertex)) ps.push(introducedVertex);
          node.positionTracker = ps;
          node.states = newStates;
        } else {
          for (const childState of childsStates) {
            for (const color of colorArray) {
              const oldState = JSON.parse(JSON.stringify(childState));
              if (
                this.graph.checkIntroducedVertex(
                  introducedVertex,
                  childClone.positionTracker,
                  oldState,
                  color,
                  subTree,
                )
              ) {
                /* If we are here, we can safely add the color */
                oldState.push(color);
                newStates.push(oldState);
              }
            }
          }
          node.states = newStates;

          const ps = childClone.positionTracker;
          if (!ps.includes(introducedVertex)) ps.push(introducedVertex);
          node.positionTracker = ps;
        }
      }

      /* Forgot node */
      if (node.vertices.length < child.vertices.length) {
        /* Get the child's data  */
        const childClone = JSON.parse(JSON.stringify(child));
        const childStates = childClone.states;

        /* Find the forgotten vertex */
        const forgottenVertex = child.vertices.filter(
          (x) => !node.vertices.includes(x),
        );

        this.graph.addNodeArrow(forgottenVertex, 'Forgotten Vertex');
        this.graph.resetNodeColors();
        this.graph.highlightNodeColor(forgottenVertex, 'rgb(251, 128, 114)');

        /* Get the position of the childs vertices */
        const ps = childClone.positionTracker;
        const parsed = parseInt(forgottenVertex, 10);
        const forgottenVertexIndex = ps.indexOf(parsed);

        /* Remove the forgotten vertex from position tracker */
        ps.splice(forgottenVertexIndex, 1);
        node.positionTracker = ps;

        /* Remove the column in the table that includes forgotten vertices */
        for (const childState of childStates) {
          childState.splice(forgottenVertexIndex, 1);
        }

        const uw = multiDimensionalUnique(childStates);

        /* Update this table's state with the new states */
        node.states = uw;
      }

      /* Join node */
      if (node.children.length === 2) {
        const child1 = node.children[0];
        const child1Clone = JSON.parse(JSON.stringify(child1));
        const child1States = child1Clone.states;

        const child2 = node.children[1];
        const child2Clone = JSON.parse(JSON.stringify(child2));
        const child2States = child2Clone.states;
        const newStates = [];

        const child1SubTree = getSubTree(
          this.root,
          currentNode.children[0].data,
        );
        const child1SubGraph = this.graph.createSubgraph(child1SubTree);
        this.graph.highlightSubGraph(child1SubGraph);

        const child2SubTree = getSubTree(
          this.root,
          currentNode.children[1].data,
        );
        const child2SubGraph = this.graph.createSubgraph(child2SubTree);
        this.graph.highlightSubGraph2(child2SubGraph);

        if (child1States.length < child2States.length) {
          node.positionTracker = child1.positionTracker;
          for (const childState of child1States) {
            if (this.isArrayInArray(child2States, childState)) newStates.push(childState);
          }
        } else {
          node.positionTracker = child2.positionTracker;
          for (const childState of child2States) {
            if (this.isArrayInArray(child1States, childState)) newStates.push(childState);
          }
        }
        node.states = newStates;
      }

      if (currentNode.data.children.length === 2) {
        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        const child1SubTree = getSubTree(
          this.root,
          currentNode.children[0].data,
        );

        for (let i = 0; i < child1SubTree.length; i++) {
          const node = child1SubTree[i];
          const pad = 27 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path.attr('d', line(hull(pointArr)));
        this.path.style('opacity', 0.5);
      }

      if (currentNode.data.children.length === 2) {
        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        const child2SubTree = getSubTree(
          this.root,
          currentNode.children[1].data,
        );

        for (let i = 0; i < child2SubTree.length; i++) {
          const node = child2SubTree[i];
          const pad = 27 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path2.attr('d', line(hull(pointArr)));
        this.path2.style('opacity', 0.5);
      } else {
        this.path2.style('opacity', 0);
        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        for (let i = 0; i < subTree.length; i++) {
          const node = subTree[i];
          const pad = 27 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path.attr('d', line(hull(pointArr)));
        this.path.style('opacity', 0.5);
      }

      let sb = '';
      sb += '<tr>';
      for (let i = 0; i < node.positionTracker.length; i++) {
        sb += `<td><strong>${node.positionTracker[i]}</strong></td>`;
      }
      sb += '</tr>';

      for (const state of node.states) {
        sb += '<tr>';
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

          sb += `<td class="${color}">${s}</td>`;
        }
        sb += '</tr>';
      }

      moveColorTable(node);

      const { top } = document
        .getElementById('tooltip-arrow')
        .getBoundingClientRect();
      const { left } = document
        .getElementById('tooltip-arrow')
        .getBoundingClientRect();

      d3.select('#color-table')
        .html(sb)
        .style('opacity', 1)
        .style('left', `${left}px`)
        .style('top', `${top}px`);
    });
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

  getChild2Table(node) {
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
    return introducedVertex;
  }

  setForgottenVertex(node) {
    const childsVertices = node.children[0].vertices;
    const forgottenVertex = childsVertices.filter(
      (x) => !node.vertices.includes(x),
    );
    return forgottenVertex[0];
  }

  mis() {
    this.animX = 0;
    let i = 0;
    this.root.copy().eachAfter((currentNode) => {
      i++;
      if (this.currentNodeIndex !== i) return;

      currentNode.data.table = {};

      // this.animateNode(currentNode);
      // this.animateLink(currentNode);

      // Get all the subsets of the current vertices in this tree node
      const allSubsets = getAllSubsets(currentNode.data.vertices);
      allSubsets.map((s) => s.sort());

      // Get the subtree rooted at this node
      const subTree = getSubTree(this.root, currentNode.data);

      /* Get the induced subgraph of all the vertices in the current subtree */
      const inducedSubgraph = this.graph.createSubgraph(subTree);

      /* Highlight the induced subgraph */
      this.graph.highlightSubGraph(inducedSubgraph);

      this.currentSubTree = subTree;

      // Leaf node
      if ('children' in currentNode.data === false) {
        this.graph.hideTooltip();
        this.graph.hideArrow();
        this.graph.hideHull();
        if (currentNode.data.vertices.length === 0) {
          currentNode.data.table[''] = 0;
        } else {
          const vertex = currentNode.data.vertices[0];
          currentNode.data.table[vertex] = 1;
        }

        const nodeSvg = d3.select(`#treeNode-${currentNode.data.id}`);
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
          .html(null)
          .style('opacity', 1)
          .style('left', `${left}px`)
          .style('top', `${top}px`);

        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        for (let i = 0; i < subTree.length; i++) {
          const node = subTree[i];
          const pad = 17 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path.attr('d', line(hull(pointArr)));
        this.path.style('opacity', 0.3);

        return;
      }

      // Join node
      if (currentNode.data.children.length === 2) {
        this.graph.hideTooltip();
        this.graph.hideArrow();
        this.graph.hideHull();

        // Get child 1's table
        const child1 = currentNode.data.children[0];
        const child1Clone = JSON.parse(JSON.stringify(child1));
        const child1Table = child1Clone.table;

        // Get child 2's table
        const child2 = currentNode.data.children[1];
        const child2Clone = JSON.parse(JSON.stringify(child2));
        const child2Table = child2Clone.table;

        const child1SubTree = getSubTree(
          this.root,
          currentNode.children[0].data,
        );
        const child1SubGraph = this.graph.createSubgraph(child1SubTree);
        this.graph.highlightSubGraph(child1SubGraph);

        const child2SubTree = getSubTree(
          this.root,
          currentNode.children[1].data,
        );
        const child2SubGraph = this.graph.createSubgraph(child2SubTree);
        this.graph.highlightSubGraph2(child2SubGraph);

        for (const set of allSubsets) {
          const child1value = child1Table[set];
          const child2value = child2Table[set];
          const currentNodeValue = set.length;
          currentNode.data.table[set] = child1value + child2value - currentNodeValue;
        }
      }

      // Forget node
      if (
        currentNode.data.vertices.length
        < currentNode.data.children[0].vertices.length
      ) {
        const childsVertices = currentNode.data.children[0].vertices;
        const forgottenVertex = childsVertices.filter(
          (x) => !currentNode.data.vertices.includes(x),
        );

        this.graph.addNodeArrow(forgottenVertex, 'Forgotten Vertex');
        this.graph.resetNodeColors();
        this.graph.highlightNodeColor(forgottenVertex, 'rgb(251, 128, 114)');

        // Get the child's table
        const child = currentNode.data.children[0];
        const childClone = JSON.parse(JSON.stringify(child));
        const childsTable = childClone.table;

        for (const set of allSubsets) {
          /* Union the forgottenVertex with the current subset */
          const concatV = set.concat(forgottenVertex);
          concatV.sort();

          /* Value of set without v */
          const setWithoutV = childsTable[set];

          /* Value of set with v */
          const setWithV = childsTable[concatV];

          if (setWithoutV > setWithV) {
            currentNode.data.table[set] = setWithoutV;
          } else {
            currentNode.data.table[set] = setWithV;
          }
        }
      }

      // Introduce node
      if (
        currentNode.data.vertices.length
        > currentNode.data.children[0].vertices.length
      ) {
        // Get the child's table
        const child = currentNode.data.children[0];
        const childClone = JSON.parse(JSON.stringify(child));
        const childsTable = childClone.table;

        // Set the current node's table
        currentNode.data.table = childsTable;

        // Find the introduced vertex
        const { vertices } = currentNode.data;
        const childsVertices = currentNode.data.children[0].vertices;
        const difference = vertices.filter((x) => !childsVertices.includes(x));
        const introducedVertex = difference[0];

        this.graph.addNodeArrow(introducedVertex, 'Introduced Vertex');
        this.graph.resetNodeColors();
        this.graph.highlightNodeColor(introducedVertex, 'rgb(128, 177, 211)');

        for (const set of allSubsets) {
          // We only care about the subsets containing the introduced vertex v
          if (set.includes(introducedVertex)) {
            /* Check if a vertex inside this set is adjacent to the introduced vertex */
            const setWithoutV = set.filter((s) => s !== introducedVertex);

            if (this.graph.isVertexAdjacent(subTree, set)) {
              currentNode.data.table[set] = -9999;
            } else {
              let oldValue = childsTable[setWithoutV];
              oldValue++;
              currentNode.data.table[set] = oldValue;
            }
          }
        }
      }

      if (currentNode.data.children.length === 2) {
        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        const child1SubTree = getSubTree(
          this.root,
          currentNode.children[0].data,
        );

        for (let i = 0; i < child1SubTree.length; i++) {
          const node = child1SubTree[i];
          const pad = 27 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path.attr('d', line(hull(pointArr)));
        this.path.style('opacity', 0.5);
      }

      if (currentNode.data.children.length === 2) {
        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        const child2SubTree = getSubTree(
          this.root,
          currentNode.children[1].data,
        );

        for (let i = 0; i < child2SubTree.length; i++) {
          const node = child2SubTree[i];
          const pad = 27 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path2.attr('d', line(hull(pointArr)));
        this.path2.style('opacity', 0.5);
      } else {
        this.path2.style('opacity', 0);
        const line = d3.line().curve(d3.curveBasisClosed);

        let pointArr = [];
        const padding = 3.5;

        for (let i = 0; i < subTree.length; i++) {
          const node = subTree[i];
          const pad = 27 + padding;
          pointArr = pointArr.concat([
            [node.x - pad, node.y - pad],
            [node.x - pad, node.y + 150],
            [node.x + pad, node.y - pad],
            [node.x + pad, node.y + pad],
          ]);
        }

        this.path.attr('d', line(hull(pointArr)));
        this.path.style('opacity', 0.5);
      }

      const keys = Object.keys(currentNode.data.table);
      const values = Object.values(currentNode.data.table);
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

      const nodeSvg = d3.select(`#treeNode-${currentNode.data.id}`);
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

      d3.selectAll('.sets').on('mouseover', () => {
        this.highlightMaxSet(d3.event.target.innerText);
      });
      d3.selectAll('.sets').on('mouseleave', () => {
        d3.selectAll('circle').classed('highlighted-stroke', false);
      });
    });
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
      .attr('id', 'tooltip')
      .attr('class', 'table')
      .style('position', 'absolute')
      .style('opacity', 0);
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

  enableHamiltonianPath() {
    this.disableAllAlgorithms();
    this.isHamiltonianPath = true;
  }

  nextDPStep() {
    const numberOfNodes = this.root.descendants().length;
    this.currentNodeIndex++;
    if (this.currentNodeIndex !== numberOfNodes) this.currentNodeIndex %= numberOfNodes;
    if (this.isMis) this.mis(this.currentNodeIndex);
    if (this.isColor) this.threeColor(this.currentNodeIndex);
    if (this.isHamiltonianPath) this.runHamiltonianPath(this.currentNodeIndex);
  }

  previousDPStep() {
    if (this.currentNodeIndex === 0) return;
    const N = this.root.descendants().length;
    --this.currentNodeIndex;
    this.currentNodeIndex %= N;
    if (this.isMis) this.mis(this.currentNodeIndex);
    if (this.isColor) this.threeColor(this.currentNodeIndex);
    if (this.isHamiltonianPath) this.runHamiltonianPath(this.currentNodeIndex);
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

    /* Get the link data and draw the links */
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

    /* Get the node data and draw the nodes */
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
    } else {
      svg
        .selectAll('rect')
        .data(root.descendants())
        .enter()
        .append('rect')
        .attr('id', (d) => `treeNode-${d.data.id}`)
        .attr('width', (d) => {
          const splitted = d.data.label.split(',');
          return splitted.length * 25;
        })
        .attr('height', 25)
        .attr('x', (d) => d.x - (d.data.label.split(',').length * 25) / 2)
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
        if (type === 'normal-tree') {
          return '.-25em';
        }
        return '17px';
      })
      .attr('class', () => {
        if (type === 'normal-tree') return 'label';
        return 'graph-label';
      })
      .text((d) => {
        if (type === 'normal-tree') return d.data.label;
        if ('children' in d.data === false || d.data.children.length === 0) return;
        if (d.data.children.length === 2) return `& ${d.data.label}`;
        if (d.data.vertices.length > d.data.children[0].vertices.length) return `+ ${d.data.label}`;
        if (d.data.vertices.length < d.data.children[0].vertices.length) return `- ${d.data.label}`;
        return d.data.label;
      })
      .attr('transform', `translate(${0}, ${30})`);

    this.setAllG();
  }
}

/*
          for (const childKey of childKeys) {
            const state = [];
            const d = childKey[0];
            const M = childKey[1];
            delete d[forgottenVertex];

            for (const a of M) {
              const aIndex = M.indexOf(a);
              if (a.includes(forgottenVertex)) M.splice(aIndex);
            }

            state.push(d, M);
            table.set(state, true);
          }

          const keys = [...table.keys()];
          const temp = [];

          for (const key of keys) {
            const obj = key[0];
            const entry = JSON.stringify(obj);
            temp.push(entry);
          }

          const newArr = multiDimensionalUnique(temp);

          table = new Map();

          const arrayOfDegrees = [];
          for (const a of newArr) {
            const d = JSON.parse(a);
            arrayOfDegrees.push(d);
          }

          for (const d of arrayOfDegrees) {
            const state = [];
            const keys = Object.keys(d);
            const possible = [];
            const matchings = [];

            for (const key of keys) {
              const value = d[key];
              if (value === 1) possible.push(key);
            }

            if (possible.length > 1 && possible.length % 2 === 0) {
              for (let i = 0; i < possible.length; i += 2) {
                const matching = [];
                const e1 = possible[i];
                const e2 = possible[i + 1];
                matching.push(parseInt(e1, 10), parseInt(e2, 10));
                matchings.push(matching);
              }
              state.push(d, matchings);
              table.set(state, true);
            } else {
              state.push(d, []);
              table.set(state, false);
            }
          } */
