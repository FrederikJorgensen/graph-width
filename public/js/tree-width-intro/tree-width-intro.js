import * as helpers from '../helpers.js';

let nodes = [];
let links = [];
let nodeSvg;
let linkSvg;
let simulation;
const colors = d3.scaleOrdinal(d3.schemeCategory10);

function restart() {
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  d3.selectAll('g text').classed('highlighted-text', false);
  d3.selectAll('#nice-td-svg g').remove();
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.select('#graph-svg').classed('creating-link', false);

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
    )
    .on('mouseover', () => {
      d3.select(this).select('text').classed('highlighted-text', true);
      d3.select(this).select('circle').classed('highlighted-node', true);
    })
    .on('mouseleave', () => {
      d3.select(this).select('text').classed('highlighted-text', false);
      d3.select(this).select('circle').classed('highlighted-node', false);
    })
    .on('mousedown', () => {
      d3.event.stopPropagation();
    });

  g.append('circle')
    .attr('id', (d) => `node-${d.id}`)
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
  const w = document.getElementById('tw-intro').offsetWidth;
  const h = document.getElementById('tw-intro').offsetHeight;
  simulation
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('x', d3.forceX(w / 2).strength(0.1))
    .force('y', d3.forceY(h / 2).strength(0.1))
    .alpha(1)
    .restart();
}

function loadGraph() {
  const w = document.getElementById('tw-intro').offsetWidth;
  const h = document.getElementById('tw-intro').offsetHeight;
  const svg = d3.select('#tw-intro').append('svg').attr('width', w).attr('height', h);

  linkSvg = svg.append('g').selectAll('link');
  nodeSvg = svg.selectAll('circle');

  simulation
    .nodes(nodes)
    .force('charge', d3.forceManyBody().strength(-400))
    .force('link', d3.forceLink(links).id((d) => d.id).distance(50).strength(0.9))
    .force('collision', d3.forceCollide().radius(20))
    .on('tick', () => {
      nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);

      linkSvg.attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    });


  simulation.force('link').links(links);
  recenter();
}

export function clearGraph() {
  d3.select('svg').remove();
  nodes.splice(0);
  links.splice(0);
  restart();
}

export function loadGraph1() {
  simulation = d3.forceSimulation();
  recenter();
  loadGraph();

  nodes = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];
  links = [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 5, target: 1 },
    { source: 1, target: 6 },
    { source: 2, target: 7 },
    { source: 3, target: 8 },
    { source: 4, target: 9 },
    { source: 5, target: 10 },
    { source: 3, target: 1 },
  ];
  restart();
}

export function loadGraph2() {
  simulation = d3.forceSimulation();
  recenter();
  loadGraph();

  nodes = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];
  links = [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    { source: 1, target: 5 },
    { source: 1, target: 6 },
    { source: 1, target: 7 },
    { source: 1, target: 8 },
    { source: 1, target: 9 },
    { source: 1, target: 10 },
    { source: 5, target: 8 },
    { source: 8, target: 3 },
    { source: 3, target: 6 },
    { source: 6, target: 9 },
    { source: 9, target: 4 },
    { source: 4, target: 7 },
    { source: 7, target: 2 },
    { source: 2, target: 10 },
    { source: 10, target: 5 },
  ];
  restart();
}

export function loadRandomGraph() {
  simulation = d3.forceSimulation();
  recenter();
  window.onresize = recenter;
  loadGraph();
  const randomGraph = helpers.generateRandomGraph(10, 10);
  nodes = randomGraph.nodes;
  links = randomGraph.links;
  restart();
}
