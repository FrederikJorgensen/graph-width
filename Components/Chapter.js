export default class Chapter {
  constructor (chapter, name, isActive) {
    this.createChapter = chapter
    this.name = name
    this.isActive = isActive
  }

  create () {
    this.createChapter()
  }
}
