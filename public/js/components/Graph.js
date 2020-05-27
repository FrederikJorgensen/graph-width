/* eslint-disable no-useless-return */
/* eslint-disable no-bitwise */
import { generateRandomGraph } from '../helpers.js';

const colors = d3.scaleOrdinal(d3.schemeCategory10);

function generatePowerSet(array, n) {
  const result = [];

  for (let i = 1; i < (1 << array.length); i++) {
    const subset = [];
    for (let j = 0; j < array.length; j++) if (i & (1 << j)) subset.push(array[j]);

    if (subset.length === n) result.push(subset);
  }

  return result;
}

function highlightVertex(nodeId) {
  d3.select(`#node-${nodeId}`)
    .transition()
    .duration(200)
    .style('fill', 'orange');
}

function removeHighlightVertex(nodeId) {
  d3.select(`#node-${nodeId}`)
    .transition()
    .duration(200)
    .style('fill', '#1f77b4');
}

function resetVerticesStyling() {
  d3.selectAll('circle.graphNode').style('fill', colors(1));
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function repeat(nodesToHighlight, animationSpeed) {
  return new Promise(async (resolve) => {
    let i = 0;
    while (i < 5) {
      d3.selectAll('circle.graphNode')
        .filter((node) => nodesToHighlight.includes(node))
        .transition()
        .duration(200)
        .style('fill', 'orange')
        .transition()
        .duration(200)
        .style('fill', '#1f77b4');
      i++;
      await timeout(animationSpeed);
      if (i === 4) {
        resolve();
      }
    }
  });
}


export default class Graph {
  constructor() {
    this.container = 'graph-container';
    this.maxStop = false;
    this.misAnimationSpeed = 500;
  }

  changeMisAnimationSpeed(ms) {
    this.misAnimationSpeed = ms;
  }

  toggleMaxStop() {
    if (this.maxStop) {
      this.maxStop = false;
    } else {
      this.maxStop = true;
    }
  }

  buildAdjacencyList() {
    const adjacencyList = [];
    this.links.forEach((d) => {
      adjacencyList[`${d.source.id}-${d.target.id}`] = true;
      adjacencyList[`${d.target.id}-${d.source.id}`] = true;
    });
    this.adjacencyList = adjacencyList;
  }

  async maximumIndependentSet() {
    let maximumSet = 0;
    let maximumIndependentSet = [];
    let possibleMaxSet = true;

    for (let i = 2; i < this.nodes.length + 1; i++) {
      if (this.maxStop === true) break;
      const conjunto = generatePowerSet(this.nodes, i);


      for (const c of conjunto) {
        possibleMaxSet = true;
        const pair = generatePowerSet(c, 2);

        if (this.maxStop === true) break;

        for (const par of pair) {
          const vertex1 = par[0];
          const vertex2 = par[1];
          if (this.misAnimationSpeed > 0) {
            highlightVertex(vertex1.id);
            highlightVertex(vertex2.id);
            await timeout(this.misAnimationSpeed);
            removeHighlightVertex(vertex1.id);
            removeHighlightVertex(vertex2.id);
          }

          if (this.maxStop === true) break;

          if (this.adjacencyList[`${vertex1.id}-${vertex2.id}`]) {
            possibleMaxSet = false;
            break;
          }
        }

        if (possibleMaxSet && c.length > maximumSet) {
          maximumSet = c.length;
          maximumIndependentSet = c;
          const result = [];
          maximumIndependentSet.forEach((n) => {
            n.isMax = true;
            result.push(n.id);
          });

          if (this.misAnimationSpeed > 0) {
            await repeat(c, this.misAnimationSpeed * 2);
            await timeout(this.misAnimationSpeed * 2);
          }

          d3.select('#result-math').html(String.raw`\( S = \{ ${result} \} \)`);
          renderMathInElement(document.body);
        }
      }
    }
    d3.selectAll('circle.graphNode').filter((node) => maximumIndependentSet.includes(node)).style('stroke', 'orange');
    return maximumIndependentSet;
  }

  clear() {
    d3.select('svg').remove();
  }

  loadGraph(graph, container) {
    this.container = container;
    this.graph = graph;
    this.nodes = graph.nodes;
    this.links = graph.links;
    const w = document.getElementById(container).offsetWidth;
    const h = document.getElementById(container).offsetHeight;
    const svg = d3.select(`#${container}`).append('svg').attr('width', w).attr('height', h);

    svg.selectAll('line.graphLink')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('class', 'graphLink');

    svg.selectAll('g').data(graph.nodes).enter().append('g')
      .call(d3.drag()
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
        }));

    svg.selectAll('g')
      .append('circle')
      .attr('id', (d) => `node-${d.id}`)
      .attr('r', 20)
      .style('fill', colors(1))
      .attr('class', 'graphNode');

    svg.selectAll('g')
      .append('text')
      .attr('dy', 4.5)
      .text((d) => d.id)
      .attr('class', 'label');

    const simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('x', d3.forceX(w / 2).strength(0.2))
      .force('y', d3.forceY(h / 2).strength(0.2))
      .nodes(graph.nodes)
      .force('charge', d3.forceManyBody().strength(-600).distanceMin(15))
      .force('link', d3.forceLink(graph.links).id((d) => d.id).distance(85).strength(0.8))
      .force('collision', d3.forceCollide().radius(20))
      .on('tick', () => {
        svg.selectAll('g').attr('transform', (d) => `translate(${d.x},${d.y})`);

        svg.selectAll('line.graphLink').attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);
      });

    simulation.force('link').links(graph.links);
    this.buildAdjacencyList();
  }

  randomGraph() {
    this.clear();
    const randomGraph = generateRandomGraph(10, 10);
    this.loadGraph(randomGraph, this.container);
  }
}
