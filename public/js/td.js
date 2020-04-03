let graphNodes;
let graphLinks;
const adjlist = [];

/* eslint-disable no-param-reassign */
function drawGraph(idSelector, container, data) {
  // Get height and width of the specified container
  const width = document.getElementById(container).offsetWidth;
  const height = document.getElementById(container).offsetHeight;

  const svg = d3.select(idSelector);

  // Load the data from the JSON file
  d3.json(data).then((graph) => {
    // Extract the nodes and the links from the graph
    const { nodes } = graph;
    const { links } = graph;

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 18)
      .attr('class', 'node');

    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .text((d) => d.id);


    if (container === 'graph-container') {
      graphLinks = link;
      graphNodes = node;
    } else {
      treeLinks = link;
      treeNodes = node;
    }


    let selected = [];


    function shouldBeVisible(nodeIndex) {
      return selected.some((d) => adjlist[`${d}-${nodeIndex}`] || adjlist[`${nodeIndex}-${d}`]);
    }

    function shouldBeVisible2(sourceIndex, targetIndex) {
      if (targetIndex !== undefined) {
        return shouldBeVisible(sourceIndex)
              && shouldBeVisible(targetIndex);
      }
      return selected.some((d) => adjlist[`${sourceIndex}-${d}`]
               + adjlist[`${d}-${sourceIndex}`]);
    }

    function focus(hoveredNode) {
      graphNodes.attr('opacity', (o) => {
        if (hoveredNode.id.includes(o.id)) {
          selected.push(o.index);
        }
      });


      graphNodes.attr('opacity', (o) => {
        if (shouldBeVisible(o.index)) {
          return 1;
        }
        return 0;
      });

      graphLinks.attr('opacity', (o) => {
        if (shouldBeVisible2(o.source.index, o.target.index)) {
          return 1;
        }
        return 0;
      });


      /*
      graphNodes.attr('opacity', (o) => {
        if (shouldBeVisible(o.index)) return 1;
        return 0;
      }); */
    }

    function resetHighlight() {
      graphNodes.attr('opacity', 1);
      graphLinks.attr('opacity', 1);
      selected = [];
    }

    node.on('mouseover', focus);
    node.on('mouseout', resetHighlight);

    function ticked() {
      node.attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      link.attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);


      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('class', 'label');
    }

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-3000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('link', d3.forceLink(links).id((d) => d.id).distance(50).strength(1))
      .on('tick', ticked);


    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
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

    if (container === 'graph-container') {
      links.forEach((d) => {
        adjlist[`${d.source.index}-${d.target.index}`] = true;
      });
    }

    node.call(
      d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended),
    );
  });
}

drawGraph('#graph', 'graph-container', '../../data/graph3.json');
drawGraph('#tree', 'tree-container', '../../data/tree3.json');
