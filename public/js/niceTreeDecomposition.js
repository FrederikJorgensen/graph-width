import * as graph from './graphFactory.js';

let treeSvg;
let niceTreeNode;
let niceTreeLink;
let niceTreeLabel;
let root;
let newRoot;

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
  newRoot = treeData;
  const width = document.getElementById('nice-td-container').offsetWidth;
  const height = document.getElementById('nice-td-container').offsetHeight;

  treeSvg = d3.select('#nice-td-svg').attr('width', width).attr('height', height);
  // .attr('viewBox', [-width / 2, -height / 2, width, height]);

  const drag = (simulation) => {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  root = d3.hierarchy(treeData);
  const links = root.links();
  const nodes = root.descendants();


  const simulation = d3
    .forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(20).strength(1))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('y', d3.forceY(300))
    .force('x', d3.forceX(width / 2));
  // .force('y', d3.forceY(-400).strength(0.9));

  niceTreeLink = treeSvg
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
    .call(drag(simulation));

  niceTreeLabel = treeSvg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.label);

  niceTreeNode.on('mouseover', graph.highlightNodes);
  niceTreeNode.on('mouseout', graph.resetHighlight);
  niceTreeNode.on('click', highlightSubTrees);
  niceTreeNode.on('dblclick', resetTreeHighlight);

  simulation.on('tick', () => {
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
  });
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
  console.log(newRoot);
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
