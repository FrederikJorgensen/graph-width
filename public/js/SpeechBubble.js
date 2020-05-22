export default class SpeechBubble {
  constructor() {
    // this.xPercentage = 0;
    // this.yPercentage = 0;
  }

  add() {
    const speechBubbleContainer = d3.select('#main').append('div').attr('class', 'text-container');
    this.speechBubbleContainer = speechBubbleContainer;
    const pop = speechBubbleContainer.append('div').attr('class', 'ext-container').attr('id', 'text-content');
    d3.select('.text-container');

    this.pop = pop;
  }

  setPosition(xPercentage, yPercentage) {
    this.speechBubbleContainer
      .style('position', 'absolute')
      .style('left', `${xPercentage}px`)
      .style('top', `${yPercentage}px`);

    this.xPercentage = xPercentage;
    this.yPercentage = yPercentage;
  }

  async say(text) {
    this.updateSpeechContainer(text);

    return new Promise((resolve) => {
      new TypeIt('.text-container', {
        html: true,
        strings: text,
        speed: 20,
        loop: false,
      }).exec(() => {
        setTimeout(resolve, 0);
      }).go();
    });
  }

  updateSpeechContainer(text) {
    let textLength = 0;
    if (Array.isArray(text)) {
      for (let i = 0; i < text.length; i++) {
        textLength += text[i].length;
      }
    } else textLength += text.length;
    const rows = Math.ceil(textLength / 30);
    let height = 50;
    if (rows > 1) { height = rows * 55; }
    d3.select('.text-container')
      .style('width', '300px')
      .style('height', `${height}px`);
    d3.select('.text-container:after')
      .style('top', `${height}px`);
  }
}
