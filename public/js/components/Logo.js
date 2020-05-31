export default class Logo {
  constructor(x, y) {
    this.container = null;
    this.x = x;
    this.y = y;
  }

  draw() {
    this.container = d3.select('#main')
      .append('span')
      .attr('class', 'logo-background')
      .style('z-index', 2)
      .style('left', `${this.x}px`)
      .style('top', `${this.y}px`);

    this.container
      .append('a')
      .attr('href', '/')
      .text('GraphWidth.com');
  }

  setPosition(x, y) {
    this.container.transition()
      .duration(1000)
      .style('left', `${x}px`)
      .style('top', `${y}px`);
  }

  drawSubheading() {
    this.subHeadingContainer = d3.select('#main')
      .append('span')
      .style('z-index', 2)
      .attr('class', 'yellow-brush-stroke')
      .style('left', `${this.x}px`)
      .style('top', `${this.y + 60}px`);

    this.subHeadingContainer.append('text')
      .attr('class', 'logo-subheading')
      .text('An interactive way to learn graph width measures');
  }
}
