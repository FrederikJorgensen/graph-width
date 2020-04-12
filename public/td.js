/* eslint-disable no-useless-concat */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
let graphNode;
let graphLink;
let graphLabel;
let treeNode;
let treeLink;
let treeLabel;
const adjlist = [];
let selected = [];
let graph1;
let currentGraph;

function randomGraph(n, m) {
  const maxNumEdges = n * (n - 1) / 2;
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined;

  const graph = { nodes: [], links: [] };
  for (let i = 0; i < n; i++) {
    graph.nodes[i] = { id: i + 1, label: i + 1 };
  }

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);

  const state = {};
  for (let i = 0; i < m; i++) {
    const j = randomInt(i, maxNumEdges);
    if (!(i in state)) state[i] = i;
    if (!(j in state)) state[j] = j;
    [state[i], state[j]] = [state[j], state[i]];
  }

  function unpair(k) {
    const z = Math.floor((-1 + Math.sqrt(1 + 8 * k)) / 2);
    return [k - z * (1 + z) / 2, z * (3 + z) / 2 - k];
  }

  for (let i = 0; i < m; i++) {
    const [x, y] = unpair(state[i]);
    const u = graph.nodes[x];
    const v = graph.nodes[n - 1 - y];
    graph.links.push({ source: u, target: v });
  }
  return graph;
}

/* eslint-disable no-param-reassign */
function drawGraph(graph) {
  const width = document.getElementById('graph-container').offsetWidth;
  const height = document.getElementById('graph-container').offsetHeight;
  const svg = d3.select('#graph').call(d3.zoom().on('zoom', () => {
    svg.attr('transform', d3.event.transform);
  }));

  const { nodes } = graph;
  const { links } = graph;


  graphLink = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link');

  graphNode = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 18)
    .attr('class', 'node');

  graphLabel = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.label);

  function ticked() {
    graphNode.attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    graphLink.attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    graphLabel
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);
  }

  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink(links).id((d) => d.id).distance(50).strength(0.9))
    .on('tick', ticked);


  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
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

  links.forEach((d) => {
    adjlist[`${d.source.index}-${d.target.index}`] = true;
  });

  graphNode.call(
    d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended),
  );

  graph1 = graph;
}

function nodeShouldBeVisible(nodeIndex, vertices) {
  return vertices.some((vertix) => adjlist[`${vertix}-${nodeIndex}`] || adjlist[`${nodeIndex}-${vertix}`] || vertix === nodeIndex);
}

function linkShouldBeVisible(sourceIndex, targetIndex, indexes) {
  if (targetIndex !== undefined) {
    return nodeShouldBeVisible(sourceIndex, indexes)
      && nodeShouldBeVisible(targetIndex, indexes);
  }
  return indexes.some((d) => adjlist[`${sourceIndex}-${d}`]
    + adjlist[`${d}-${sourceIndex}`]);
}

function getVerticesIndexes(vertices) {
  graph1.nodes.forEach((currentNode) => {
    if (vertices.includes(currentNode.label)) {
      selected.push(currentNode.index);
    }
  });
  return selected;
}

function highlightNodes(hoveredNode) {
  const verticesToHighlight = hoveredNode.data.vertices;
  const indexes = getVerticesIndexes(verticesToHighlight);

  graphNode
    .attr('opacity', (o) => {
      if (nodeShouldBeVisible(o.index, indexes)) {
        return 1;
      }
      return 0.1;
    });

  graphLink.attr('opacity', (o) => {
    if (linkShouldBeVisible(o.source.index, o.target.index, indexes)) {
      return 1;
    }
    return 0;
  });
}

function resetHighlight() {
  graphNode.attr('opacity', 1);
  graphLink.attr('opacity', 1);
  selected = [];
}


/* eslint-disable no-param-reassign */
function drawTree(tree) {
  // Get height and width of the specified container
  const width = document.getElementById('tree-container').offsetWidth;
  const height = document.getElementById('tree-container').offsetHeight;

  let svg = d3.select('#tree');

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

    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  };

  const root = d3.hierarchy(tree);
  const links = root.links();
  const nodes = root.descendants();

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(2).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-1500))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  svg = d3.selectAll('#tree')
    .attr('viewBox', [-width / 2, -height / 2, width, height]);

  treeLink = svg.append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line');

  treeNode = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 40)
    .attr('fill', '#1a7532')
    .call(drag(simulation));

  treeLabel = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.name);

  treeNode.on('mouseover', highlightNodes);
  treeNode.on('mouseout', resetHighlight);

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

    treeNode
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);


    treeLabel
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);
  });
}

