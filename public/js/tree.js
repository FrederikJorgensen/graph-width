import * as graph from './graph.js';

let treeSvg;
let treeNode;
let treeLink;
let treeLabel;

const isLetterGraph = false;

const a = 97;
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);


function resetTreeHighlight() {
  treeNode.attr('opacity', 1);
  treeLink.attr('opacity', 1);
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

  treeNode.attr('opacity', (currentNode) => {
    if (des.includes(currentNode.data.id)) return 1;
    return 0;
  });

  treeLink.attr('opacity', (currentLink) => {
    if (wat.includes(currentLink.source.data)) return 1;
    return 0;
  });
}

/* eslint-disable no-param-reassign */
function drawTree(tree) {
  const width = document.getElementById('tree-container').offsetWidth;
  const height = document.getElementById('tree-container').offsetHeight;

  treeSvg = d3.select('#tree');

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

  const root = d3.hierarchy(tree);
  const links = root.links();
  const nodes = root.descendants();

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(0.5)
        .strength(0.5),
    )
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  treeSvg = d3
    .selectAll('#tree')
    .attr('viewBox', [-width / 2, -height / 2, width, height]);

  treeLink = treeSvg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line');

  treeNode = treeSvg
    .append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    // .attr('c', (d) => 10 *d.data.vertices.length)
    .attr('r', (d) => 10 * d.data.vertices.length)
    .attr('fill', '#1a7532')
    .call(drag(simulation));

  treeLabel = treeSvg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.name);

  treeNode.on('mouseover', graph.highlightNodes);
  treeNode.on('mouseout', graph.resetHighlight);
  treeNode.on('click', highlightSubTrees);
  treeNode.on('dblclick', resetTreeHighlight);

  simulation.on('tick', () => {
    const ky = 1.2 * simulation.alpha();
    links.forEach((d) => {
      d.target.y += (d.target.depth * 120 - d.target.y) * ky;
    });

    treeLink
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    treeNode.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    treeLabel.attr('x', (d) => d.x).attr('y', (d) => d.y);
  });
}

function removeExistingTree() {
  if (treeNode && treeLink && treeLabel) {
    treeNode.remove();
    treeLink.remove();
    treeLabel.remove();
  }
}

function buildTree(nodes) {
  const nodeById = {};

  nodes.forEach((d) => {
    nodeById[d.id] = d;
  });

  nodes.forEach((d) => {
    if ('parent' in d) {
      const parent = nodeById[d.parent];
      if (parent !== undefined) {
        if (parent.children) parent.children.push(d);
        else parent.children = [d];
      }
    }
  });
  return nodes[0];
}

