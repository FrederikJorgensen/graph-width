let graphNode;
let graphLink;
let graphLabel;
const adjlist = [];
let selected = [];
let graph1;
let finalGraph;
const graphInput = document.getElementById('graph-input');

/** Sample a random graph G(n,m)
  * @param {Number} n vertices
  * @param {Number} m edges
  * @return {Graph}
  */
function randomGraph(n, m) {
  const maxNumEdges = n * (n - 1) / 2;
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined;

  const graph = { nodes: [], links: [] };
  for (let i = 0; i < n; i++) {
    graph.nodes[i] = { id: i };
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
  const svg = d3.select('#graph');

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
    .force('link', d3.forceLink(links).id((d) => d.id).distance(50).strength(1))
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

function readSingleFile(evt) {
  const f = evt.target.files[0];
  const edges = [];

  const r = new FileReader();
  r.onload = function onLoad() {
    const lines = this.result.split('\n');
    const list = [];
    for (let line = 0; line < lines.length; line++) {
      const textLine = lines[line];
      if (textLine.startsWith('c') || textLine.startsWith('p') || textLine.length < 1) {
        continue;
      } else {
        const firstNode = parseInt(textLine[0]);
        const secondNode = parseInt(textLine[2]);
        list.push(firstNode);
        list.push(secondNode);
        edges.push({ source: firstNode, target: secondNode });
      }
    }

    const sortedList = [...new Set(list)];
    const finalList = [];
    for (let i = 0; i < sortedList.length; i++) {
      finalList.push({ id: sortedList[i] });
    }

    const verticesAsString = JSON.stringify(finalList);
    const edgesAsString = JSON.stringify(edges);
    const nodes = `${'"nodes"' + ': '}${verticesAsString}`;
    const links = `${'"links"' + ': '}${edgesAsString}`;
    finalGraph = `{${nodes},${links}}`;
    const jsonGraph = JSON.parse(finalGraph);
    drawGraph(jsonGraph);
  };
  r.readAsText(f);
}

graphInput.addEventListener('change', readSingleFile, false);

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
function drawTree(data) {
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

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  d3.json(data).then((graph) => {
    const root = d3.hierarchy(graph);
    const links = root.links();
    const nodes = root.descendants();


    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(2).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-1500))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    svg = d3.selectAll('#tree')
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 20)
      .attr('fill', '#1a7532')
      .call(drag(simulation));

    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'label')
      .text((d) => d.data.name);

    node.on('mouseover', highlightNodes);
    node.on('mouseout', resetHighlight);

    simulation.on('tick', () => {
      const ky = 1.2 * simulation.alpha();
      links.forEach((d) => {
        d.target.y += (d.target.depth * 120 - d.target.y) * ky;
      });

      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);


      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });
  });
}

function create() {
  if (graphNode && graphLink && graphLabel) {
    graphNode.remove();
    graphLink.remove();
    graphLabel.remove();
  }
  const graph = randomGraph(20, 20);
  drawGraph(graph);
}

document.getElementById('reload').addEventListener('click', create);


const graphin = {
  nodes: [
    {
      id: 0,
      label: 'a',
    },
    {
      id: 1,
      label: 'b',
    },
    {
      id: 2,
      label: 'c',
    },
    {
      id: 3,
      label: 'd',
    },
    {
      id: 4,
      label: 'e',
    },
    {
      id: 5,
      label: 'f',
    },
    {
      id: 6,
      label: 'g',
    },
    {
      id: 7,
      label: 'h',
    },
  ],
  links: [
    {
      source: 0,
      target: 1,
    },
    {
      source: 0,
      target: 3,
    },
    {
      source: 1,
      target: 6,
    },
    {
      source: 6,
      target: 7,
    },
    {
      source: 6,
      target: 4,
    },
    {
      source: 7,
      target: 5,
    },
    {
      source: 5,
      target: 2,
    },
    {
      source: 2,
      target: 3,
    },
    {
      source: 5,
      target: 4,
    },
    {
      source: 6,
      target: 3,
    },
  ],
};

drawGraph(graphin);
drawTree('../../data/tree.json');
