export default class Section {
  constructor(section, chapter) {
    this.createSection = section;
    this.chapter = chapter;
  }

  create() {
    this.createSection();
    renderMathInElement(document.body);
  }
}
