/* eslint-disable no-restricted-syntax */
import * as graph from './graph.js';

let treeSvg;
let root;
let animX = 0;
let isMis = false;
let isColor = false;
let current = 0;

const colorsNodes = d3.scaleOrdinal(d3.schemeCategory10).domain(['foo', 'bar', 'baz', 'foobar']);

const tooltip = d3.select('#nice-td-container')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);


export default function loadNiceTreeDecomposition(treeData) {
  const niceTdWidth = document.getElementById('nice-td-container').offsetWidth;
  const niceTdHeight = document.getElementById('nice-td-container').offsetHeight;

  treeSvg = d3.select('#nice-td-svg').attr('width', niceTdWidth).attr('height', niceTdHeight);
  // .attr('viewBox', [0, 0, niceTdWidth, niceTdHeight]);

  root = d3.hierarchy(treeData);
  const treeLayout = d3.tree();
  treeLayout.size([niceTdWidth, niceTdHeight - 100]);
  treeLayout(root);

  treeSvg
    .append('g')
    .selectAll('line')
    .data(root.links())
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y)
    .attr('transform', `translate(${0}, ${40})`);

  let nodeSvg = treeSvg
    .append('g')
    .selectAll('ellipse');

  nodeSvg = nodeSvg
    .data(root.descendants());

  const g = nodeSvg
    .enter()
    .append('g')
    .on('mouseover', function (d) {
      graph.showSeperator(d.data.vertices);
      d3.select(this).select('circle').classed('highlighted-node', true);
      d3.select(this).select('text').classed('highlighted-text', true);
    })
    .on('mouseleave', function (d) {
      graph.hideSeperator();
      d3.select(this).select('circle').classed('highlighted-node', false);
      d3.select(this).select('text').classed('highlighted-text', false);
    });

  g
    .append('ellipse')
    .style('fill', (d) => {
      if (d.depth === 0) return 'yellow';
      if ('children' in d === false) return d3.rgb(colorsNodes(1));
      if (d.data.children.length === 2) return d3.rgb(colorsNodes('foobar'));
      if (d.data.vertices.length > d.data.children[0].vertices.length) return d3.rgb(colorsNodes('baz'));
      if (d.data.vertices.length < d.data.children[0].vertices.length) return d3.rgb(colorsNodes(4));
      // if (d.data.vertices > d.data.children[0]) return 'red';
    })
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('rx', (d) => 17 + (d.data.vertices.length * 3))
    .attr('ry', (d) => 17)
    .attr('id', (d) => `nice-tree-node-${d.data.id}`)
    .attr('class', 'node')
    // .attr('cx', (d) => d.x)
    // .attr('cy', (d) => d.y)
    // .attr('r', 20)
    .attr('transform', `translate(${0}, ${40})`);

  g
    .append('text')
    .attr('dy', '.2em')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.label)
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('transform', `translate(${0}, ${40})`);
}

function getSubTree(rootOfSubtree, currentNode) {
  let subTree;
  rootOfSubtree.each((d) => {
    if (d.data.id === currentNode.id) subTree = d.descendants();
  });
  return subTree;
}

const getAllSubsets = (theArray) => theArray.reduce(
  (subsets, value) => subsets.concat(
    subsets.map((set) => [value, ...set]),
  ),
  [[]],
);

function animateNode(nodeToAnimate) {
  const descendants = nodeToAnimate.descendants();

  const descendantsIds = [];

  descendants.forEach((currentNode) => {
    descendantsIds.push(currentNode.data.id);
  });

  d3.select('#nice-td-svg').selectAll('ellipse').classed('highlighted-node', (currentNode) => {
    if (descendantsIds.includes(currentNode.data.id)) return true;
    return false;
  });

  d3.select('#nice-td-svg').selectAll('g').select('text').classed('highlighted-text', (currentNode) => {
    if (descendantsIds.includes(currentNode.data.id)) return true;
    return false;
  });
}

function animateLink(node) {
  const desLinks = node.links();
  const wat = [];

  desLinks.forEach((currentLink) => {
    wat.push(currentLink.source.data, currentLink.target.data);
  });

  d3.selectAll('#nice-td-svg line').classed('highlighted-link', (link) => {
    if (wat.includes(link.source.data)) return 'orange';
  });
}

let currentSubTree;

