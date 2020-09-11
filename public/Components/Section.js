export default class Section {
  constructor(section, chapter, isActive) {
    this.createSection = section;
    this.chapter = chapter;
    this.isActive = isActive;
  }

  create() {
    this.createSection();
    renderMathInElement(document.body, window.del);
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
    });
  }
}
