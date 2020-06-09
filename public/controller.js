import ChapterHandler from './Handlers/ChapterHandler.js';
import Logo from './Components/Logo.js';
import AbsoButton from './Components/AbsoButton.js';

export const width = document.getElementById('main').offsetWidth;
export const height = document.getElementById('main').offsetHeight;

const chapterHandler = new ChapterHandler();
window.chapterHandler = chapterHandler;

const logo = new Logo(width / 2, height / 2);
logo.draw();
logo.drawSubheading();

function startStudent() {
  logo.setPosition(50, 50);
  chapterHandler.startFirstLevel();
}

const absoButton = new AbsoButton('student', () => startStudent(), 'student-button', (width / 2) - 100, height / 2);
absoButton.draw();
const researcherButton = new AbsoButton('researcher', () => alert('Development still in progress...'), 'student-button', (width / 2) + 100, height / 2);
researcherButton.draw();

d3.select('#main')
  .append('div')
  .style('position', 'absolute')
  .style('z-index', 20)
  .style('bottom', '10px')
  .style('right', '10px')
  .append('a')
  .attr('href', 'https://icons8.com/icon/41215/graph-clique')
  .text('Icon by Icons8');