export function mis() {
  isColor = false;
  isMis = true;
  animX = 0;
  let i = 0;
  root.copy().eachAfter((currentNode) => {
    i++;
    if (current !== i) return;

    currentNode.data.table = {};

    animateNode(currentNode);
    animateLink(currentNode);

    // Get all the subsets of the current vertices in this tree node
    const allSubsets = getAllSubsets(currentNode.data.vertices);

    // Get the subtree rooted at this node
    const subTree = getSubTree(root, currentNode.data);

    currentSubTree = subTree;

    // Leaf node
    if ('children' in currentNode.data === false) {
      currentNode.data.table = {};
      if (currentNode.data.vertices.length === 0) {
        currentNode.data.table[''] = 0;
      } else {
        const vertex = currentNode.data.vertices[0];
        currentNode.data.table[vertex] = 1;
      }
      d3.select('#tooltip').style('opacity', 0);
      return;
    }

    // Join node
    if (currentNode.data.children.length === 2) {
      // Get child 1's table
      const child1 = currentNode.data.children[0];
      const child1Clone = JSON.parse(JSON.stringify(child1));
      const child1Table = child1Clone.table;

      // Get child 2's table
      const child2 = currentNode.data.children[1];
      const child2Clone = JSON.parse(JSON.stringify(child2));
      const child2Table = child2Clone.table;

      for (const set of allSubsets) {
        const currentNodeValue = graph.runMis(subTree, set);
        const child1value = child1Table[set];
        const child2value = child2Table[set];
        currentNode.data.table[set] = child1value + child2value - currentNodeValue;
      }
    }

    // Forget node
    if (currentNode.data.vertices.length < currentNode.data.children[0].vertices.length) {
      const childsVertices = currentNode.data.children[0].vertices;
      const forgottenVertex = childsVertices
        .filter((x) => !currentNode.data.vertices.includes(x));

      for (const set of allSubsets) {
        const setWithV = JSON.parse(JSON.stringify(set));
        setWithV.push(forgottenVertex);
        const setWithoutV = graph.runMis(subTree, set);
        const algoWithV = graph.runMis(subTree, setWithV);
        currentNode.data.table[set] = Math.max(setWithoutV, algoWithV);
      }
    }

    // Introduce node
    if (currentNode.data.vertices.length > currentNode.data.children[0].vertices.length) {
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


      for (const set of allSubsets) {
        // Only run MIS if the introduced vertex is in the current set
        if (set.includes(introducedVertex)) {
          const maxSet = graph.runMis(subTree, set, introducedVertex);

          if (currentNode.data.table[set]) {
            currentNode.data.table[set]++;
          } else {
            currentNode.data.table[set] = maxSet;
          }
        }
      }
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
      if (key === '') key = '∅';
      let value = values[index];
      if (value < -1000) value = '-∞';
      sb += `<tr id=${key} class="mis-row"><td class="sets">{${key}}</td><td>${value}</td></tr>`;
    });

    const neww = document.getElementById(`nice-tree-node-${currentNode.data.id}`).getBoundingClientRect().top;
    const new2 = document.getElementById(`nice-tree-node-${currentNode.data.id}`).getBoundingClientRect().left;

    const start = `<table><tbody id="tbody">${sb}</tbody></table>`;
    tooltip.transition()
      .duration(300)
      .style('opacity', 1);
    tooltip.html(start)
      .style('left', `${new2 - 100}px`)
      .style('top', `${neww}px`);

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = sb;
    d3.selectAll('.sets').on('mouseover', () => {
      highlightMaxSet(d3.event.target.innerText);
    });
    d3.selectAll('.sets').on('mouseleave', () => {
      d3.selectAll('circle').classed('highlighted-stroke', false);
    });
  });
}

function highlightMaxSet(setToHighlight) {
  let sb = '';
  sb += setToHighlight.replace('{', '').replace('}', '');
  if (sb === 'Ø') return;
  sb = `[${sb}]`;
  const set = JSON.parse(sb);
  graph.runMis(currentSubTree, set, 0, true);
}

function isArrayInArray(arr, item) {
  const item_as_string = JSON.stringify(item);

  const contains = arr.some((ele) => JSON.stringify(ele) === item_as_string);
  return contains;
}

const colors = ['red', 'green', 'blue'];

