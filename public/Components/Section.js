export default class Section {
  constructor(section, chapter, isActive) {
    this.createSection = section;
    this.chapter = chapter;
    this.isActive = isActive;
  }

  create() {
    this.createSection();
    renderMathInElement(document.body);
  }
}
