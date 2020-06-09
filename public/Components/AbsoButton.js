export default class AbsoButton {
  constructor(text, event, id, x, y) {
    this.text = text;
    this.event = event;
    this.id = id;
    this.x = x;
    this.y = y;
  }

  draw() {
    this.container = d3.select('#main').append('g').datum(this);

    const temp = this;

    this.container
      .append('button')
      .style('position', 'absolute')
      .style('transform', 'translate(-50%, -50%)')
      .style('width', '125px')
      .style('z-index', 2)
      .style('left', `${this.x}px`)
      .style('top', `${this.y + 100}px`)
      .text(this.text)
      .attr('class', 'btn')
      .attr('id', this.id)
      .attr('fill', '#D3D3D3')
      .on('click', () => {
        temp.event();
      });
  }
}