function readTreeInput(input) {
  const lines = input;
  lines.splice(0, 3);
  lines.pop();
  const treeBags = [];
  const forTree = [];
  let isFirstRound = true;

  function findTreeBagLabel(nodeId) {
    for (let i = 0; i < treeBags.length; i++) {
      if (treeBags[i].bagId === nodeId) return treeBags[i].bagLabel;
    }
    return 'NO NAME';
  }

  function getNodeById(nodeId) {
    for (let i = 0; i < forTree.length; i++) {
      if (forTree[i].id === nodeId) return forTree[i];
    }
    return null;
  }

  function setRootNode(node, vertices) {
    forTree.forEach((obj) => {
      if (obj.id === node) {
        obj.id = node;
        obj.name = findTreeBagLabel(node);
        obj.vertices = vertices;
        obj.hasParent = true;
      }
    });
  }

  function setChildOfRootNode(sourceNode, targetNode, vertices) {
    forTree.forEach((obj) => {
      if (obj.id === targetNode) {
        obj.id = targetNode;
        obj.name = findTreeBagLabel(targetNode);
        obj.parent = sourceNode;
        obj.vertices = vertices;
        obj.hasParent = true;
      }
    });
  }

  function setSourceNodeAsChild(sourceNode, targetNode, vertices) {
    forTree.forEach((obj) => {
      if (obj.id === sourceNode) {
        obj.id = sourceNode;
        obj.name = findTreeBagLabel(sourceNode);
        obj.parent = targetNode;
        obj.vertices = vertices;
        obj.hasParent = true;
      }
    });
  }

  function setTargetNodeAsChild(sourceNode, targetNode, vertices) {
    forTree.forEach((obj) => {
      if (obj.id === targetNode) {
        obj.id = targetNode;
        obj.name = findTreeBagLabel(targetNode);
        obj.parent = sourceNode;
        obj.vertices = vertices;
        obj.hasParent = true;
      }
    });
  }

  function nodeHasParent(nodeId) {
    const node = getNodeById(nodeId);
    return node.hasParent;
  }

  function getVertices(nodeId) {
    const node = getNodeById(nodeId);
    return node.vertices;
  }

  for (let line = 0; line < lines.length; line++) {
    const textLine = lines[line];
    let bagId;
    let firstNode;
    let secondNode;
    let thirdNode;
    let fourthNode;
    let fifthNode;
    let sixthNode;
    let seventhNode;
    let eighthNode;
    let ninthNode;
    let bagLabel = '';

    let firstNodeLabel;
    let secondNodeLabel;
    let thirdNodeLabel;
    let fourthNodeLabel;
    let fifthNodeLabel;
    let sixthNodeLabel;
    let seventhNodeLabel;
    let eighthNodeLabel;
    let ninthNodeLabel;


    if (textLine.startsWith('b')) {
      const splitted = textLine.split(' ');
      const vertices = [];
      const numberOfNodes = splitted.length - 2;
      bagId = parseInt(splitted[1], 10);


      if (isLetterGraph) {
        firstNodeLabel = charArray2[parseInt(splitted[2], 10)];
        secondNodeLabel = charArray2[parseInt(splitted[3], 10)];
        thirdNodeLabel = charArray2[parseInt(splitted[4], 10)];
        fourthNodeLabel = charArray2[parseInt(splitted[5], 10)];
        fifthNodeLabel = charArray2[parseInt(splitted[6], 10)];
        sixthNodeLabel = charArray2[parseInt(splitted[7], 10)];
        seventhNodeLabel = charArray2[parseInt(splitted[8], 10)];
        eighthNodeLabel = charArray2[parseInt(splitted[9], 10)];
        ninthNodeLabel = charArray2[parseInt(splitted[10], 10)];
      } else {
        firstNodeLabel = splitted[2];
        secondNodeLabel = splitted[3];
        thirdNodeLabel = splitted[4];
        fourthNodeLabel = splitted[5];
        fifthNodeLabel = splitted[6];
        sixthNodeLabel = splitted[7];
        seventhNodeLabel = splitted[8];
        eighthNodeLabel = splitted[9];
        ninthNodeLabel = splitted[10];
      }


      firstNode = parseInt(splitted[2], 10);
      secondNode = parseInt(splitted[3], 10);
      thirdNode = parseInt(splitted[4], 10);
      fourthNode = parseInt(splitted[5], 10);
      fifthNode = parseInt(splitted[6], 10);
      sixthNode = parseInt(splitted[7], 10);
      seventhNode = parseInt(splitted[8], 10);
      eighthNode = parseInt(splitted[9], 10);
      ninthNode = parseInt(splitted[10], 10);


      if (numberOfNodes === 1) {
        bagLabel += firstNodeLabel;
        vertices.push(firstNode);
      }

      if (numberOfNodes === 2) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += secondNodeLabel;
        vertices.push(firstNode, secondNode);
      }

      if (numberOfNodes === 3) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += `${secondNodeLabel}, `;
        bagLabel += thirdNodeLabel;
        vertices.push(firstNode, secondNode, thirdNode);
      }

      if (numberOfNodes === 4) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += `${secondNodeLabel}, `;
        bagLabel += `${thirdNodeLabel}, `;
        bagLabel += fourthNode;
        vertices.push(firstNode, secondNode, thirdNode, fourthNode);
      }

      if (numberOfNodes === 5) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += `${secondNodeLabel}, `;
        bagLabel += `${thirdNodeLabel}, `;
        bagLabel += `${fourthNodeLabel}, `;
        bagLabel += fifthNodeLabel;
        vertices.push(firstNode, secondNode, thirdNode, fourthNode, fifthNode);
      }

      if (numberOfNodes === 6) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += `${secondNodeLabel}, `;
        bagLabel += `${thirdNodeLabel}, `;
        bagLabel += `${fourthNodeLabel}, `;
        bagLabel += `${fifthNodeLabel}, `;
        bagLabel += sixthNodeLabel;
        bagLabel += fifthNodeLabel;
        vertices.push(firstNode, secondNode, thirdNode, fourthNode, fifthNode, sixthNode);
      }

      if (numberOfNodes === 7) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += `${secondNodeLabel}, `;
        bagLabel += `${thirdNodeLabel}, `;
        bagLabel += `${fourthNodeLabel}, `;
        bagLabel += `${fifthNodeLabel}, `;
        bagLabel += `${sixthNodeLabel}, `;
        bagLabel += seventhNodeLabel;
        bagLabel += fifthNodeLabel;
        vertices.push(firstNode, secondNode, thirdNode,
          fourthNode, fifthNode, sixthNode, seventhNode);
      }

      if (numberOfNodes === 8) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += `${secondNodeLabel}, `;
        bagLabel += `${thirdNodeLabel}, `;
        bagLabel += `${fourthNodeLabel}, `;
        bagLabel += `${fifthNodeLabel}, `;
        bagLabel += `${sixthNodeLabel}, `;
        bagLabel += `${seventhNodeLabel}, `;
        bagLabel += eighthNodeLabel;
        bagLabel += fifthNodeLabel;
        vertices.push(firstNode, secondNode, thirdNode, fourthNode,
          fifthNode, sixthNode, seventhNode, eighthNode);
      }

      if (numberOfNodes === 9) {
        bagLabel += `${firstNodeLabel}, `;
        bagLabel += `${secondNodeLabel}, `;
        bagLabel += `${thirdNodeLabel}, `;
        bagLabel += `${fourthNodeLabel}, `;
        bagLabel += `${fifthNodeLabel}, `;
        bagLabel += `${sixthNodeLabel}, `;
        bagLabel += `${seventhNodeLabel}, `;
        bagLabel += `${eighthNodeLabel}, `;
        bagLabel += ninthNodeLabel;
        vertices.push(firstNode, secondNode, thirdNode, fourthNode, fifthNode,
          sixthNode, seventhNode, eighthNode, ninthNode);
      }

      if (lines.length === 1) {
        forTree.push({
          id: bagId,
          name: bagLabel,
          vertices,
        });
      }

      forTree.push({
        id: bagId,
        name: bagLabel,
        vertices,
        hasParent: false,
      });

      treeBags.push({ bagId, bagLabel });
    } else {
      const splitted = textLine.split(' ');
      const sourceNode = parseInt(splitted[0], 10);
      const targetNode = parseInt(splitted[1], 10);
      const verticesOfSourceNode = getVertices(sourceNode);
      const verticesOfTargetNode = getVertices(targetNode);

      if (isFirstRound) {
        setRootNode(sourceNode, verticesOfSourceNode);
        setChildOfRootNode(sourceNode, targetNode, verticesOfTargetNode);
        isFirstRound = false;
      }

      if (targetNode !== undefined && sourceNode !== undefined) {
        if (!nodeHasParent(sourceNode)) {
          setSourceNodeAsChild(sourceNode, targetNode, verticesOfSourceNode);
        } else {
          setTargetNodeAsChild(sourceNode, targetNode, verticesOfTargetNode);
        }
      }
    }
  }
  const jsonTree = buildTree(forTree);
  removeExistingTree();
  drawTree(jsonTree);
}

const logFileText = async (file) => {
  const response = await fetch(file);
  const text = await response.text();
  const newnew = text.split('\n');
  readTreeInput(newnew);
};


export function computeTreeDecomposition() {
  removeExistingTree();

  $('.text_container').removeClass('hidden').addClass('visible');

  let edges = [];
  if (isLetterGraph) {
    edges = graph.convertNumberGraph();
  } else {
    edges = graph.getAllEdges();
  }

  $.ajax({
    url: '/compute',
    type: 'POST',
    data: JSON.stringify(edges),
    processData: false,
    success() {
      // console.log(data);
    },
    complete() {
      $('.text_container').removeClass('visible').addClass('hidden');
      const pathtotree = '../treedecompositions/tree.td';
      logFileText(pathtotree);
    },
  });
}
