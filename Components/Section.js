import { setNavbarHeight } from '../Utilities/helpers.js'

export default class Section {
  constructor (section, chapter, isActive) {
    this.createSection = section
    this.chapter = chapter
    this.isActive = isActive
  }

  async create () {
    await this.createSection()
    setNavbarHeight()
    d3.select('#overlay').remove()
    d3.select('.overlay').remove()
    window.isSectionLoaded = true
  }
}
