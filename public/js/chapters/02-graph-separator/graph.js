/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* Graph Drawing Starts here */

import * as controller from '../../controller.js';

let nodes = [];
let links = [];
let selectedNodes = [];
let componentCount;
let nodeSvg;
let linkSvg;
let simulation;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
let ad = [];
let isSeparatorExercise = false;
let isMinimalSeparatorExercise = false;
let isBalanceExercise = false;

export function toggleExercise1() {
  if (isSeparatorExercise === true) {
    isSeparatorExercise = false;
  } else {
    isSeparatorExercise = true;
  }
}

export function toggleExercise2() {
  if (isMinimalSeparatorExercise === true) {
    isMinimalSeparatorExercise = false;
  } else {
    isMinimalSeparatorExercise = true;
  }
}

export function toggleExercise3() {
  if (isBalanceExercise === true) {
    isBalanceExercise = false;
  } else {
    isBalanceExercise = true;
  }
}

function showResult(isSeparating) {
  if (isSeparating) {
    toggleExercise1();
    controller.goNextExercise(1);
    d3.select('.text-container').append('div').attr('id', 'exercise-result');
    d3.select('.text-container').style('height', '350px');
    const resultContainer = document.getElementById('exercise-result');
    resultContainer.innerHTML = `The set \\( S = \\{ ${selectedNodes} \\} \\) is indeed a separator in the graph. <span class="material-icons correct-answer">check</span> <br/><br/>Because if we remove the separator it would disconnect the graph into ${componentCount} different components.<br/><br/>Click space to go to the next exercise...`;
    componentCount = 0;
    selectedNodes = [];
    renderMathInElement(resultContainer);
  } else {
    /* If the user gets a wrong answer we should give a hint here... */
    // resultDiv.innerHTML = `\\( S = \\{ ${selectedNodes} \\} \\) is not a separator in the graph.  <span class="material-icons wrong-answer">clear</span>`;
  }
}

function showMinimalSeparatorResult(isMinimal) {
  if (isMinimal) {
    toggleExercise2();
    controller.goNextExercise(2);
    d3.select('.text-container').append('div').attr('id', 'exercise-result');
    d3.select('.text-container').style('height', '350px');
    const resultContainer = document.getElementById('exercise-result');
    resultContainer.innerHTML = `\\( S = \\{ ${selectedNodes} \\} \\) is a minimal separator!<span class="material-icons correct-answer">check</span>`;
    componentCount = 0;
    selectedNodes = [];
    renderMathInElement(resultContainer);
  } else {
    // Give user hint here...
  }
}

function showBalanceResult(isBalanced) {
  const exerciseThreeResultDiv = document.getElementById('exercise-3-result');

  if (isBalanced) {
    toggleExercise3();
    controller.goNextExercise(3);
    d3.select('.text-container').append('div').attr('id', 'exercise-result');
    d3.select('.text-container').style('height', '350px');
    const resultContainer = document.getElementById('exercise-result');
    resultContainer.innerHTML = `\\( S = \\{ ${selectedNodes} \\} \\) is a balanced separator!<span class="material-icons correct-answer">check</span>`;
    componentCount = 0;
    selectedNodes = [];
    renderMathInElement(resultContainer);
  } else {
    // Give hint
  }
}


