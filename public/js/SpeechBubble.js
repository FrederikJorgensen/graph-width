export default class SpeechBubble {
  constructor() {
    this.xPercentage = -20;
    this.yPercentage = 40;
    this.currentId = 1;
    this.isSolutionShowing = false;
  }

  add(x, y) {
    const speechBubbleContainer = d3.select('#main').append('div').attr('class', 'speech-bubble-container');
    const textContainer = speechBubbleContainer.append('div').attr('class', 'text-container');
    this.textContainer = textContainer;
    this.speechBubbleContainer = speechBubbleContainer;
    this.setPosition(x, y);
  }

  async checkAnswer(answer) {
    if (!this.correctness) {
      const correctness = this.choices.append('div').style('height', '0px').attr('class', 'correctness');
      this.correctness = correctness;
      await this.correctness.transition().duration(500).style('height', '40px').style('fill', 'blue')
        .end();
    }

    if (answer === this.correctAnswer) {
      const correct = this.correctness.text('Correct!');
      correct.append('span').text('check').attr('class', 'material-icons correct-answer');
    } else {
      const wrong = this.correctness.text('Incorrect.');
      wrong.append('span').text('clear').attr('class', 'material-icons wrong-answer');
    }
  }

  addSolution(text) {
    this.solutionText = text;
  }

  createSolutionContainer() {
    const solutionTextContainer = this.speechBubbleContainer.append('div').attr('class', 'solution-text');
    this.solutionTextContainer = solutionTextContainer;
  }

  async toggleSolution() {
    if (this.isSolutionShowing) {
      this.solutionButton.text('Show Solution');
      this.isSolutionShowing = false;
      this.solutionTextContainer.text('');
      this.solutionTextContainer.transition().duration(500).style('height', '0px').end();
    } else {
      this.solutionButton.text('Hide Solution');
      this.isSolutionShowing = true;
      await this.solutionTextContainer.transition().duration(500).style('height', '40px').end();
      this.solutionTextContainer.text(this.solutionText);
    }
  }

  addSolutionButton() {
    const submitContainer = this.speechBubbleContainer
      .append('div')
      .attr('class', 'solution-container');

    this.createSolutionContainer();

    const solutionButton = submitContainer.append('button')
      .text('Show Solution')
      .attr('class', 'btn')
      .attr('id', 'solution-button')
      .on('click', () => this.toggleSolution());

    this.solutionButton = solutionButton;
  }

  addSubmitButton() {
    const submitContainer = this.speechBubbleContainer
      .append('div')
      .attr('class', 'submit-container');

    submitContainer.append('button').text('submit').attr('class', 'btn').on('click', () => this.checkAnswer(this.currentGuess));
  }

  addQuiz() {
    const quiz = this.speechBubbleContainer
      .append('div').attr('class', 'quiz');

    const choices = quiz.append('div').attr('class', 'choices');
    this.choices = choices;
    this.addSubmitButton();
    this.addSolutionButton();
  }

  setCurrentGuess(guess) {
    this.currentGuess = guess;
  }

  addChoice(text, isCorrectAnswer) {
    if (isCorrectAnswer) this.correctAnswer = text;
    const choice = this.choices.append('label').attr('class', 'choice').attr('id', this.currentId++);
    choice.append('input').attr('type', 'radio').attr('checked', 'checked').attr('name', 'radio');
    choice.append('text').text(text).attr('class', 'choice-text');
    choice.on('click', () => {
      this.currentGuess = text;
    });
  }

  setPosition(xPercentage, yPercentage) {
    this.speechBubbleContainer
      .style('position', 'absolute')
      .transition()
      .duration(1000)
      .style('left', `${xPercentage}px`)
      .style('top', `${yPercentage}px`);

    this.xPercentage = xPercentage;
    this.yPercentage = yPercentage;
  }

  async say(text) {
    this.textContainer.text('');

    return new Promise((resolve) => {
      new TypeIt('.text-container', {
        html: true,
        strings: text,
        speed: 10,
        loop: false,
        cursor: false,
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
    if (rows > 1) { height = rows * 30; }
    d3.select('.text-container')
      .style('height', `${height}px`);
  }
}
