/* eslint-disable no-param-reassign */
function drawGraph(selector, container, json) {
  const width = document.getElementById(container).offsetWidth;
  const height = document.getElementById(container).offsetHeight;

  const simulation = d3.forceSimulation()
  // pull nodes together based on the links between them
    .force('link', d3.forceLink().id((d) => d.id)
      .strength(0.5))
  // push nodes apart to space them out
    .force('charge', d3.forceManyBody().strength(-650))
  // and draw them around the centre of the space
    .force('center', d3.forceCenter(width / 2, height / 2));

  const svg = d3.select(selector);

  d3.json(json, (graph) => {
    const { nodes } = graph;
    const { links } = graph;

    const link = svg
      .selectAll('line')
      .data(links)
      .enter()
      .append('line');

    const node = svg
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node');

    // Create an array logging what is connected to what
    const linkedByIndex = {};


    function dragStarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragEnded(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    }

    // This function looks up whether a pair are neighbours
    function neighboring(a, b) {
      return linkedByIndex[`${a.index},${b.index}`];
    }

    function mouseOver() {
      // eslint-disable-next-line no-underscore-dangle
      const d = d3.select(this).node().__data__;
      node.style('opacity', (o) => (neighboring(d, o) || neighboring(o, d) ? 1 : 0.1));
      link.style('opacity', (o) => (d.index === o.source.index || d.index === o.target.index ? 1 : 0.1));
    }

    function mouseOut() {
      d3.select(this).select('circle').transition()
        .duration(750)
        .attr('r', 8);
    }

    node
      .append('circle')
      .attr('r', 15)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded),
      );

    link.attr('class', 'link');
    simulation.nodes(nodes).on('tick', ticked);
    simulation.force('link').links(links);

    for (let i = 0; i < graph.nodes.length; i++) {
      linkedByIndex[`${i},${i}`] = 1;
    }
    links.forEach((d) => {
      linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
    });
  });
}

drawGraph('#graph', 'graph-container', '../data/graph.json');
