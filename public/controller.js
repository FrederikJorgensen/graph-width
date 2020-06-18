import ChapterHandler from './Handlers/ChapterHandler.js';
import Roadmap from './Components/Roadmap.js';
import SectionHandler from './Handlers/SectionHandler.js';
import Section from './Components/Section.js';
import Graph from './Components/Graph.js';

export const width = document.getElementById('main').offsetWidth;
export const height = document.getElementById('main').offsetHeight;

const chapterHandler = new ChapterHandler();
window.chapterHandler = chapterHandler;


const roadmap = new Roadmap();

const logoContainer = d3.select('#main')
  .append('div')
  .attr('class', 'logo-container');

logoContainer.append('h1')
  .text('GraphWidth.com');

logoContainer.append('h2')
  .text('An interactive way to learn graph width measures.')
  .attr('class', 'subtitle');

logoContainer.append('button')
  .text('Start Learning')
  .attr('class', 'pure-material-button-contained')
  .on('click', () => chapterHandler.startFirstLevel());

d3.select('#main')
  .append('div')
  .style('position', 'absolute')
  .style('z-index', 20)
  .style('bottom', '10px')
  .style('right', '10px')
  .append('a')
  .attr('href', 'https://icons8.com/icon/41215/graph-clique')
  .text('Icon by Icons8');

d3.select('#chapter-button').on('click', () => {
  roadmap.toggle();
});

d3.select('#github-button').on('click', () => {
  window.open(
    'https://github.com/FrederikJorgensen/graph-width-visualizer',
    '_blank',
  );
});

d3.select('#sandbox-button').on('click', () => {
  d3.select('#chapter-button').style('color', '#6d7e8e');
  d3.select('#sandbox-button').style('color', '#1f1f1f');
  chapterHandler.goToChapter(chapterHandler.chapters[chapterHandler.chapters.length - 1], true);
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

d3.select(window).on('load', async () => {
  const params = new URLSearchParams(location.search);
  const hasChapter = params.has('chapter');
  const chapterIndex = params.get('chapter') - 1;
  const hasSandbox = params.has('sandbox');

  if (hasSandbox) {
    chapterHandler.goToChapter(chapterHandler.chapters[chapterHandler.chapters.length - 1], hasSandbox);
  }

  if (hasChapter && chapterIndex < chapterHandler.chapters.length) {
    const currentChapter = chapterHandler.chapters[chapterIndex];
    chapterHandler.goToChapter(currentChapter, false);
  }
});