/* https://stackoverflow.com/a/47147597/4169689 */
const getAllSubsets = (theArray) => theArray.reduce(
  (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
  [[]],
);


function checkConnectivity(subGraphNodes, subGraphLinks) {
  if (subGraphNodes.length === 0) {
    componentCount = 0;
    return;
  }

  componentCount = 1;
  subGraphNodes.forEach((v) => {
    v.visited = false;
  });

  // construct adjacency list of graph

  const adjList = {};
  subGraphNodes.forEach((v) => {
    adjList[v.id] = [];
  });

  subGraphLinks.forEach((e) => {
    adjList[e.source.id].push(e.target);
    adjList[e.target.id].push(e.source);
  });

  const q = [];
  q.push(subGraphNodes[0]);

  while (q.length > 0) {
    const v1 = q.shift();
    const adj = adjList[v1.id];

    for (let i = 0; i < adj.length; i++) {
      const v2 = adj[i];
      if (v2.visited) continue;
      q.push(v2);
    }

    v1.visited = true;
    v1.cluster = componentCount;
    // check for unvisited nodes
    if (q.length === 0) {
      for (let i = 0; i < subGraphNodes.length; i++) {
        if (!subGraphNodes[i].visited) {
          q.push(subGraphNodes[i]);
          componentCount++;
          break;
        }
      }
    }
  }

  d3.selectAll('circle.node').style('fill', (d) => colors(d.cluster));

  const isDisconnected = componentCount > 1;

  return { subGraphNodes, subGraphLinks, isDisconnected };
}

function isSeparatorSet(set) {
  /* Remove the current separtor nodes */
  const subGraphNodes = nodes.filter((node) => !set.includes(node.id));

  /* Remove the links from the separator node */
  const linksToRemove = links.filter((l) => {
    if (set.includes(l.target.id) || set.includes(l.source.id)) return true;
  });
  const subGraphLinks = links.filter((link) => !linksToRemove.includes(link));

  /* Check if the new subgraph after deleting the separating set is connected */
  return checkConnectivity(subGraphNodes, subGraphLinks);
}


function checkMinimalSeparator(d) {
  if (selectedNodes.includes(d.id)) {
    const nodeInSeparatorSet = selectedNodes.indexOf(d.id);
    selectedNodes.splice(nodeInSeparatorSet, 1);
  } else {
    selectedNodes.push(d.id);
  }

  /* Get all proper subsets of current selected separator */
  const allSubsets = getAllSubsets(selectedNodes);
  const allProperSubsets = allSubsets.filter(
    (subset) => subset.length !== selectedNodes.length && subset.length !== 0,
  );

  /* Get the sub graph and whether it is disconnected */

  /* Check if any the proper subsets is a separator in the graph */
  for (const set of allProperSubsets) {
    const sg = isSeparatorSet(set);
    if (sg.isDisconnected) {
      d3.selectAll('circle.node').classed('separating-node', false);
      d3.selectAll('circle.node').classed('not-separating-node', (node) => {
        if (selectedNodes.includes(node.id)) return 'true';
      });
      showMinimalSeparatorResult(false);
      return;
    }
  }

  const subg = isSeparatorSet(selectedNodes);

  if (subg.isDisconnected) {
    d3.selectAll('circle.node').classed('not-separating-node', false);
    d3.selectAll('circle.node').classed('separating-node', (node) => {
      if (selectedNodes.includes(node.id)) return 'true';
    });
    showMinimalSeparatorResult(true);
    return;
  }
  d3.selectAll('circle.node').classed('separating-node', false);
  showMinimalSeparatorResult(false);
}

function checkBalanceSeparator(d) {
  if (selectedNodes.includes(d.id)) {
    const nodeToRemove = selectedNodes.indexOf(d.id);
    selectedNodes.splice(nodeToRemove, 1);

    /* After removing a separating node check if the remaining vertices are still adjacent */
    if (selectedNodes.length > 1 && isSeparatingNodesAdjacent() === false) {
      colorNotSeparating();
      d3.selectAll('circle.node').style('fill', colors(1));
      showBalanceResult(false);
      return;
    }
  } else {
    selectedNodes.push(d.id);
  }

  /* Original graph's vertices subtracting the vertex separator set */
  const balanceLimit = (nodes.length - selectedNodes.length) / 2;

  /* Get the subgraph, sublinks and whether the graph is disconnected */
  const obj = isSeparatorSet(selectedNodes);

  /* First check if the graph is disconnected */
  if (obj.isDisconnected === true) {
    const newnodes = obj.subGraphNodes;
    const connectedComponents = {};

    /* Count the vertices in each component */
    for (const node of newnodes) {
      if ('cluster' in node) {
        const nc = node.cluster;
        connectedComponents[nc] = connectedComponents[nc] + 1 || 1;
      }
    }

    const componentLength = Object.values(connectedComponents);

    /* Test each component length against the balance limit */
    for (const cl of componentLength) {
      if (cl > balanceLimit) {
        d3.selectAll('circle.node').classed('separating-node', false);
        d3.selectAll('circle.node').classed('not-separating-node', (node) => {
          if (selectedNodes.includes(node.id)) return 'true';
        });

        showBalanceResult(false);
        return;
      }
    }
    d3.selectAll('circle.node').classed('not-separating-node', false);
    d3.selectAll('circle.node').classed('separating-node', (node) => {
      if (selectedNodes.includes(node.id)) return 'true';
    });
    showBalanceResult(true);
  } else {
    d3.selectAll('circle.node').classed('separating-node', false);
    d3.selectAll('circle.node').classed('not-separating-node', (node) => {
      if (selectedNodes.includes(node.id)) return 'true';
    });
    showBalanceResult(false);
  }
}

function buildAdjacencyList(links) {
  const adjacencyList = [];
  links.forEach((d) => {
    adjacencyList[`${d.source.id}-${d.target.id}`] = true;
    adjacencyList[`${d.target.id}-${d.source.id}`] = true;
  });
  return adjacencyList;
}

function colorNotSeparating() {
  d3.selectAll('circle.node').classed('separating-node', (node) => {
    if (selectedNodes.includes(node.id)) return false;
  });
  d3.selectAll('circle.node').classed('not-separating-node', (node) => {
    if (selectedNodes.includes(node.id)) return true;
  });
}

function colorSeparting() {
  d3.selectAll('circle.node').classed('not-separating-node', (node) => {
    if (selectedNodes.includes(node.id)) return false;
  });
  d3.selectAll('circle.node').classed('separating-node', (node) => {
    if (selectedNodes.includes(node.id)) return true;
  });
}

export function resetNodeStyling() {
  d3.selectAll('circle.node').classed('not-separating-node', (node) => {
    if (selectedNodes.includes(node.id)) return false;
  });
  d3.selectAll('circle.node').classed('separating-node', (node) => {
    if (selectedNodes.includes(node.id)) return false;
  });
  d3.selectAll('circle.node').style('fill', colors(1));
}

function isNeighboring(nodeToCheck) {
  return selectedNodes.some((selectNode) => {
    if (ad[`${selectNode}-${nodeToCheck}`]) {
      return true;
    }
    return false;
  });
}

function isSeparatingNodesAdjacent() {
  return selectedNodes.every((node) => {
    if (isNeighboring(node)) {
      return true;
    }
    return false;
  });
}

function isNeighboringSeparatedNodes(newNode) {
  for (const node of selectedNodes) {
    if (ad[`${node}-${newNode}`]) return true;
  }
  return false;
}

function checkSeparator(d) {
  /* If node clicked on is already in the separator set we remove it */
  if (selectedNodes.includes(d.id)) {
    const nodeInSeparatorSet = selectedNodes.indexOf(d.id);
    selectedNodes.splice(nodeInSeparatorSet, 1);

    /* After removing a separating node check if the remaining vertices are still adjacent */
    if (selectedNodes.length > 1 && isSeparatingNodesAdjacent() === false) {
      colorNotSeparating();
      d3.selectAll('circle.node').style('fill', colors(1));
      showResult(false);
      return;
    }

    /* If the new separating set is empty reset the result and the styling */
    if (selectedNodes.length === 0) {
      showResult();
      resetNodeStyling();
      return;
    }
  } else {
    selectedNodes.push(d.id);
    /* If new node to the separator is not a neighbor the result is wrong */
    if (
      selectedNodes.length > 1
      && isNeighboringSeparatedNodes(d.id) === false
    ) {
      colorNotSeparating();
      d3.selectAll('circle.node').style('fill', colors(1));
      showResult(false);
      return;
    }
  }

  /* Remove the current separtor nodes */
  const subGraphNodes = nodes.filter(
    (node) => !selectedNodes.includes(node.id),
  );

  /* Remove the links from the separator node */
  const linksToRemove = links.filter((l) => {
    if (
      selectedNodes.includes(l.target.id)
      || selectedNodes.includes(l.source.id)
    ) return true;
  });
  const subGraphLinks = links.filter((link) => !linksToRemove.includes(link));

  /* Check if the new subgraph after deleteing the separating set is connected */
  const subg = checkConnectivity(subGraphNodes, subGraphLinks);

  if (subg.isDisconnected) {
    colorSeparting();
    showResult(true);
  } else {
    colorNotSeparating();
    showResult(false);
  }
}

function restart() {
  linkSvg = linkSvg.data(links, (d) => `v${d.source.id}-v${d.target.id}`);
  linkSvg.exit().remove();

  const ed = linkSvg
    .enter()
    .append('line')
    .attr('class', 'link')
    .on('mousedown', () => {
      d3.event.stopPropagation();
    });

  linkSvg = ed.merge(linkSvg);

  nodeSvg = nodeSvg.data(nodes, (d) => d.id);
  nodeSvg.exit().remove();

  const g = nodeSvg
    .enter()
    .append('g')
    .call(
      d3
        .drag()
        .on('start', (v) => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          [v.fx, v.fy] = [v.x, v.y];
        })
        .on('drag', (v) => {
          [v.fx, v.fy] = [d3.event.x, d3.event.y];
        })
        .on('end', (v) => {
          if (!d3.event.active) simulation.alphaTarget(0);
          [v.fx, v.fy] = [null, null];
        }),
    );

  g.append('circle')
    .attr('id', (d) => `node-${d.id}`)
    .on('click', (d) => {
      if (isSeparatorExercise) checkSeparator(d);
      if (isMinimalSeparatorExercise) checkMinimalSeparator(d);
      if (isBalanceExercise) checkBalanceSeparator(d);
    })
    .attr('class', 'node')
    .style('fill', d3.rgb(colors(1)))
    .attr('r', 17);

  g.append('text')
    .text((d) => d.id)
    .attr('dy', '.2em')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .attr('id', (d) => `text-${d.id}`);

  nodeSvg = g.merge(nodeSvg);

  simulation.nodes(nodes);
  simulation.force('link').links(links);
  simulation.alpha(0.5).restart();
}

