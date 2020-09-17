import ChapterHandler from './public/Handlers/ChapterHandler.js';
import generateRandomGraph from './public/Utilities/helpers.js';

const chapterHandler = new ChapterHandler();
window.chapterHandler = chapterHandler;

export function addOverlay() {
  d3.select('#main')
    .append('span')
    .attr('id', 'overlay')
    .attr('class', 'overlay')
    .append('div')
    .attr('class', 'loader')
    .attr('id', 'loader');
}

addOverlay();

d3.select(window).on('load', async () => {
  const params = new URLSearchParams(location.search);
  const isChapter = params.has('chapter');
  const chapterIndex = params.get('chapter') - 1;
  const isSandboxPage = params.has('sandbox');
  const isCustomAlgorithmPage = params.has('custom');

  if (params.toString() === '') d3.select('#overlay').remove();
  if (isSandboxPage)
    chapterHandler.goToChapter(
      chapterHandler.chapters[chapterHandler.chapters.length - 1],
      isSandboxPage
    );
  if (isCustomAlgorithmPage)
    chapterHandler.goToChapter(
      chapterHandler.chapters[chapterHandler.chapters.length - 2],
      isSandboxPage,
      isCustomAlgorithmPage
    );
  if (isChapter && chapterIndex < chapterHandler.chapters.length) {
    const currentChapter = chapterHandler.chapters[chapterIndex];
    chapterHandler.goToChapter(currentChapter, false);
  }
});

export const width = document.getElementById('main').offsetWidth;
export const height = document.getElementById('main').offsetHeight;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
const logoContainer = d3
  .select('#main')
  .append('div')
  .attr('class', 'logo-container');

logoContainer
  .append('h1')
  .attr('class', 'homepage-title')
  .text('GraphWidth.com')
  .attr('class', 'homepage-title');

logoContainer
  .append('p')
  .text('An interactive way to learn graph width measures.')
  .attr('class', 'homepage-subtitle');

logoContainer
  .append('button')
  .text('Start Learning')
  .attr('class', 'button')
  .on('click', () => chapterHandler.startFirstLevel());

const svg = d3
  .select('#main')
  .append('svg')
  .attr('width', width)
  .attr('height', height);
const graph = generateRandomGraph(30, 20);

svg
  .selectAll('line')
  .data(graph.links)
  .enter()
  .append('line')
  .style('stroke', 'lightgrey')
  .style('stroke-width', '2.5px');

svg
  .selectAll('circle')
  .data(graph.nodes)
  .enter()
  .append('circle')
  .style('fill', (d) => colors(d.id))
  .attr('r', 20);

const simulation = d3
  .forceSimulation()
  .force('x', d3.forceX(width / 2).strength(0.1))
  .force('y', d3.forceY(height / 2).strength(0.1))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .nodes(graph.nodes)
  .force('charge', d3.forceManyBody().strength(-1100))
  .force(
    'link',
    d3
      .forceLink(graph.links)
      .id((d) => d.id)
      .strength(0.5)
  )
  .on('tick', () => {
    svg
      .selectAll('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    svg
      .selectAll('line')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  });

simulation.force('link').links(graph.links);

const currentTheme = localStorage.getItem('theme')
  ? localStorage.getItem('theme')
  : null;
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);

if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);

  if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
  }
}

function setNavButtons() {
  d3.select('#sandbox-button').on('click', () => {
    chapterHandler.goToChapter(
      chapterHandler.chapters[chapterHandler.chapters.length - 1],
      true
    );
  });

  d3.select('#graph-separator-link').on('click', () => {
    chapterHandler.goToChapter(chapterHandler.chapters[0], false, false, true);
  });

  d3.select('#treewidth-link').on('click', () => {
    chapterHandler.goToChapter(chapterHandler.chapters[1], false, false, true);
  });

  d3.select('#algo-link').on('click', () => {
    chapterHandler.goToChapter(chapterHandler.chapters[2], false, false, true);
  });

  d3.select('#custom-algorithm-button').on('click', () => {
    chapterHandler.goToChapter(
      chapterHandler.chapters[chapterHandler.chapters.length - 2],
      false,
      true
    );
  });
}

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
}

toggleSwitch.addEventListener('change', switchTheme, false);

/* Handle key events */
d3.select('body').on('keydown', () => {
  switch (event.key) {
    case 'ArrowLeft':
      if (window.sectionHandler) window.sectionHandler.goPreviousSection();
      break;
    case 'ArrowRight':
      if (window.sectionHandler) window.sectionHandler.goNextSection();
      break;
    case 'ArrowUp':
      d3.select('#arrow-up').style(
        'animation',
        'animation: pulse-animation 0.5s'
      );
      // d3.select('#arrow-up').classed('pulse', false);
      if (window.niceTreeDecomposition)
        window.niceTreeDecomposition.nextDPStep();
      if (window.isCustomAlgorithm) {
        const N = window.root.descendants().length;
        window.current++;
        if (window.current !== N) window.current %= N;
        eval(window.customFunction);
      }
      break;
    case 'ArrowDown':
      if (window.niceTreeDecomposition)
        window.niceTreeDecomposition.previousDPStep();
      if (window.isCustomAlgorithm) {
        if (window.current === 0) return;
        const N = window.root.descendants().length;
        --window.current;
        window.current %= N;
        eval(window.customFunction);
      }
      break;
    case 'r':
      if (chapterHandler.graph) chapterHandler.handleCreateNewGraph();
      break;
    case 't':
      if (chapterHandler.treeDecomposition)
        chapterHandler.handleComputeTreeDecomposition();
      break;
    case 'n':
      if (chapterHandler.niceTreeDecomposition)
        chapterHandler.handleComputeNiceTreeDecomposition();
      break;
    default:
  }
});

setNavButtons();
