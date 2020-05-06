/* eslint-disable no-restricted-syntax */

const graphWidth = document.getElementById('graph-container').offsetWidth;
const graphHeight = document.getElementById('graph-container').offsetHeight;
let currentGraph;
let graphNodes = [];
let graphLinks = [];
let graphLinkSvg;
let graphNodeSvg;
let graphLabelSvg;
let simulation;
const padding = 5;
const clusterPadding = 20;
const maxRadius = 10;
const numClusters = 20;
const color = d3.scaleOrdinal(d3.schemeCategory10);
let isSeperating = false;
let clusters;
let hulls;
let hullG;
let svg;
const line = d3.line().curve(d3.curveBasisClosed);


function hullPoints(data) {
  let pointArr = [];
  const padding = 2.5;
  data.each((d) => {
    const pad = d.radius + padding;
    pointArr = pointArr.concat([
      [d.x - pad, d.y - pad],
      [d.x - pad, d.y + pad],
      [d.x + pad, d.y - pad],
      [d.x + pad, d.y + pad],
    ]);
  });
  return pointArr;
}


export function loadGraph(graph) {
  d3.select('#graphSvg').selectAll('g').remove();
  currentGraph = graph;
  const { nodes } = graph;
  const { links } = graph;
  graphNodes = nodes;
  graphLinks = links;

  svg = d3.select('#graphSvg').attr('width', graphWidth).attr('height', graphHeight);

  graphNodes.forEach((node) => {
    node.radius = 15;
  });

  graphLinkSvg = svg
    .append('g')
    .selectAll('line')
    .data(graphLinks)
    .enter()
    .append('line')
    .attr('class', 'link');

  graphNodeSvg = svg
    .append('g')
    .selectAll('g')
    .data(graphNodes)
    .enter()
    .append('circle')
    .attr('r', (d) => d.radius)
    // .attr('class', 'graphNode')
    .attr('id', (d) => `graphNode-${d.id}`)
    .attr('fill', (d) => color(d.cluster));

  graphLabelSvg = svg
    .append('g')
    .selectAll('text')
    .data(graphNodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.id);

  // https://bl.ocks.org/mbostock/7881887
  function cluster(alpha) {
    return function (d) {
      const cluster = clusters[d.cluster];
      if (cluster === d || d.cluster == 0) return;
      let x = d.x - cluster.x;
      let y = d.y - cluster.y;
      let l = Math.sqrt(x * x + y * y);
      const r = d.radius + cluster.radius + 3;
      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    };
  }

  function ticked() {
    if (isSeperating) {
      graphNodeSvg
        .each(cluster(0.2))
        .each(collide(0.1))
        .attr('cx', (d) => d.x = Math.max(d.radius, Math.min(graphWidth - d.radius, d.x)))
        .attr('cy', (d) => d.y = Math.max(d.radius, Math.min(graphHeight - d.radius, d.y)));

      hulls
        .attr('d', (d) => line(d3.polygonHull(hullPoints(d.nodes))));
    } else {
      graphNodeSvg
        .attr('cx', (d) => d.x = Math.max(d.radius, Math.min(graphWidth - d.radius, d.x)))
        .attr('cy', (d) => d.y = Math.max(d.radius, Math.min(graphHeight - d.radius, d.y)));
    }

    graphLabelSvg.attr('x', (d) => d.x).attr('y', (d) => d.y);

    graphLinkSvg
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  }

  function collide(alpha) {
    // https://bl.ocks.org/mbostock/7882658
    const quadtree = d3.quadtree()
      .x((d) => d.x)
      .y((d) => d.y)
      .extent([[0, 0], [graphWidth, graphHeight]])
      .addAll(graphNodes);
    return function (d) {
      const r = d.radius + (maxRadius * 8) + Math.max(padding, clusterPadding);
      const nx1 = d.x - r;
      const nx2 = d.x + r;
      const ny1 = d.y - r;
      const ny2 = d.y + r;
      quadtree.visit((quad, x1, y1, x2, y2) => {
        const { data } = quad;
        if (data && data !== d) {
          let x = d.x - data.x;
          let y = d.y - data.y;
          let l = Math.sqrt(x * x + y * y);
          const r = d.radius + data.radius + (d.cluster == data.cluster ? padding : clusterPadding);
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            data.x += x;
            data.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }


  simulation = d3.forceSimulation(graphNodes)
    .force('link', d3.forceLink(graphLinks).id((d) => d.id))
    .force('charge', d3.forceManyBody().strength(-400))
    .on('tick', ticked);
  // .restart();
  // .force('center', null)
  // .force('collide', null)
  // .alpha(0.3)
  // .force('center', d3.forceCenter().x(graphWidth / 2).y(graphHeight / 2))
  // .force('collide', d3.forceCollide((d) => d.radius + 5))

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

  graphNodeSvg.call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  );
}

function checkNodes(selectedNodeVertices, link) {
  if (!selectedNodeVertices.includes(link.source.id)
  && !selectedNodeVertices.includes(link.target.id)) return true;
  if (!selectedNodeVertices.includes(link.source.id)
  && selectedNodeVertices.includes(link.target.id)) return false;
  if (selectedNodeVertices.includes(link.source.id)
  && selectedNodeVertices.includes(link.target.id)) return true;
  if (selectedNodeVertices.includes(link.source.id)
  && !selectedNodeVertices.includes(link.target.id)) return false;
  return true;
}

export function highlightSeperator(selectedNode) {
  loadGraph(currentGraph);
  const selectedNodeVertices = selectedNode.data.vertices;
  const filteredNodes = graphNodes.filter((node) => !selectedNodeVertices.includes(node.id));
  const filteredNodesById = [];
  filteredNodes.forEach((node) => {
    filteredNodesById.push(node.id);
  });
  const subGraphNodes = graphNodes.filter((node) => selectedNodeVertices.includes(node.id));
  for (let i = 0; i < subGraphNodes.length; i++) {
    subGraphNodes[i].index = i;
  }
  const first = graphLinks.filter((link) => checkNodes(selectedNodeVertices, link));
  graphLinkSvg = graphLinkSvg
    .data(first)
    .join('line');

  graphNodes.forEach((node) => {
    if (selectedNodeVertices.includes(node.id)) {
      node.cluster = 1;
      node.radius = 15;
      node.x = Math.random() * graphWidth;
      node.y = Math.random() * graphHeight;
    } else {
      node.cluster = 2;
      node.radius = 15;
      node.x = Math.random() * graphWidth;
      node.y = Math.random() * graphHeight;
    }
  });

  const clusterMap = {};
  graphNodes.forEach((n) => {
    if (!clusterMap[n.cluster] || (n.radius > clusterMap[n.cluster].radius)) clusterMap[n.cluster] = n;
  });
  clusters = clusterMap;

  hullG = svg.append('g')
    .attr('class', 'hulls');

  hulls = hullG
    .selectAll('path')
    .data(Object.keys(clusters).map((c) => ({
      cluster: c,
      nodes: graphNodeSvg.filter((d) => d.cluster == c),
    })).filter((d) => d.cluster != 0), (d) => d.cluster)
    .enter().append('path')
    .attr('d', (d) => line(d3.polygonHull(hullPoints(d.nodes))))
    .attr('fill', (d) => color(d.cluster))
    .attr('opacity', 0.4);


  isSeperating = true;
  simulation.alpha(0.3).force('center', d3.forceCenter().x(graphWidth / 2).y(graphHeight / 2)).force('collide', d3.forceCollide((d) => d.radius + 5)).force('charge', d3.forceManyBody().strength(0));
  simulation.nodes(graphNodes);
  simulation.force('link').links(graphLinks);
  simulation.alpha(0.1).restart();
}

export function resetHighlight() {
  if (graphLinkSvg && graphNodeSvg && graphLabelSvg) {
    graphLinkSvg.attr('opacity', 1);
    graphNodeSvg.attr('opacity', 1);
    graphNodeSvg.style('fill', 'yellow');
    graphLabelSvg.attr('opacity', 1);
  }
}

export function getAllEdges() {
  const convertedArray = [];
  currentGraph.links.forEach((link) => {
    convertedArray.push([link.source.id, link.target.id]);
  });
  return convertedArray;
}

const numberOfColors = 3;
let result = [];
let adjlist = [];

function isSafe(k, subGraphNodes, color) {
  for (let i = 0; i < subGraphNodes.length; i++) {
    if (adjlist[`${k}-${i}`] && color === result[i]) {
      return false;
    }
  }
  return true;
}

function getColor(colorNumber) {
  if (colorNumber === 1) {
    return 'red';
  } if (colorNumber === 2) {
    return 'green';
  } if (colorNumber === 3) {
    return 'blue';
  }
  return 'pink';
}

let coloredNodes = {};

function colorNode(nodeToColor, color) {
  d3.select(`#graphNode-${nodeToColor}`).style('fill', (d) => {
    const nodeColor = getColor(color);
    d.color = nodeColor;
    coloredNodes[nodeToColor] = nodeColor;
    return nodeColor;
  });
}

export function graphColoring(k, subGraphNodes) {
  for (let color = 1; color <= numberOfColors; color++) {
    if (isSafe(k, subGraphNodes, color)) {
      result[k] = color;
      const nodeToColor = subGraphNodes[k].id;
      colorNode(nodeToColor, color);
      if ((k + 1) < subGraphNodes.length) {
        graphColoring(k + 1, subGraphNodes);
      } else {
        return;
      }
    }
  }
}

function highlightSubgraph(vertices, filteredNodesById) {
  graphLinkSvg.attr('opacity', (link) => {
    if (vertices.includes(link.source.id) && !filteredNodesById.includes(link.target.id)) return 1;
    return 0.2;
  });

  graphNodeSvg.attr('opacity', (node) => {
    if (vertices.includes(node.id)) return 1;
    return 0.2;
  });

  graphLabelSvg.attr('opacity', (node) => {
    if (vertices.includes(node.id)) return 1;
    return 0.2;
  });
}

export function createSubGraph(currentTreeNode) {
  const { vertices } = currentTreeNode.data;
  const filteredNodes = graphNodes.filter((node) => !vertices.includes(node.id));
  const filteredNodesById = [];
  result = [];
  adjlist = [];
  coloredNodes = {};

  filteredNodes.forEach((node) => {
    filteredNodesById.push(node.id);
  });

  const subGraphNodes = graphNodes.filter((node) => vertices.includes(node.id));

  for (let i = 0; i < subGraphNodes.length; i++) {
    subGraphNodes[i].index = i;
  }

  const subGraphLinks = graphLinks.filter(
    (link) => vertices.includes(link.source.id)
      && !filteredNodesById.includes(link.target.id),
  );

  if (subGraphLinks !== undefined) {
    subGraphLinks.forEach((d) => {
      adjlist[`${d.source.index}-${d.target.index}`] = true;
      adjlist[`${d.target.index}-${d.source.index}`] = true;
      adjlist[`${d.source.index}-${d.source.index}`] = true;
      adjlist[`${d.target.index}-${d.target.index}`] = true;
    });
  } else {
    return true;
  }

  resetHighlight();
  highlightSubgraph(vertices, filteredNodesById);
  graphColoring(0, subGraphNodes);

  // eslint-disable-next-line no-restricted-syntax
  for (const link of subGraphLinks) {
    if (link.source.color === link.target.color) {
      return false;
    }
  }
  return { isColorable: true, coloredNodes };
}

const testGraph = {
  nodes: [
    {
      id: 1,
      cluster: 1,
    },
    {
      id: 2,
      cluster: 1,
    },
    {
      id: 3,
      cluster: 1,
    },
    {
      id: 4,
      cluster: 1,
    },
    {
      id: 5,
      cluster: 1,
    },
    {
      id: 6,
      cluster: 1,
    },
    {
      id: 7,
      cluster: 1,
    },
    {
      id: 8,
      cluster: 1,
    },
  ],
  links: [
    {
      source: 1,
      target: 8,
    },
    {
      source: 8,
      target: 5,
    },
    {
      source: 5,
      target: 6,
    },
    {
      source: 6,
      target: 7,
    },
    {
      source: 7,
      target: 4,
    },
    {
      source: 4,
      target: 2,
    },
    {
      source: 2,
      target: 7,
    },
    {
      source: 2,
      target: 3,
    },
    {
      source: 3,
      target: 6,
    },
  ],
};

loadGraph(testGraph);
