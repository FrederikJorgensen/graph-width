import data from '../data.js';

export default class SectionHandler {
  constructor() {
    this.sections = data;
    window.sectionHandler = this;
  }

  setSidebar(sidebar) {
    this.sidebar = sidebar;
  }

  setChapterNumber(chapterNumber) {
    this.currentChapterNumber = chapterNumber;
  }

  setContent(text) {
    this.content.html(text);
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
    });
  }

  createCenterContainer() {
    this.centerContainer = d3
      .select('#main')
      .append('div')
      .attr('id', 'center-container');
  }

  createVisualContainer() {
    this.visualContainer = d3
      .select('#app-area')
      .append('div')
      .attr('id', 'container');
  }

  createAppAreaContainer() {
    this.appAreaContainer = d3
      .select('#center-container')
      .append('div')
      .attr('id', 'app-area');
  }

  setupContainers() {
    this.createCenterContainer();
    this.createContentContainer();
    this.createContent();
    this.createAppAreaContainer();
    this.createVisualContainer();
  }

  createContentContainer() {
    this.contentContainer = d3
      .select('#center-container')
      .append('div')
      .attr('class', 'content-container');
  }

  createContent() {
    this.content = this.contentContainer
      .append('div');
  }

  removeContainers() {
    if (this.content) this.content.remove();
    if (this.appAreaContainer) this.appAreaContainer.remove();
    if (this.visualContainer) this.visualContainer.remove();
    if (this.centerContainer) this.centerContainer.remove();
  }

  async createSection() {
    this.currentSectionNumber = this.sections.indexOf(this.currentSection) + 1;
    this.removeContainers();
    this.setupContainers();
    this.setContent(this.currentSection.content);
    this.currentSection.isActive = true;
    await this.currentSection.create();
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

  goToSection(sectionNumber) {
    const section = this.sections[sectionNumber - 1];
    this.currentSection = section;
    this.createSection();
  }
}
