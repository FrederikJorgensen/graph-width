import ChapterHandler from './ChapterHandler.js';
import Roadmap from './components/Roadmap.js';
import Logo from './components/Logo.js';
import Menu from './components/Menu.js';
import SpeechBubble from './components/SpeechBubble.js';
import AbsoButton from './components/AbsoButton.js';

export const width = document.getElementById('main').offsetWidth;
export const height = document.getElementById('main').offsetHeight;

const sb = new SpeechBubble();
const chapterHandler = new ChapterHandler(sb);
window.chapterHandler = chapterHandler;

const logo = new Logo(width / 2, height / 2);
logo.draw();
logo.drawSubheading();
// logo.setPosition(window.innerWidth / 2, window.innerHeight / 2);

function startStudent() {
  timer.stop();
  logo.setPosition(50, 50);
  d3.select('#main').transition().duration(1500).style('background-color', '#e3e3e3');
  chapterHandler.startFirstLevel();
}

const absoButton = new AbsoButton('student', () => startStudent(), 'student-button', (width / 2) - 100, height / 2);
absoButton.draw();
const researcherButton = new AbsoButton('researcher', () => alert('Development still in progress...'), 'student-button', (width / 2) + 100, height / 2);
researcherButton.draw();


const w = document.getElementById('main').offsetWidth;
const h = document.getElementById('main').offsetHeight;
// d3.select('#main').append('svg').attr('width', w).attr('height', h);

const links = d3.range(30).map((i) => ({
  source: Math.floor(Math.random() * 10), target: Math.floor(Math.random() * 10),
}));


const nodes = d3.range(10).map((i) => ({
  id: i,
  x: w * Math.random(),
  y: h * Math.random(),
  dx: Math.random() - 0.5,
  dy: Math.random() - 0.5,
}));

const svg = d3.select('#main')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

const correctZoom = d3.scaleLinear()
  .domain([0, window.devicePixelRatio])
  .range([0, 1]);

const aFactor = Math.round(w * h / 500000);

drawStars();

function drawStars() {
  const smallStars = [];
  for (var i = 0; i < aFactor * 100; i++) {
	  smallStars.push({ x: randomX(), y: randomY() });
  }

  const mediumStars = [];
  for (var i = 0; i < aFactor * 10; i++) {
	  mediumStars.push({ x: randomX(), y: randomY() });
  }

  const bigStars = [];
  for (var i = 0; i < aFactor; i++) {
	  bigStars.push({ x: randomX(), y: randomY() });
  }

  d3.selectAll('svg > *').remove();

  svg.selectAll('.smallStar')
    .data(smallStars)
    .enter()
    .append('circle')
    .classed('smallStar', true)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', '1px')
    .style('fill', '#fff');

  svg.selectAll('.mediumStar')
    .data(mediumStars)
    .enter()
    .append('circle')
    .classed('mediumStar', true)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', '2px')
    .style('fill', '#fff');

  svg.selectAll('.bigStar')
    .data(bigStars)
    .enter()
    .append('circle')
    .classed('bigStar', true)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', '3px')
    .style('fill', '#fff');
}

const inrange = ({ x: sx, y: sy }, { x: tx, y: ty }) => Math.hypot(sx - tx, sy - ty) <= 300;

function randomX() {
  return Math.round(Math.random() * window.innerWidth);
}

function randomY() {
  return Math.round(Math.random() * window.innerHeight);
}

// const simulation = d3.forceSimulation(nodes).force('link', d3.forceLink(links).id((d) => d.id).distance(500).strength(0.01));
// simulation.force('link').links(links);


let link = svg.append('g')
  .attr('stroke', '#999')
  .selectAll('line');

svg.selectAll('g')
  .data(nodes)
  .attr('class', 'g')
  .enter()
  .append('g');

svg.selectAll('g')
  .append('circle')
  .attr('r', 20)
  .style('opacity', 0.9)
  .style('stroke-width', '5px')
  .style('stroke', 'rgb(51, 51, 51)')
  .attr('class', 'nonhighlight');

const m = 10; // diameter of circle

function updateLinks() {
  link = link
    .data(links)
    .join(
      (enter) => enter.append('line').attr('stroke', '#999'),
      (update) => update.style('stroke', 'green'),
      (exit) => exit.style('stroke', 'red'),
    );
}

const timer = d3.timer(() => {
  d3.selectAll('circle.nonhighlight')
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

  d3.selectAll('line').attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);

  /*   links = links.filter((link) => inrange(link.source, link.target));
  updateLinks(); */

  /*   for (let i = 0; i < nodes.length; i++) {
    const cNode = nodes[i];
    for (let j = 0; j < nodes.length; j++) {
      const sNode = nodes[j];
      if (inrange(cNode, sNode)) {
        links.push({ source: cNode, target: sNode });
      }
    }
  } */

  /* Rerender links with enter, update and exit */
});

d3.select('#main')
  .append('div')
  .style('position', 'absolute')
  .style('z-index', 20)
  .style('bottom', '10px')
  .style('right', '10px')
  .append('a')
  .attr('href', 'https://icons8.com/icon/41215/graph-clique')
  .text('Icon by Icons8');
