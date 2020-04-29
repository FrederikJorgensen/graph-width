import * as graph from './graphFactory.js';

let treeSvg;
let niceTreeNode;
let niceTreeLink;
let niceTreeLabel;
let root;

const a = 97;
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);


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
  treeLayout.size([width - 20, height - 20]);
  treeLayout(root);

  niceTreeLink = treeSvg
    .append('g')
    .selectAll('line.link')
    .data(root.links())
    .enter()
    .append('line')
    .classed('link', true)
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
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.label)
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('transform', `translate(${0}, ${40})`);

  /*   niceTreeLink = treeSvg
    .append('g')
    .selectAll('line')
    .data(links)
    .join('line');

  niceTreeNode = treeSvg
    .append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 18)
    .attr('class', 'niceTreeDecompositionNode')
    .attr('fill', '#1a7532')
    .attr('id', (d) => `node-${d.data.id}`)
    .call(drag(simulation)); */
  /*
  niceTreeLabel = treeSvg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.label); */

  // niceTreeNode.on('mouseover', graph.createSubGraph);
  // niceTreeNode.on('mouseout', graph.resetHighlight);
  // niceTreeNode.on('click', highlightSubTrees);
  // niceTreeNode.on('dblclick', resetTreeHighlight);

/*   simulation.on('tick', () => {
    const ky = 0.5 * simulation.alpha();

    links.forEach((d) => {
      d.target.y += ((d.target.depth) * 100 - d.target.y) * ky;
    });

    niceTreeLink
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    niceTreeNode.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    niceTreeLabel.attr('x', (d) => d.x).attr('y', (d) => d.y);
  }); */
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

let animX = 0;

function mergeUnique(arr1, arr2) {
  return arr1.concat(arr2.filter((item) => arr1.indexOf(item) === -1));
}


export function threeColor(root) {
  console.log(root.data.id);
  const rootId = root.data.id;
  const cops = root.copy().sum((currentNode) => {
    setTimeout(() => {
      if (currentNode.id === root.data.id) {
        console.log('you have reached the root!');
        d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        return;
      }

      if (currentNode.vertices.length === 0) {
        console.log("This node is empty, so it's always true!");
        d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        currentNode.colorable = true;
        return;
      }

      if ('children' in currentNode === false) {
        console.log('This is a leaf they are always true!');
        d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        currentNode.colorable = true;
        return;
      }

      if (currentNode.children.length === 2) {
        const child1 = currentNode.children[0];
        const child2 = currentNode.children[1];
        if (child1.colorable && child2.colorable) {
          console.log('Since both children are colorable this JOIN node is also colorable.');
          currentNode.colorable = true;
          d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        } else {
          d3.select(`#node-${currentNode.id}`).style('fill', 'red').transition().duration(1000);
        }
      }

      if (currentNode.vertices.length < currentNode.children[0].vertices.length) {
        console.log('This is a forget node. We must extend the vertices of this node to the child node and if a K-coloring exists then this node is colorable.');
        const forgetNodeVertices = currentNode.vertices;
        const childsVertices = currentNode.children[0].vertices;
        const mergedVertices = mergeUnique(childsVertices, forgetNodeVertices);
        const tempNode = { ...currentNode };
        tempNode.vertices = mergedVertices;
        currentNode.colorable = graph.createSubGraph(tempNode);
        if (currentNode.colorable) {
          d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        } else {
          d3.select(`#node-${currentNode.id}`).style('fill', 'red').transition().duration(1000);
        }
      }

      if (currentNode.vertices.length > currentNode.children[0].vertices.length) {
        console.log('This is an introduce node.');
        const introduceNodeVertices = currentNode.vertices;
        const childsVertices = currentNode.children[0].vertices;
        const mergedVertices = mergeUnique(introduceNodeVertices, childsVertices);
        const tempNode = { ...currentNode };
        tempNode.vertices = mergedVertices;
        currentNode.colorable = graph.createSubGraph(tempNode);
        if (currentNode.colorable) {
          d3.select(`#node-${currentNode.id}`).style('fill', 'green').transition().duration(1000);
        } else {
          d3.select(`#node-${currentNode.id}`).style('fill', 'red').transition().duration(1000);
        }
      }
    }, animX * 500);
    animX++;
  });
}

export function runThreeColor() {
  threeColor(root);
}