function removeExistingGraph() {
  if (graphNode && graphLink && graphLabel) {
    graphNode.remove();
    graphLink.remove();
    graphLabel.remove();
  }
}

function removeExistingTree() {
  if (treeNode && treeLink && treeLabel) {
    treeNode.remove();
    treeLink.remove();
    treeLabel.remove();
  }
}

function newReadGraphFile(file) {
  const f = file;
  const r = new FileReader();
  const newGraph = {};
  const nodes = [];
  const links = [];
  r.onload = function onLoad() {
    const lines = this.result.split('\n');

    function nodeExists(node) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === node) return true;
      }
      return false;
    }

    for (let i = 0; i < lines.length; i++) {
      const textLine = lines[i];
      if (textLine.startsWith('c') || textLine.startsWith('p') || textLine.length < 1) continue;
      const splitted = textLine.split(' ');
      const firstNode = parseInt(splitted[0], 10);
      const secondNode = parseInt(splitted[1], 10);

      if (!nodeExists(firstNode)) {
        nodes.push({ id: firstNode, label: firstNode });
      }

      if (!nodeExists(secondNode)) {
        nodes.push({ id: secondNode, label: secondNode });
      }

      links.push({ source: firstNode, target: secondNode });
    }
    newGraph.nodes = nodes;
    newGraph.links = links;
    removeExistingGraph();
    currentGraph = newGraph;
    drawGraph(newGraph);
  };
  r.readAsText(f);
}


