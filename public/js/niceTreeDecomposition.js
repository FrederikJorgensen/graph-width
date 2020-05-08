/* eslint-disable no-restricted-syntax */
import * as graph from './graph.js';

let treeSvg;
let niceTreeNode;
let niceTreeLink;
let niceTreeLabel;
let root;
let animX = 0;
const animationDuration = 1000;

function resetTreeHighlight() {
  niceTreeNode.attr('opacity', 1);
  niceTreeLabel.attr('opacity', 1);
  niceTreeLink.attr('opacity', 1);
}

function highlightSubTrees(d) {
  const descendants = d.descendants();
  const des = [];

  const desLinks = d.links();
  const wat = [];

  desLinks.forEach((currentLink) => {
    wat.push(currentLink.source.data, currentLink.target.data);
  });

  descendants.forEach((currentNode) => {
    des.push(currentNode.data.id);
  });

  niceTreeNode.attr('opacity', (currentNode) => {
    if (des.includes(currentNode.data.id)) return 1;
    return 0;
  });

  niceTreeLabel.attr('opacity', (currentNode) => {
    if (des.includes(currentNode.data.id)) return 1;
    return 0;
  });

  niceTreeLink.attr('opacity', (currentLink) => {
    if (wat.includes(currentLink.source.data)) return 1;
    return 0;
  });
}

export default function loadNiceTreeDecomposition(treeData) {
  const width = document.getElementById('nice-td-container').offsetWidth;
  const height = document.getElementById('nice-td-container').offsetHeight;

  treeSvg = d3.select('#nice-td-container').append('svg').attr('viewBox', [0, 0, width, height]);

  root = d3.hierarchy(treeData);
  const treeLayout = d3.tree();
  treeLayout.size([width / 2, height - 200]);
  treeLayout(root);

  const rootId = root.data.id;

  niceTreeLink = treeSvg
    .append('g')
    .selectAll('line')
    .data(root.links())
    .enter()
    .append('line')
    .attr('class', 'niceTreeLink')
    // .attr('id', (d) => `parent-link-${d.source.data.id}`)
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y)
    .attr('transform', `translate(${0}, ${40})`);

  // Nodes
  niceTreeNode = treeSvg
    .append('g')
    .selectAll('circle.node')
    .data(root.descendants())
    .enter()
    .append('circle')
    .attr('class', 'niceTreeDecompositionNode')
    .style('fill', (d) => {
      if (d.data.id === rootId) return 'orange';
      if ('children' in d.data === false) return 'black';
      if (d.data.children.length === 2) return 'blue';
      if (d.data.vertices.length > d.data.children[0].vertices.length) return 'green';
      if (d.data.vertices.length < d.data.children[0].vertices.length) return 'red';
    })
    .attr('id', (d) => `node-${d.data.id}`)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => (d.data.vertices.length * 2) + 17)
    .attr('transform', `translate(${0}, ${40})`);

  niceTreeLabel = treeSvg
    .append('g')
    .selectAll('text')
    .data(root.descendants())
    .enter()
    .append('text')
    .attr('dy', '-.5em')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.label.split(' ').slice(0, 2).toString().replace(',', ' '))
    .attr('word-spacing', 10)
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('transform', `translate(${0}, ${40})`);

  niceTreeLabel = treeSvg
    .append('g')
    .selectAll('text')
    .data(root.descendants())
    .enter()
    .append('text')
    .attr('dy', '1.5em')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.label.split(' ').slice(2).toString().replace(/,\s*$/, ''))
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('transform', `translate(${0}, ${40})`);
}

function visitElement(element, animX) {
  d3.select(`#node-${element.id}`)
    .transition().duration(1000).delay(1000 * animX)
    .style('fill', 'red');
}

export function bfs() {
  const queue = [];
  queue.push(newRoot);
  let animX = 0;
  while (queue.length !== 0) {
    const element = queue.shift();
    visitElement(element, animX);
    animX += 1;
    if (element.children !== undefined) {
      for (let i = 0; i < element.children.length; i++) {
        queue.push(element.children[i]);
      }
    }
  }
}

function mergeUnique(arr1, arr2) {
  return arr1.concat(arr2.filter((item) => arr1.indexOf(item) === -1));
}

