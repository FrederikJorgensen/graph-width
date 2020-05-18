/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* Graph Drawing Starts here */

import * as helpers from '../helpers.js';

let mousedownNode = null;
let nodes = [];
let links = [];
let nodeSvg;
let linkSvg;
let simulation;
const colors = d3.scaleOrdinal(d3.schemeCategory10);

function beginDrawLine(d) {
  if (d3.event.ctrlKey) return;
  d3.event.preventDefault();
  d3.select('#graph-svg').classed('creating-link', true);
  d3.select(`#node-${d.id}`).classed('highlighted-node', true);
  d3.select(`#text-${d.id}`).classed('highlighted-text', true);
  mousedownNode = d;
  d3.selectAll('path.dragLine')
    .classed('hidden', false)
    .attr(
      'd',
      `M${
        mousedownNode.x
      },${
        mousedownNode.y
      }L${
        mousedownNode.x
      },${
        mousedownNode.y}`,
    );
}

function stopDrawLine(d) {
  if (!mousedownNode || mousedownNode === d) return;
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    if (
      (l.source === mousedownNode && l.target === d)
        || (l.source === d && l.target === mousedownNode)
    ) {
      return;
    }
  }
  const newLink = { source: mousedownNode, target: d };
  links.push(newLink);
}

function removeNode(d) {
  if (d3.event.ctrlKey) return;
  const linksToRemove = links.filter((l) => l.source === d || l.target === d);
  linksToRemove.map((l) => links.splice(links.indexOf(l), 1));
  nodes.splice(nodes.indexOf(d), 1);
  d3.event.preventDefault();
  restart();
}

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
    .on('mousedown', beginDrawLine)
    .on('mouseup', stopDrawLine)
    .on('contextmenu', removeNode)
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

function getAllNodes() {
  return d3.selectAll('#graph-svg circle').data();
}

function getLastNodeId() {
  return getAllNodes().length;
}

function addNode() {
  const e = d3.event;
  if (e.button === 0) {
    const coords = d3.mouse(e.currentTarget);
    let lastNodeId = getLastNodeId();
    const newNode = {
      x: coords[0], y: coords[1], id: ++lastNodeId,
    };
    nodes.push(newNode);
    restart();
  }
}

function updateDragLine() {
  if (!mousedownNode) return;
  const coords = d3.mouse(d3.event.currentTarget);
  d3.selectAll('path.dragLine').attr(
    'd',
    `M${
      mousedownNode.x
    },${
      mousedownNode.y
    }L${
      coords[0]
    },${
      coords[1]}`,
  );
}

function hideDragLine() {
  d3.selectAll('path.dragLine').classed('hidden', true);
  mousedownNode = null;
  restart();
}

function leftCanvas() {
  d3.selectAll('path.dragLine').classed('hidden', true);
  mousedownNode = null;
}

export function startDraw() {
  nodes.splice(0);
  links.splice(0);
  restart();
}

const drag = d3.drag()
  .filter(() => d3.event.button === 0 || d3.event.button === 2)
  .on('start', (d) => {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
  })
  .on('drag', (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  })
  .on('end', (d) => {
    if (!d3.event.active) simulation.alphaTarget(0);

    d.fx = null;
    d.fy = null;
  });


function ctrlPressed() {
  if (d3.event.keyCode === 17) {
    d3.selectAll('circle.node').call(drag);
    d3.select('#graph-svg').classed('moving-node', true);
  }
}


function ctrlRealesed() {
  if (d3.event.keyCode === 17) {
    d3.selectAll('#graph-svg circle').on('.drag', null);
    d3.select('#graph-svg').classed('moving-node', false);
  }
}

d3.select(window).on('keydown', ctrlPressed).on('keyup', ctrlRealesed);

/* Graph Drawing Ends Here */


/* Loading of graph simulation starts here */

function recenter() {
  const w = document.getElementById('graph-container').offsetWidth;
  const h = document.getElementById('graph-container').offsetHeight;
  simulation
    // .force('center', d3.forceCenter(w / 2, h / 2))
    .force('x', d3.forceX(w / 2).strength(0.2))
    .force('y', d3.forceY(h / 2).strength(0.2))
    .alpha(1)
    .restart();
}

function loadGraph() {
  const w = document.getElementById('graph-container').offsetWidth;
  const h = document.getElementById('graph-container').offsetHeight;
  const svg = d3.select('#graph-svg').attr('width', w).attr('height', h);
  d3.select('#graph-svg').classed('loading', true);

  linkSvg = svg.append('g').selectAll('link');

  svg
    .append('path')
    .attr('class', 'dragLine hidden')
    .attr('d', 'M0,0L0,0');

  svg.append('g')
    .attr('class', 'hulls');

  svg.append('path')
    .attr('fill', 'orange')
    .attr('stroke', 'orange')
    .attr('stroke-width', 16)
    .attr('opacity', 0.2);

  nodeSvg = svg.selectAll('circle');

  simulation
    .nodes(nodes)
    .force('charge', d3.forceManyBody().strength(-400))
    .force('link', d3.forceLink(links).distance(50).strength(0.9))
    .on('tick', () => {
      nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);

      linkSvg.attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    });

  simulation.force('link').links(links);
  recenter();
  d3.select('#graph-svg').classed('loading', false);
}

d3.select('#graph-svg')
  .on('mousedown', addNode)
  .on('contextmenu', () => {
    d3.event.preventDefault();
  })
  .on('mousemove', updateDragLine)
  .on('mouseup', hideDragLine)
  .on('mouseleave', leftCanvas);

export function main() {
  simulation = d3.forceSimulation();
  recenter();
  window.onresize = recenter;
  loadGraph();
  const randomGraph = helpers.generateRandomGraph(10, 10);
  nodes = randomGraph.nodes;
  links = randomGraph.links;
  restart();
}

window.onload = main;
