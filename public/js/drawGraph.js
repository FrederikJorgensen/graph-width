const width = document.getElementById('graph-container').offsetWidth;
const height = document.getElementById('graph-container').offsetHeight;
let node;
let link;
let label;
const drawLinks = [];

function beginDraw() {
  const nodes = [];
  let mouse = null;
  let startId = 1;
  let mouseDownNode;
  let mouseUpNode;
  let hoveringANode = false;

  let svg = d3.select('#drawGraph').append('svg')
    .property('value', { nodes, drawLinks })
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('cursor', 'crosshair');


  function mouseleft() {
    mouse = null;
  }

  function ticked() {
    node.attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    link.attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    label.attr('x', (d) => d.x).attr('y', (d) => d.y);
  }

  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-500))
    .force(
      'link',
      d3
        .forceLink(drawLinks)
        .id((d) => d.id)
        .distance(120)
      // eslint-disable-next-line comma-dangle
        .strength(0.7)
    )
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .on('tick', ticked);

  const dragLine = svg.append('line')
    .attr('class', 'drag_line drag_line_hidden')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', 0);

  function mousemoved() {
    if (mouseDownNode) {
      dragLine
        .attr('x1', mouseDownNode.x)
        .attr('y1', mouseDownNode.y)
        .attr('x2', d3.mouse(this)[0])
        .attr('y2', d3.mouse(this)[1]);
    }

    const [x, y] = d3.mouse(this);
    mouse = { x, y };
    simulation.alpha(0.3).restart();
  }


  const drag = (sim) => {
    function dragstarted(d) {
      if (!d3.event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  const dragger = drag(simulation)
    .on('start.mouse', mouseleft)
    .on('end.mouse', mousemoved);

  link = svg.append('g')
    .attr('stroke', '#999')
    .selectAll('line');


  node = svg.append('g').selectAll('circle');
  label = svg.append('g').selectAll('text');


  function handleMouseOver() {
    hoveringANode = true;
  }

  function handleMouseOut() {
    hoveringANode = false;
  }

  function mousedown(d) {
    mouseDownNode = d;

    dragLine
      .attr('class', 'link')
      .attr('x1', mouseDownNode.x)
      .attr('y1', mouseDownNode.y)
      .attr('x2', mouseDownNode.x)
      .attr('y2', mouseDownNode.y);
  }

  function resetMouseVars() {
    mouseDownNode = null;
    mouseUpNode = null;
  }

  function mouseup(d) {
    mouseUpNode = d;
    dragLine.attr('class', 'drag_line_hidden');
    drawLinks.push({ source: mouseDownNode, target: mouseUpNode });

    link = link
      .data(drawLinks)
      .join('line');

    simulation.nodes(nodes);
    simulation.force('link').links(drawLinks);
    simulation.alpha(1).restart();

    resetMouseVars();
  }

  function spawn(source) {
    nodes.push(source);

    label = label
      .data(nodes)
      .join(
        (enter) => enter.append('text').attr('class', 'label').attr('text-anchor', 'middle').text((d) => d.id),
        (update) => update,
        (exit) => exit.remove(),
      );

    node = node
      .data(nodes)
      .join(
        (enter) => enter.append('circle').attr('r', 15).attr('class', 'node')
          .call(dragger),
        (update) => update,
        (exit) => exit.remove(),
      )
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('mousedown', mousedown)
      .on('mouseup', mouseup);

    simulation.nodes(nodes);
    simulation.force('link').links(drawLinks);
    simulation.alpha(1).restart();

    svg.property('value', {
      nodes: nodes.map((d) => ({ id: d.index })),
      links: drawLinks.map((d) => ({ source: d.source.index, target: d.target.index })),
    });
  }

  function clicked() {
    d3.event.preventDefault();
    if (hoveringANode) return;
    mousemoved.call(this);
    spawn({ x: mouse.x, y: mouse.y, id: ++startId });
  }

  svg = svg
    .on('mouseleave', mouseleft)
    .on('mousemove', mousemoved)
    .on('click', clicked);

  spawn({ x: 0, y: 0, id: startId });
}

export function resetDrawingGraph() {
  d3.select('svg').remove();
  if (node && label && link) {
    node.remove();
    label.remove();
    link.remove();
  }
  beginDraw();
}

export function isDrawing() {
  if (node && label && link) return true;
  return false;
}

export function convertLinks() {
  const convertedArray = [];
  drawLinks.forEach((currentLink) => {
    convertedArray.push([currentLink.source.id, currentLink.target.id]);
  });
  return convertedArray;
}
