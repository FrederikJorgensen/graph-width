import SectionHandler from './Handlers/SectionHandler.js';

const sectionHandler = new SectionHandler();
sectionHandler.goToSection(1);

d3.select('body').on('keydown', () => {
  switch (event.key) {
    case 'ArrowLeft':
      if (window.sectionHandler) window.sectionHandler.goPreviousSection();
      break;
    case 'ArrowRight':
      if (window.sectionHandler) window.sectionHandler.goNextSection();
      break;
    case 'ArrowUp':
      if (window.niceTreeDecomposition) window.niceTreeDecomposition.nextDPStep();
      break;
    case 'ArrowDown':
      if (window.niceTreeDecomposition) window.niceTreeDecomposition.previousDPStep();
      break;
    default:
  }
});
