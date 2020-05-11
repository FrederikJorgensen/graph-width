/* eslint-disable no-restricted-syntax */
import * as dg from './drawGraph.js';

let treeSvg;
let niceTreeLink;
let root;
let animX = 0;

export default function loadNiceTreeDecomposition(treeData) {
  const width = document.getElementById('nice-td-container').offsetWidth;
  const height = document.getElementById('nice-td-container').offsetHeight;

  treeSvg = d3.select('#nice-td-svg').attr('viewBox', [0, 0, width, height]);

  root = d3.hierarchy(treeData);
  const treeLayout = d3.tree();
  treeLayout.size([width, height - 100]);
  treeLayout(root);

  niceTreeLink = treeSvg
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
    .selectAll('circle');


  nodeSvg = nodeSvg
    .data(root.descendants());

  const g = nodeSvg
    .enter()
    .append('g')
    .on('mouseover', function (d) {
      if (d3.select(this).select('text').classed('highlighted-text')) return;
      d3.select(this).select('text').classed('highlighted-text', true);
    })
    .on('mouseleave', function (d) {
      d3.select(this).select('text').classed('highlighted-text', false);
    });

  g
    .append('circle')
    .attr('class', 'node')
    .attr('id', (d) => `node-${d.data.id}`)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', 20)
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

  d3.select('#nice-td-svg').selectAll('circle').classed('highlighted-node', (currentNode) => {
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

let current = 0;

export function mis(currentId) {
  animX = 0;
  let i = 0;
  root.copy().eachAfter((currentNode) => {
    i++;
    if (currentId !== i) return;

    currentNode.data.table = {};

    animateNode(currentNode);
    animateLink(currentNode);

    // Get all the subsets of the current vertices in this tree node
    const allSubsets = getAllSubsets(currentNode.data.vertices);

    // Get the subtree rooted at this node
    const subTree = getSubTree(root, currentNode.data);

    // Leaf node
    if ('children' in currentNode.data === false) {
      currentNode.data.table = {};
      if (currentNode.data.vertices.length === 0) {
        currentNode.data.table[''] = 0;
      } else {
        const vertex = currentNode.data.vertices[0];
        currentNode.data.table[vertex] = 1;
      }
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
        const currentNodeValue = dg.runMis(subTree, set);
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
        const setWithoutV = dg.runMis(subTree, set);
        const algoWithV = dg.runMis(subTree, setWithV);
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
          const maxSet = dg.runMis(subTree, set, introducedVertex);

          if (currentNode.data.table[set]) {
            currentNode.data.table[set]++;
          } else {
            currentNode.data.table[set] = maxSet;
          }
        }
      }
    }

    console.log(currentNode.data.id);

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
      sb += `<tr><td>{${key}}</td><td>${value}</td></tr>`;
    });

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = sb;
  });
}


function increment() {
  const N = root.descendants().length;
  mis((current = ++current % N));
}

function decrement() {
  const N = root.descendants().length;
  mis((current = --current % N));
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
