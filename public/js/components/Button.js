export default class Button {
  constructor(text, event, id) {
    this.text = text;
    this.event = event;
    this.id = id;
  }

  draw() {
    this.ele = d3.select('.speech-bubble-container').append('g').datum(this);

    const temp = this;

    this.ele
      .append('button')
      .text(this.text)
      .attr('class', 'btn')
      .attr('id', this.id)
      .attr('fill', '#D3D3D3')
      .on('click', () => {
        temp.event();
      });
  }
}
