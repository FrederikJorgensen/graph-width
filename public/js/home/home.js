// const links = [{ source: 1, target: 2 }];

const width = document.getElementById('main').offsetWidth;
const height = document.getElementById('main').offsetHeight;

const colors = d3.scaleOrdinal(d3.schemeCategory10);

d3.select('.main').append('svg').attr('width', width).attr('height', height);

const nodes = d3.range(91).map((val) => ({

  radius: Math.floor(Math.random() * 8) + 17,
  id: val,
  degree: 0,
  x: Math.random() * width,
  y: Math.random() * height,
  dx: Math.random() - 0.5,
  dy: Math.random() - 0.5,
}));


const svg = d3.select('svg');

svg.append('g').selectAll('circle').data(nodes).enter()
  .append('circle')
  .attr('r', (d) => d.radius)
  .attr('stroke', 'black')
  .attr('stroke-width', 2.5)
  .style('fill', (d, i) => colors(i));


const simulation = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody())
  .force('x', d3.forceX(width / 2).strength(0.001))
  .force('y', d3.forceY(height / 2).strength(0.001))
  .on('tick', () => {
    d3.selectAll('circle').attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    d3.selectAll('line')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  });


const w = width;
const h = height;
const m = 50;

d3.timer(() => {
  // Update the circle positions.
  d3.selectAll('circle')
    .attr('cx', (d) => {
      d.x += d.dx;
      if (d.x > w + m) d.x -= w + m * 2;
      else if (d.x < 0 - m) d.x += w - m * 2;
      return d.x;
    })
    .attr('cy', (d) => {
      d.y += d.dy;
      if (d.y > h + m) d.y -= h + m * 2;
      else if (d.y < 0 - m) d.y += h - m * 2;
      return d.y;
    });
});