export function threeColor(root) {
  const rootId = root.data.id;
  root.copy().sum((currentNode) => {
    setTimeout(() => {
      if (currentNode.id === root.data.id) {
        if (currentNode.children[0].colorable) {
          d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
          return;
        }
        d3.select(`#node-${currentNode.id}`).style('fill', 'red').transition().duration(1000);
        return;
      }

      /*       if (currentNode.vertices.length === 0) {
        d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        currentNode.colorable = true;
        return;
      } */

      if ('children' in currentNode === false) {
        d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        currentNode.summedVertices = [];
        currentNode.states = new Set();
        currentNode.add({});

        const startState = [0, 0, 0];
        return;
      }

      if (currentNode.children.length === 2) {
        const child1 = currentNode.children[0];
        const child2 = currentNode.children[1];
        if (child1.colorable && child2.colorable) {
          currentNode.colorable = true;
          d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        } else {
          d3.select(`#node-${currentNode.id}`).style('fill', 'red').transition().duration(1000);
        }
      }

      if (currentNode.vertices.length < currentNode.children[0].vertices.length) {
        const difference = currentNode.children[0].vertices.filter((x) => !currentNode.vertices.includes(x));
        const forgottenVertex = difference[0];
        const child = currentNode.children[0];
        const news = JSON.parse(JSON.stringify(child));
        const newArray = news.summedVertices.filter((x) => x !== forgottenVertex);
        currentNode.summedVertices = newArray;

        if (currentNode.colorable && currentNode.children[0].colorable) {
          d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        } else {
          d3.select(`#node-${currentNode.id}`).style('fill', 'red').transition().duration(1000);
        }
      }

      if (currentNode.vertices.length > currentNode.children[0].vertices.length) {
        const difference = currentNode.vertices.filter((x) => !currentNode.children[0].vertices.includes(x));
        const introducedVertex = difference[0];
        const child = currentNode.children[0];
        const news = JSON.parse(JSON.stringify(child));
        currentNode.summedVertices = news.summedVertices;
        if (!currentNode.summedVertices.includes(introducedVertex)) currentNode.summedVertices.push(introducedVertex);

        for (let i = 0; i < currentNode.children[0].states.length; i++) {
          const newObj = {};
          for (let color = 1; color <= 3; color++) {
            newObj[introducedVertex] = color;
          }
        }
        currentNode.summedVertices.sort();

        if (currentNode.colorable && currentNode.children[0].colorable) {
          d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        } else {
          d3.select(`#node-${currentNode.id}`).style('fill', 'red').transition().duration(1000);
        }
      }
    }, animX * 1000);
    animX++;
  });
}

export function runThreeColor() {
  threeColor(root);
}

function getSubTree(root, currentNode) {
  let subTree;
  root.each((d) => {
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

function animateNode(nodeToAnimate, animationDelay) {
  const descendants = nodeToAnimate.descendants();

  const descendantsIds = [];

  descendants.forEach((currentNode) => {
    descendantsIds.push(currentNode.data.id);
  });
  niceTreeNode
    .transition()
    .style('stroke', (currentNode) => {
      if (descendantsIds.includes(currentNode.data.id)) return 'orange';
      return 'black';
    });
}

function animateLink(node) {
  const desLinks = node.links();
  const wat = [];

  desLinks.forEach((currentLink) => {
    wat.push(currentLink.source.data, currentLink.target.data);
  });

  niceTreeLink.style('stroke', (currentLink) => {
    if (wat.includes(currentLink.source.data)) return 'orange';
    return 'black';
  });
}

export function mis() {
  root.copy().eachAfter((currentNode) => {
    setTimeout(() => {
    // Initiliaze table for this node
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
          const currentNodeValue = graph.runMis(subTree, set);
          const child1value = child1Table[set];
          const child2value = child2Table[set];
          currentNode.data.table[set] = child1value + child2value - currentNodeValue;
        }
      }

      // Forget node
      if (currentNode.data.vertices.length < currentNode.data.children[0].vertices.length) {
      // Get the forgotten vertex
        const forgottenVertex = currentNode.data.children[0].vertices.filter((x) => !currentNode.data.vertices.includes(x));


        for (const set of allSubsets) {
          const setWithV = JSON.parse(JSON.stringify(set));
          setWithV.push(forgottenVertex);
          currentNode.data.table[set] = Math.max(graph.runMis(subTree, set), graph.runMis(subTree, setWithV));
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
        const difference = currentNode.data.vertices.filter((x) => !currentNode.data.children[0].vertices.includes(x));
        const introducedVertex = difference[0];


        for (const set of allSubsets) {
        // Only run MIS if the introduced vertex is in the current set
          if (set.includes(introducedVertex)) {
            const mis = graph.runMis(subTree, set, introducedVertex);

            if (currentNode.data.table[set]) {
              currentNode.data.table[set]++;
            } else {
              currentNode.data.table[set] = mis;
            }
          }
        }
      }

      const keys = Object.keys(currentNode.data.table);
      const values = Object.values(currentNode.data.table);
      let sb = '';

      keys.forEach((key, index) => {
        if (key === '') key = 'Ø';
        const value = values[index];
        sb += `<tr><td>${key}</td><td>${value}</td></tr>`;
      });

      const tbody = document.getElementById('tbody');
      tbody.innerHTML = sb;


    /*       const outputText = document.getElementById('output-text');
      outputText.innerHTML = JSON.stringify(currentNode.table, null, '\t').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;').replace('{', '')
        .replace('}', ''); */
    }, animX * 800);
    animX++;
  });
}
