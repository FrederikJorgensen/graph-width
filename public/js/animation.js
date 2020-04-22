const width = document.getElementById('graph-container').offsetWidth;
const height = document.getElementById('graph-container').offsetHeight;
const svg = d3.select('#graph');

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const nodes = randomizeData();

const simulation = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody().strength(-150))
  .force('forceX', d3.forceX().strength(0.1))
  .force('forceY', d3.forceY().strength(0.1))
  .force('center', d3.forceCenter())
  .alphaTarget(1)
  .on('tick', ticked);


const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
let node = g.append('g').attr('stroke', '#fff').attr('stroke-width', 1.5).selectAll('.node');


function restart(nodes) {
  // transition
  const t = d3.transition()
    .duration(750);

  // Apply the general update pattern to the nodes.
  node = node.data(nodes, (d) => d.name);

  node.exit()
    .style('fill', '#b26745')
    .transition(t)
    .attr('r', 1e-6)
    .remove();

  node
    .transition(t)
    .style('fill', '#3a403d')
    .attr('r', (d) => d.size);

  node = node.enter().append('circle')
    .style('fill', '#45b29d')
    .attr('r', (d) => d.size)
    .merge(node);

  // Update and restart the simulation.
  simulation.nodes(nodes)
    .force('collide', d3.forceCollide().strength(1).radius((d) => d.size + 10).iterations(1));
}

function ticked() {
  node.attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y);
}

function randomizeData() {
  const d0 = jz.arr.shuffle(alphabet);
  const d1 = [];
  const d2 = [];
  for (let i = 0; i < jz.num.randBetween(1, alphabet.length); i++) {
    d1.push(d0[i]);
  }
  d1.forEach((d) => {
    d2.push({ name: d, size: jz.num.randBetween(0, 50) });
  });
  return d2;
}

export default function startAnimation() {
  d3.interval(() => {
    restart(randomizeData());
  }, 2000);
}