export function threeColor() {
  isMis = false;
  isColor = true;
  let i = 1;
  root.copy().eachAfter((currentNode) => {
    if (current !== i++) return;

    animateNode(currentNode);

    const node = currentNode.data;

    if ('children' in node === false) {
      node.pos = [];
      return;
    }

    const child = node.children[0];
    const subTree = getSubTree(root, currentNode.data);
    graph.newSubGraph(subTree);

    if (node.vertices.length > child.vertices.length) {
      const childClone = JSON.parse(JSON.stringify(child));
      const childsStates = childClone.states;
      const difference = node.vertices.filter((x) => !child.vertices.includes(x));
      const introducedVertex = difference[0];
      const newStates = [];

      if (child.vertices.length === 0) {
        for (const color of colors) {
          const newState = [];
          newState.push(color);
          newStates.push(newState);
        }
        const x = node.vertices[0];
        node.pos = childClone.pos;
        if (!node.pos.includes(introducedVertex)) node.pos.push(x);
        node.states = newStates;
      } else {
        for (const childState of childsStates) {
          for (const color of colors) {
            const newState = JSON.parse(JSON.stringify(childState));
            newState.push(color);
            if (graph.checkIntroducedVertex(introducedVertex, newState, subTree)) {
              newStates.push(newState);
            }
          }
        }
        node.states = newStates;
        node.pos = childClone.pos;
        if (!node.pos.includes(introducedVertex)) node.pos.push(introducedVertex);
      }
    }

    if (node.vertices.length < child.vertices.length) {
      const childClone = JSON.parse(JSON.stringify(child));
      const childStates = childClone.states;

      node.pos = childClone.pos;
      const forgottenVertex = child.vertices.filter((x) => !node.vertices.includes(x));
      if (node.pos.includes(parseInt(forgottenVertex, 10))) node.pos = node.pos.filter((x) => x !== parseInt(forgottenVertex, 10));


      for (const childState of childStates) {
        childState.pop();
      }

      for (let i = 0; i < childStates.length; i++) {
        const array1 = childStates[i];
        for (let j = 0; j < childStates.length; j++) {
          const array2 = childStates[j];
          if (JSON.stringify(array1) === JSON.stringify(array2)) childStates.splice(i, 1);
        }
      }
      node.states = childStates;
    }

    if (node.children.length === 2) {
      const child1 = node.children[0];
      const child1Clone = JSON.parse(JSON.stringify(child1));
      const child1States = child1Clone.states;

      const child2 = node.children[1];
      const child2Clone = JSON.parse(JSON.stringify(child2));
      const child2States = child2Clone.states;
      const newStates = [];

      if (child1States.length < child2States.length) {
        node.pos = child1.pos;
        for (const childState of child1States) {
          if (isArrayInArray(child2States, childState)) newStates.push(childState);
        }
      } else {
        node.pos = child2.pos;
        for (const childState of child2States) {
          if (isArrayInArray(child1States, childState)) newStates.push(childState);
        }
      }
      node.states = newStates;
    }


    let sb = '';
    sb += '<tr>';
    for (let i = 0; i < node.pos.length; i++) {
      sb += `<td><strong>${node.pos[i]}</strong></td>`;
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

    const tbody = document.getElementById('three-color-body');

    tbody.innerHTML = sb;
  });
}

function increment() {
  const N = root.descendants().length;

  if (isMis) {
    current++;
    if (current !== N) current %= N;
    mis();
    return;
  }

  if (isColor) {
    current++;
    if (current !== N) current %= N;
    threeColor();
  }
}

function decrement() {
  const N = root.descendants().length;

  if (isMis) {
    mis((current = --current % N));
    return;
  }

  if (isColor) {
    threeColor((current = --current % N));
  }
}

d3.select(document.body).on('keyup', () => {
  if (d3.event.key === 'ArrowRight') {
    increment();
  } else if (d3.event.key === 'ArrowLeft') {
    decrement();
  }
});


d3.select('#left-control-key').on('click', decrement);
d3.select('#right-control-key').on('click', increment);

function reset() {
  current = 0;
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('text').classed('highlighted-text', false);
  d3.selectAll('line').classed('highlighted-link', false);
  d3.selectAll('tr').on('click', () => alert('yep'));
}

// document.getElementById('max-independent-set-button').addEventListener('click', reset);
// document.getElementById('three-color-button').addEventListener('click', reset);
