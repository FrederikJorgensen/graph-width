
let treeLinks;

export default function loadTreeDecomposition(tree, canvas) {
  const graphWidth = document.getElementById('nice-td-container').offsetWidth;
  const graphHeight = document.getElementById('nice-td-container').offsetHeight;

  const svg = d3.select('#nice-td-svg').attr('viewBox', [-graphWidth / 2, -graphHeight / 2, graphWidth, graphHeight]);
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
    .on('mouseover', function (d) {
      d3.select(this).select('text').classed('highlighted-text', true);
      d3.select(this).select('circle').classed('highlighted-node', true);
    })
    .on('mouseleave', function (d) {
      d3.select(this).select('text').classed('highlighted-text', false);
      d3.select(this).select('circle').classed('highlighted-node', false);
    });

  g
    .append('circle')
    .attr('class', 'node')
    .attr('r', 20);

  g
    .append('text')
    .text((d) => d.label)
    .attr('dy', '.2em')
    .attr('class', 'label')
    .attr('text-anchor', 'middle');

  nodeSvg = g.merge(nodeSvg);

  function ticked() {
    nodeSvg.attr('transform', (d) => `translate(${d.x},${d.y})`);
    treeLinks.attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  }

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(60).strength(0.9))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
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
