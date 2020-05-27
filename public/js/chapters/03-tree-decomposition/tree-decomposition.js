let treeLinks;
let simulation;

function recenterTD() {
  const w = document.getElementById('tree-container').offsetWidth;
  const h = document.getElementById('tree-container').offsetHeight;
  d3.select('#tree-container').attr('width', w).attr('height', h);
  simulation = d3
    .forceSimulation()
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('x', d3.forceX(w / 2).strength(0.1))
    .force('y', d3.forceY(h / 2).strength(0.1))
    .alpha(1)
    .restart();
}

export default function loadTreeDecomposition(tree) {
  const tdWidth = document.getElementById('tree-container').offsetWidth;
  const tdHeight = document.getElementById('tree-container').offsetHeight;
  const svg = d3.select('#tree-container').append('svg').attr('width', tdWidth).attr('height', tdHeight);

  recenterTD();

  const { nodes } = tree;
  const { links } = tree;

  treeLinks = svg
    .append('g')
    .selectAll('line');

  treeLinks = treeLinks.data(links);

  const ed = treeLinks
    .enter()
    .append('line')
    .attr('class', 'link')
    .on('mousedown', () => {
      d3.event.stopPropagation();
    });

  treeLinks = ed.merge(treeLinks);

  treeLinks.data(links)
    .enter()
    .append('line')
    .attr('class', 'link');

  let nodeSvg = svg
    .append('g').selectAll('circle');

  nodeSvg = nodeSvg.data(nodes);

  const g = nodeSvg
    .enter()
    .append('g')
    .on('mouseover', (d) => {
      // graph.showSeperator(d.vertices);
      /*       d3.select(this).select('text').classed('highlighted-text', true);
      d3.select(this).select('circle').classed('highlighted-node', true);
      d3.select(this).select('circle').classed('moving-node', true); */
    })
    .on('mouseleave', (d) => {
      /*       graph.hideSeperator();
      d3.select(this).select('text').classed('highlighted-text', false);
      d3.select(this).select('circle').classed('highlighted-node', false); */
    });

  g
    .append('circle')
    .attr('id', (d) => `tree-node-${d.id}`)
    .attr('class', 'node')
    .style('fill', d3.scaleOrdinal()
      .domain([0, 1])
      .range(['red', 'blue', 'green']))
    .attr('r', 22);

  g
    .append('text')
    .text((d) => d.label)
    .style('font-size', function (d) { return `${Math.min(2 * d.r, (2 * d.r - 20) / this.getComputedTextLength() * 24)}px`; })
    .attr('dy', '.35em')
    .attr('class', 'label');
  // .attr('dy', '.2em')
  // .attr('class', 'label')
  // .attr('text-anchor', 'middle');

  nodeSvg = g.merge(nodeSvg);

  function ticked() {
    nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);
    treeLinks.attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  }

  simulation
    .nodes(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(60).strength(0.9))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('x', d3.forceX(tdWidth / 2).strength(0.3))
    .force('y', d3.forceY(tdHeight / 2).strength(0.3))
    .on('tick', ticked);

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

  nodeSvg.call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  );
}
