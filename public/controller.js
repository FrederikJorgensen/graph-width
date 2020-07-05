/* eslint-disable func-names */
/* eslint-disable max-len */
/* eslint-disable no-restricted-globals */
import ChapterHandler from './Handlers/ChapterHandler.js';
import Roadmap from './Components/Roadmap.js';
import generateRandomGraph from './Utilities/helpers.js';

const chapterHandler = new ChapterHandler();
window.chapterHandler = chapterHandler;

d3.select(window).on('load', async () => {
  const params = new URLSearchParams(location.search);
  const hasChapter = params.has('chapter');
  const chapterIndex = params.get('chapter') - 1;
  const hasSandbox = params.has('sandbox');
  const hasCustom = params.has('custom');

  if (hasSandbox) {
    chapterHandler.goToChapter(chapterHandler.chapters[chapterHandler.chapters.length - 1], hasSandbox);
  }

  if (hasCustom) {
    chapterHandler.goToChapter(chapterHandler.chapters[chapterHandler.chapters.length - 2], hasSandbox, hasCustom);
  }

  if (hasChapter && chapterIndex < chapterHandler.chapters.length) {
    const currentChapter = chapterHandler.chapters[chapterIndex];
    chapterHandler.goToChapter(currentChapter, false);
  }
});

export const width = document.getElementById('main').offsetWidth;
export const height = document.getElementById('main').offsetHeight;

const colors = d3.scaleOrdinal(d3.schemeCategory10);

const roadmap = new Roadmap();

const logoContainer = d3.select('#main')
  .append('div')
  .attr('class', 'logo-container');

logoContainer.append('h1')
  .text('GraphWidth.com')
  .style('font-size', '50px')
  .style('margin', 0)
  .style('z-index', 10)
  .style('color', 'white');

logoContainer.append('h2')
  .text('An interactive way to learn graph width measures.')
  .style('color', 'white')
  .style('opacity', '85%')
  .style('z-index', '10')
  .attr('class', 'subtitle');

logoContainer.append('button')
  .text('Start Learning')
  .attr('class', 'pure-material-button-contained')
  .style('z-index', '20')
  .on('click', () => chapterHandler.startFirstLevel());

d3.select('#chapter-button').on('click', () => {
  roadmap.toggle();
});

d3.select('#sandbox-button').on('click', () => {
  chapterHandler.goToChapter(chapterHandler.chapters[chapterHandler.chapters.length - 1], true);
});

d3.select('#custom-algorithm-button').on('click', () => {
  chapterHandler.goToChapter(chapterHandler.chapters[chapterHandler.chapters.length - 2], false, true);
});

/* Close modal if clicked outside of modal box */
window.onclick = function (event) {
  const overlay = document.getElementById('overlay');
  if (event.target === overlay) {
    roadmap.toggle();
  }
};

/* Handle key events */
d3.select('body').on('keydown', () => {
  switch (event.key) {
    case 'Escape':
      roadmap.toggle();
      break;
    case 'ArrowLeft':
      if (window.sectionHandler) window.sectionHandler.goPreviousSection();
      break;
    case 'ArrowRight':
      if (window.sectionHandler) window.sectionHandler.goNextSection();
      break;
    default:
  }
});

const svg = d3.select('#main').append('svg').attr('width', width).attr('height', height);
const graph = generateRandomGraph(10, 10);

svg.selectAll('line')
  .data(graph.links)
  .enter()
  .append('line')
  .style('stroke', 'lightgrey')
  .style('stroke-width', '2.5px');

svg.selectAll('circle')
  .data(graph.nodes)
  .enter()
  .append('circle')
  .style('fill', (d) => colors(d.id))
  .attr('r', 18);

const simulation = d3.forceSimulation()
  .force('x', d3.forceX(width / 2).strength(0.1))
  .force('y', d3.forceY(height / 2).strength(0.1))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .nodes(graph.nodes)
  .force('charge', d3.forceManyBody().strength(-450))
  .force('link', d3.forceLink(graph.links).id((d) => d.id).strength(0.3))
  .on('tick', () => {
    svg.selectAll('circle').attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    svg.selectAll('line').attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  });

simulation.force('link').links(graph.links);
