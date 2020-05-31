export default class Roadmap {
  constructor() {
    this.chapterHandler = window.chapterHandler;
  }

  show() {
    const data = this.chapterHandler.chapters.concat();

    this.container = d3.select('#main')
      .append('div')
      .attr('class', 'roadmap-container');

    this.container.append('text')
      .attr('class', 'roadmap-title')
      .text('Chapters');

    this.roadmapChapters = this.container.append('div')
      .attr('class', 'roadmap-chapters');

    this.roadmapChapters
      .selectAll('text')
      .data(data)
      .join(
        (enter) => enter.append('text')
          .text((d) => d.name)
          .on('click', (d) => {
            this.visible = false;
            this.hide();
            this.chapterHandler.goToChapter(d);
          }),
        (update) => update.style('background-color', 'red'),
        (exit) => exit.style('background-color', 'red'),
      );
  }

  hide() {
    this.container.remove();
  }

  toggle() {
    if (this.visible) {
      this.visible = false;
      this.hide();
    } else {
      this.visible = true;
      this.show();
    }
  }
}