function create() {
  removeExistingTree();
  removeExistingGraph();
  const graph = randomGraph(10, 10);
  currentGraph = graph;
  drawGraph(graph);
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


  function setRootNode(node) {
    forTree.forEach((obj) => {
      if (obj.id === node) {
        obj.id = node;
        obj.name = findTreeBagLabel(node);
        obj.hasParent = true;
      }
    });
  }

  function setChildOfRootNode(sourceNode, targetNode) {
    forTree.forEach((obj) => {
      if (obj.id === targetNode) {
        obj.id = targetNode;
        obj.name = findTreeBagLabel(targetNode);
        obj.parent = sourceNode;
        obj.hasParent = true;
      }
    });
  }

  function setSourceNodeAsChild(sourceNode, targetNode) {
    forTree.forEach((obj) => {
      if (obj.id === sourceNode) {
        obj.id = sourceNode;
        obj.name = findTreeBagLabel(sourceNode);
        obj.parent = targetNode;
        obj.hasParent = true;
      }
    });
  }

  function setTargetNodeAsChild(sourceNode, targetNode) {
    forTree.forEach((obj) => {
      if (obj.id === targetNode) {
        obj.id = targetNode;
        obj.name = findTreeBagLabel(targetNode);
        obj.parent = sourceNode;
        obj.hasParent = true;
      }
    });
  }


  function nodeHasParent(nodeId) {
    const node = getNodeById(nodeId);
    return node.hasParent;
  }

  for (let line = 0; line < lines.length; line++) {
    const textLine = lines[line];
    let bagId;
    let firstNode;
    let secondNode;
    let thirdNode;
    let fourthNode;
    let fifthNode;
    let bagLabel = '';

    if (textLine.startsWith('b')) {
      const splitted = textLine.split(' ');
      bagId = parseInt(splitted[1], 10);
      firstNode = parseInt(splitted[2], 10);
      secondNode = parseInt(splitted[3], 10);
      thirdNode = parseInt(splitted[4], 10);
      fourthNode = parseInt(splitted[5], 10);
      fifthNode = parseInt(splitted[6], 10);
      const sixthNode = parseInt(splitted[7], 10);
      const seventhNode = parseInt(splitted[8], 10);
      const eighthNode = parseInt(splitted[9], 10);
      const ninthNode = parseInt(splitted[10], 10);

      const numberOfNodes = splitted.length - 2;

      if (numberOfNodes === 1) {
        bagLabel += firstNode;
      }

      if (numberOfNodes === 2) {
        bagLabel += `${firstNode}, `;
        bagLabel += secondNode;
      }

      if (numberOfNodes === 3) {
        bagLabel += `${firstNode}, `;
        bagLabel += `${secondNode}, `;
        bagLabel += thirdNode;
      }

      if (numberOfNodes === 4) {
        bagLabel += `${firstNode}, `;
        bagLabel += `${secondNode}, `;
        bagLabel += `${thirdNode}, `;
        bagLabel += fourthNode;
      }

      if (numberOfNodes === 5) {
        bagLabel += `${firstNode}, `;
        bagLabel += `${secondNode}, `;
        bagLabel += `${thirdNode}, `;
        bagLabel += `${fourthNode}, `;
        bagLabel += fifthNode;
      }

      if (numberOfNodes === 6) {
        bagLabel += `${firstNode}, `;
        bagLabel += `${secondNode}, `;
        bagLabel += `${thirdNode}, `;
        bagLabel += `${fourthNode}, `;
        bagLabel += `${fifthNode}, `;
        bagLabel += sixthNode;
      }

      if (numberOfNodes === 7) {
        bagLabel += `${firstNode}, `;
        bagLabel += `${secondNode}, `;
        bagLabel += `${thirdNode}, `;
        bagLabel += `${fourthNode}, `;
        bagLabel += `${fifthNode}, `;
        bagLabel += `${sixthNode}, `;
        bagLabel += seventhNode;
      }

      if (numberOfNodes === 8) {
        bagLabel += `${firstNode}, `;
        bagLabel += `${secondNode}, `;
        bagLabel += `${thirdNode}, `;
        bagLabel += `${fourthNode}, `;
        bagLabel += `${fifthNode}, `;
        bagLabel += `${sixthNode}, `;
        bagLabel += `${seventhNode}, `;
        bagLabel += eighthNode;
      }

      if (numberOfNodes === 9) {
        bagLabel += `${firstNode}, `;
        bagLabel += `${secondNode}, `;
        bagLabel += `${thirdNode}, `;
        bagLabel += `${fourthNode}, `;
        bagLabel += `${fifthNode}, `;
        bagLabel += `${sixthNode}, `;
        bagLabel += `${seventhNode}, `;
        bagLabel += `${eighthNode}, `;
        bagLabel += ninthNode;
      }

      if (lines.length === 1) {
        forTree.push({
          id: bagId,
          name: bagLabel,
        });
      }

      forTree.push(
        {
          id: bagId,
          name: bagLabel,
          hasParent: false,
        },
      );

      treeBags.push({ bagId, bagLabel });
    } else {
      const splitted = textLine.split(' ');
      const sourceNode = parseInt(splitted[0], 10);
      const targetNode = parseInt(splitted[1], 10);


      if (isFirstRound) {
        setRootNode(sourceNode);
        setChildOfRootNode(sourceNode, targetNode);
        isFirstRound = false;
      }

      if (targetNode !== undefined && sourceNode !== undefined) {
        if (!nodeHasParent(sourceNode)) {
          setSourceNodeAsChild(sourceNode, targetNode);
        } else {
          setTargetNodeAsChild(sourceNode, targetNode);
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

const handleGraphUpload = (event) => {
  const file = event.target.files[0];
  newReadGraphFile(file);
};

function computeTreeDecomposition() {
  removeExistingTree();
  const temp = [];
  currentGraph.links.forEach((link) => {
    temp.push([link.source.id, link.target.id]);
  });

  $.ajax({
    url: '/compute',
    type: 'POST',
    data: JSON.stringify(temp),
    processData: false,
    success() {
      // console.log(data);
    },
    complete() {
      const pathtotree = './treedecompositions/tree.td';
      logFileText(pathtotree);
    },
  });
}

const testGraph1 = {
  nodes: [
    {
      id: 1,
      label: 1,
    },
    {
      id: 2,
      label: 2,
    },
    {
      id: 3,
      label: 3,
    },
    {
      id: 4,
      label: 4,
    },
    {
      id: 5,
      label: 5,
    },
    {
      id: 6,
      label: 6,
    },
    {
      id: 7,
      label: 7,
    },
    {
      id: 8,
      label: 8,
    },
    {
      id: 9,
      label: 9,
    },
    {
      id: 10,
      label: 10,
    },
  ],
  links: [
    {
      source: 1,
      target: 9,
    },
    {
      source: 1,
      target: 2,
    },
    {
      source: 2,
      target: 4,
    },
    {
      source: 4,
      target: 5,
    },
    {
      source: 4,
      target: 6,
    },
    {
      source: 5,
      target: 10,
    },
    {
      source: 10,
      target: 6,
    },
    {
      source: 6,
      target: 3,
    },
    {
      source: 6,
      target: 8,
    },
    {
      source: 8,
      target: 7,
    },
  ],
};

currentGraph = testGraph1;
drawGraph(testGraph1);

document.querySelector('#fileUpload').addEventListener('change', handleGraphUpload);
document.getElementById('compute').addEventListener('click', computeTreeDecomposition);
document.getElementById('reload').addEventListener('click', create);
