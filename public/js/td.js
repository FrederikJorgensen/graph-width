let graphNode;
let graphLink;
const adjlist = [];
let graph1;

/* eslint-disable no-param-reassign */
function drawGraph(data) {
  const width = document.getElementById('graph-container').offsetWidth;
  const height = document.getElementById('graph-container').offsetHeight;
  const svg = d3.select('#graph');

  d3.json(data).then((graph) => {
    const { nodes } = graph;
    const { links } = graph;

    graphLink = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link');

    graphNode = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 18)
      .attr('class', 'node');

    const graphLabel = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .text((d) => d.label);

    function ticked() {
      graphNode.attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      graphLink.attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      graphLabel
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    }

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-500))
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

    links.forEach((d) => {
      adjlist[`${d.source.index}-${d.target.index}`] = true;
    });

    graphNode.call(
      d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended),
    );

    graph1 = graph;
  });
}


/* eslint-disable no-param-reassign */
function drawTree(data) {
  // Get height and width of the specified container
  const width = document.getElementById('tree-container').offsetWidth;
  const height = document.getElementById('tree-container').offsetHeight;

  let svg = d3.select('#tree');

  const drag = (simulation) => {
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

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  d3.json(data).then((graph) => {
    const root = d3.hierarchy(graph);
    const links = root.links();
    const nodes = root.descendants();
    let selected = [];

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(2).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-1500))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    svg = d3.selectAll('#tree')
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 20)
      .attr('fill', '#1a7532')
      .call(drag(simulation));

    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'label')
      .text((d) => d.data.name);

    function nodeShouldBeVisible(nodeIndex, vertices) {
      return vertices.some((vertix) => adjlist[`${vertix}-${nodeIndex}`] || adjlist[`${nodeIndex}-${vertix}`] || vertix === nodeIndex);
    }

    function linkShouldBeVisible(sourceIndex, targetIndex, indexes) {
      if (targetIndex !== undefined) {
        return nodeShouldBeVisible(sourceIndex, indexes)
              && nodeShouldBeVisible(targetIndex, indexes
                );
      }
      return indexes.some((d) => adjlist[`${sourceIndex}-${d}`]
               + adjlist[`${d}-${sourceIndex}`]);
    }

    function getVerticesIndexes(vertices) {
      graph1.nodes.forEach((currentNode) => {
        if (vertices.includes(currentNode.label)) {
          selected.push(currentNode.index);
        }
      });
      return selected;
    }

    function highlightNodes(hoveredNode) {
      const verticesToHighlight = hoveredNode.data.vertices;
      const indexes = getVerticesIndexes(verticesToHighlight);

      graphNode
        .attr('opacity', (o) => {
          if (nodeShouldBeVisible(o.index, indexes)) {
            return 1;
          }
          return 0.1;
        });

      graphLink.attr('opacity', (o) => {
        if (linkShouldBeVisible(o.source.index, o.target.index, indexes)) {
          return 1;
        }
        return 0;
      });
    }

    function resetHighlight() {
      graphNode.attr('opacity', 1);
      graphLink.attr('opacity', 1);
      selected = [];
    }

    node.on('mouseover', highlightNodes);
    node.on('mouseout', resetHighlight);

    simulation.on('tick', () => {
      const ky = 1.2 * simulation.alpha();
      links.forEach((d) => {
        d.target.y += (d.target.depth * 120 - d.target.y) * ky;
      });

      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);


      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });
  });
}

drawGraph('../../data/graph.json');
drawTree('../../data/tree.json');
