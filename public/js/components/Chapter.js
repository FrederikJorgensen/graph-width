export default class Chapter {
  constructor(chapter, name) {
    this.createChapter = chapter;
    this.name = name;
  }

  create() {
    this.createChapter();
  }
}
