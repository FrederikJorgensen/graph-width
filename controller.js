import Sidebar from './Components/Sidebar.js';
import SectionHandler from './Handlers/SectionHandler.js';

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
  const sectionNumber = params.get('section');
  if (params.toString() === '') d3.select('#overlay').remove();
  const sectionHandler = new SectionHandler();
  const sidebar = new Sidebar();
  sectionHandler.setSidebar(sidebar);
  sectionHandler.goToSection(1, sectionNumber);
});

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
        'animation: pulse-animation 0.5s',
      );
      if (window.niceTreeDecomposition) window.niceTreeDecomposition.nextDPStep();
      break;
    case 'ArrowDown':
      if (window.niceTreeDecomposition) window.niceTreeDecomposition.previousDPStep();
      break;
    default:
  }
});