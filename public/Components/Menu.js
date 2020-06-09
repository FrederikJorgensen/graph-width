import Roadmap from './Roadmap.js';

export default class Menu {
  constructor() {
    this.container = null;
  }

  draw() {
    const roadmap = new Roadmap();

    this.container = d3.select('#main')
      .append('div')
      .text('Chapters >')
      .attr('class', 'chapters')
      .on('click', () => roadmap.toggle());
  }
}
