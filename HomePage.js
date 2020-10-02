import generateRandomGraph from './Utilities/helpers.js';

export const width = document.getElementById('main').offsetWidth;
export const height = document.getElementById('main').offsetHeight;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
const logoContainer = d3
  .select('#main')
  .append('div')
  .attr('class', 'logo-container');

logoContainer
  .append('h1')
  .attr('class', 'homepage-title')
  .text('GraphWidth.com')
  .attr('class', 'homepage-title');

logoContainer
  .append('p')
  .text('An interactive way to learn graph width measures.')
  .attr('class', 'homepage-subtitle');

logoContainer
  .append('button')
  .text('Start Learning')
  .attr('class', 'button');

const svg = d3
  .select('#main')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const graph = generateRandomGraph(30, 20);

svg
  .selectAll('line')
  .data(graph.links)
  .enter()
  .append('line')
  .style('stroke', 'lightgrey')
  .style('stroke-width', '2.5px');

svg
  .selectAll('circle')
  .data(graph.nodes)
  .enter()
  .append('circle')
  .style('fill', (d) => colors(d.id))
  .attr('r', 20);

const simulation = d3
  .forceSimulation()
  .force('x', d3.forceX(width / 2).strength(0.1))
  .force('y', d3.forceY(height / 2).strength(0.1))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .nodes(graph.nodes)
  .force('charge', d3.forceManyBody().strength(-1100))
  .force(
    'link',
    d3
      .forceLink(graph.links)
      .id((d) => d.id)
      .strength(0.5),
  )
  .on('tick', () => {
    svg
      .selectAll('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    svg
      .selectAll('line')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  });

simulation.force('link').links(graph.links);
