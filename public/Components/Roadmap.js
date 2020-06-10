export default class Roadmap {
  constructor() {
    this.chapterHandler = window.chapterHandler;
  }

  show() {
    const data = this.chapterHandler.chapters.concat();

    const w = document.getElementById('body').offsetWidth;
    const h = document.getElementById('body').offsetHeight;

    this.overlay = d3.select('body')
      .append('div')
      .attr('class', 'overlay')
      .attr('id', 'overlay')
      .style('height', `${h}px`)
      .style('width', `${w}px`);
    // .on('click', () => console.log('clicked overlay'));

    this.container = this.overlay
      .append('div')
      .attr('class', 'roadmap-container');

    this.close = this.container
      .append('span')
      .attr('class', 'material-icons roadmap-close')
      .text('close')
      .on('click', () => this.toggle());

    this.container.append('text')
      .attr('class', 'roadmap-title')
      .text('Chapters')
      .append('hr')
      .style('background-color', 'rgb(51, 51, 51)');

    this.roadmapChapters = this.container.append('div')
      .attr('class', 'roadmap-chapters');

    this.roadmapChapters
      .selectAll('text')
      .data(data)
      .join(
        (enter) => enter.append('text')
          .text((d) => d.name)
          .attr('class', (d) => (d.isActive ? 'roadmap-item-active' : 'roadmap-item'))
          .on('click', (d) => {
            this.visible = false;
            this.hide();
            this.chapterHandler.goToChapter(d);
          }),
        (update) => update,
        (exit) => exit.remove(),
      );
  }

  hide() {
    this.overlay.remove();
    this.container.remove();
  }

  toggle() {
    if (this.visible) {
      d3.select('#chapter-button').style('color', '#6d7e8e');
      this.visible = false;
      this.hide();
    } else {
      d3.select('#chapter-button').style('color', '#1f1f1f');
      this.visible = true;
      this.show();
    }
  }
}
