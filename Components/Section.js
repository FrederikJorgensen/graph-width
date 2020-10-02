import { setNavbarHeight } from '../Utilities/helpers.js';

export default class Section {
  constructor(content, createSection, chapterNumber, title) {
    this.content = content;
    this.createSection = createSection;
    this.chapterNumber = chapterNumber;
    this.title = title;
  }

  async create() {
    await this.createSection();
    setNavbarHeight();
    d3.select('#overlay').remove();
    d3.select('.overlay').remove();
    window.isSectionLoaded = true;
  }
}