/* Graph Drawing Ends Here */

/* Loading of graph simulation starts here */

function recenter() {
  const w = document.getElementById('main').offsetWidth;
  const h = document.getElementById('main').offsetHeight;
  simulation
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('x', d3.forceX(w / 2).strength(0.1))
    .force('y', d3.forceY(h / 2).strength(0.1))
    .alpha(1)
    .restart();
}

function loadGraph() {
  const w = document.getElementById('main').offsetWidth;
  const h = document.getElementById('main').offsetHeight;
  const svg = d3.select('#main').append('svg');

  svg.attr('id', 'yup');

  svg.attr('width', w).attr('height', h);

  linkSvg = svg.append('g').selectAll('link');

  nodeSvg = svg.selectAll('circle');

  simulation
    .nodes(nodes)
    .force('charge', d3.forceManyBody().strength(-300))
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(50)
        .strength(0.9),
    )
    .on('tick', () => {
      nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);

      linkSvg
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    });

  simulation.force('link').links(links);
  recenter();
}

export function main() {
  simulation = d3.forceSimulation();
  nodes = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
  ];
  links = [
    { source: 1, target: 2 },
    { source: 3, target: 1 },
    { source: 7, target: 5 },
    { source: 5, target: 2 },
    { source: 8, target: 6 },
    { source: 6, target: 4 },
    { source: 6, target: 3 },
    { source: 4, target: 3 },
    { source: 4, target: 9 },
  ];
  recenter();
  window.onresize = recenter;
  loadGraph();
  ad = buildAdjacencyList(links);
  restart();
}
