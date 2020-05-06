
let treeLinks;
let treeNodes;
let treeLabels;

export default function loadTreeDecomposition(tree, canvas) {
  const graphWidth = document.getElementById('td-container').offsetWidth;
  const graphHeight = document.getElementById('td-container').offsetHeight;

  const svg = d3.select(canvas).attr('viewBox', [-graphWidth / 2, -graphHeight / 2, graphWidth, graphHeight]);
  const { nodes } = tree;
  const { links } = tree;

  treeLinks = svg
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link');

  treeNodes = svg
    .append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 18)
    .attr('word-spacing', 10)
    .attr('class', 'treeDecompositionNode');

  console.log(nodes);

  treeLabels = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.label);

  function ticked() {
    treeNodes
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    treeLinks
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    treeLabels.attr('x', (d) => d.x).attr('y', (d) => d.y);
  }

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(50).strength(0.9))
    .force('charge', d3.forceManyBody().strength(-180))
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

  treeNodes.call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  );
}
