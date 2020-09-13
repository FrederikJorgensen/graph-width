import { setNavbarHeight } from '../Utilities/helpers.js';

function later(delay) {
  return new Promise(((resolve) => {
    setTimeout(resolve, delay);
  }));
}

export default class Section {
  constructor(section, chapter, isActive) {
    this.createSection = section;
    this.chapter = chapter;
    this.isActive = isActive;
  }

  async create() {
    await this.createSection();
    setNavbarHeight();
    // await later(5000);
    d3.select('#overlay').remove();
  }
}
