import { addOverlay } from '../controller.js';
import data from '../data.js';

function g() {
  d3.select('#container').append('div').attr('id', 'graph-container');
  d3.select('#container').append('div').attr('id', 'tree-container');
}

function removeElements() {
  d3.select('#graph-container').selectAll('*').remove();
  d3.select('#tree-container').selectAll('svg').remove();
  d3.select('#container').selectAll('svg').remove();
  d3.select('#dp-container').remove();
  d3.select('#color-table').remove();
  d3.select('#graph-tooltip').remove();
  d3.select('#output-surface').selectAll('*').remove();
  d3.select('#tooltip').remove();
  d3.select('#tooltip-arrow').remove();
  d3.select('#tree1').remove();
  d3.select('#tree2').remove();
  d3.select('#tree3').remove();
  d3.select('#toggle-visibility-button').remove();
  d3.select('#tableX').remove();
}

function removeEverythingExceptLoader() {
  d3.select('#main').selectAll('*:not(#overlay):not(#loader)').remove();
}

function createVisualContainer() {
  d3.select('#app-area').append('div').attr('id', 'container');
}

function createAppAreaContainer() {
  d3.select('#center-container').append('div').attr('id', 'app-area');
}

function createCenterContainer() {
  d3.select('#main').append('div').attr('id', 'center-container');
}

export default class SectionHandler {
  constructor() {
    window.sectionHandler = this;
  }

  setSidebar(sidebar) {
    this.sidebar = sidebar;
  }

  setChapterNumber(chapterNumber) {
    this.currentChapterNumber = chapterNumber;
  }

  setupContainers() {
    createCenterContainer();
    this.sidebar.draw();
    createAppAreaContainer();
    createVisualContainer();
  }

  async createSection() {
    this.currentSectionNumber = this.sections.indexOf(this.currentSection) + 1;
    removeEverythingExceptLoader();
    this.setupContainers();
    this.sidebar.addProgresBar();
    this.sections.map((section) => section.isActive = false);
    addOverlay();
    removeElements();
    this.handleQueryString();
    this.sidebar.setContent(this.currentSection.content);
    this.sidebar.setTitle(this.currentSection.title);
    this.currentSection.isActive = true;
    this.sidebar.updateProgressBar();
    await this.currentSection.create();
  }

  handleQueryString() {
    window.history.replaceState({}, '', '?');
    const params = new URLSearchParams(location.search);
    params.set('chapter', this.currentChapterNumber);
    params.set('section', this.currentSectionNumber);
    params.toString();
    window.history.replaceState({}, '', `?${params.toString()}`);
  }

  async goPreviousSection() {
    if (this.currentSectionNumber - 1 === 0) return;
    this.currentSectionNumber--;
    this.currentSection = this.sections[this.currentSectionNumber - 1];
    await this.createSection();
  }

  async goNextSection() {
    if (this.currentSectionNumber - 1 === this.sections.length - 1) return;
    this.currentSectionNumber++;
    this.currentSection = this.sections[this.currentSectionNumber - 1];
    await this.createSection();
  }

  goToSection(chapterNumber, sectionNumber) {
    this.sections = data.filter((section) => section.chapterNumber === chapterNumber);
    const section = this.sections[sectionNumber - 1];
    this.currentChapterNumber = section.chapterNumber;
    window.currentChapterNumber = this.currentChapterNumber;
    this.currentSection = section;
    this.createSection();
  }
}
