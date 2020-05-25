export default class Quiz {
  constructor() {

  }

  setPosition(x, y) {
    this.quizContainer
      .style('position', 'absolute')
      .transition()
      .duration(1000)
      .style('height', '500px')
      .style('width', '250px')
      .style('left', `${x}px`)
      .style('top', `${y}px`);
  }

  addShowSolutionButton() {
    const solutionContainer = this.quizContainer
      .append('div')
      .attr('class', 'solution-container');

    solutionContainer.append('button').text('Show solution');
  }


  addSubmitButton() {
    const submitContainer = this.quizContainer
      .append('div')
      .attr('class', 'submit-container');

    submitContainer.append('button').text('submit');
  }

  add() {
    const quizContainer = d3.select('#main').append('div').attr('id', 'quiz');
    this.quizContainer = quizContainer;

    const choices = this.quizContainer.append('div').attr('class', 'choices');
    this.choices = choices;

    this.addSubmitButton();
    this.addShowSolutionButton();
  }

  addChoice(text) {
    const choice = this.choices.append('div').attr('class', 'choice');

    choice.append('text').text(text);
  }
}
