export default class Sidebar {
  constructor(title) {
    this.title = title;
    this.draw();
    this.setTitle(this.title);
    this.addContentArea();
  }

  clear() {
    d3.selectAll('.button-container').remove();
    d3.select('.quiz').remove();
    if (this.exerciseContainer) this.exerciseContainer.remove();
  }

  addExercise(exercise) {
    const exerciseContainer = this.contentContainer.append('div').attr('class', 'exercise-box');
    this.exerciseContainer = exerciseContainer;

    const exerciseContent = this.exerciseContainer.append('div').html(`<strong class="exercise-title">Exercise:</strong> ${exercise}`);
    this.exerciseContent = exerciseContent;
  }

  removeCorrectness() {
    if (this.correctness) this.correctness.remove();
  }

  addCorrectness() {
    const correctness = this.choices.append('div').style('height', '0px').attr('class', 'correctness');
    this.correctness = correctness;
  }

  toggleSolution() {
    if (this.isSolutionShowing) {
      this.solutionButton.text('Show Solution');
      this.isSolutionShowing = false;
      this.solutionTextContainer.text(null);
      this.solutionTextContainer.transition().duration(100).style('height', '0px');
    } else {
      this.solutionButton.text('Hide Solution');
      this.isSolutionShowing = true;
      this.solutionTextContainer.transition().duration(100).style('height', '40px');
      this.solutionTextContainer.text(this.solutionText);
    }
  }

  async checkAnswer(answer) {
    this.removeCorrectness();
    this.addCorrectness();

    await this.correctness
      .transition()
      .duration(350)
      .style('height', '40px').style('fill', 'blue')
      .end();

    if (answer === this.correctAnswer) {
      const correct = this.correctness.text('Correct!');
      correct.append('span').text('check').attr('class', 'material-icons correct-answer');
    } else {
      const wrong = this.correctness.text('Incorrect.');
      wrong.append('span').text('clear').attr('class', 'material-icons wrong-answer');
    }
  }

  addSubmitButton() {
    const submitContainer = this.quiz
      .append('div')
      .attr('class', 'submit-container');

    this.submitContainer = submitContainer;

    const submitButton = this.submitContainer
      .append('button')
      .text('submit')
      .attr('class', 'pure-material-button-contained')
      .on('click', () => this.checkAnswer(this.currentGuess));

    this.submitButton = submitButton;
  }

  createSolutionContainer() {
    const solutionTextContainer = this.quiz.append('div').attr('class', 'solution-text');
    this.solutionTextContainer = solutionTextContainer;
  }

  addSolutionButton() {
    const solutionButtonContainer = this.quiz
      .append('div')
      .attr('class', 'solution-container');

    this.solutionButtonContainer = solutionButtonContainer;

    this.createSolutionContainer();

    const solutionButton = this.solutionButtonContainer.append('button')
      .text('Show Solution')
      .attr('class', 'pure-material-button-contained')
      .attr('id', 'solution-button')
      .on('click', () => this.toggleSolution());

    this.solutionButton = solutionButton;
  }

  addQuiz() {
    const quiz = this.contentContainer
      .append('div')
      .attr('class', 'quiz');

    this.quiz = quiz;
    const choices = this.quiz.append('div').attr('class', 'choices');
    this.choices = choices;
    this.addSubmitButton();
    this.addSolutionButton();
  }

  addChoice(text, isCorrectAnswer) {
    if (isCorrectAnswer) this.correctAnswer = text;
    const choice = this.choices.append('label').attr('class', 'choice').attr('id', this.currentId++);
    choice.append('input').attr('type', 'radio').attr('name', 'radio');
    choice.append('text').text(text).attr('class', 'choice-text');
    choice.on('click', () => {
      this.currentGuess = text;
    });
  }

  addSolution(text) {
    this.solutionText = text;
  }

  addButton(buttonText, event) {
    const buttonContainer = this.contentContainer
      .append('div')
      .attr('class', 'button-container')
      .append('g')
      .datum(this);

    this.buttonContainer = buttonContainer;

    this.buttonContainer
      .append('button')
      .text(buttonText)
      .attr('class', 'pure-material-button-contained')
      .on('click', () => {
        event();
      });
  }

  setTitle(title) {
    this.sidebarContainer
      .append('h2')
      .text(title)
      .attr('class', 'chapter-title');

    this.sidebarContainer
      .append('hr');
  }

  addHandler(handler) {
    this.sectionHandler = handler;
  }

  draw() {
    const sidebarContainer = d3.select('#center-container')
      .append('div')
      .attr('class', 'sidebar');

    this.sidebarContainer = sidebarContainer;
  }

  addProgresBar() {
    const { sections } = this.sectionHandler;
    this.sections = sections;

    this.progressBarContainer = this.sidebarContainer
      .append('div')
      .attr('class', 'progress-bar-container');

    this.progressBarContainer
      .append('span')
      .attr('class', 'material-icons nav-arrows')
      .text('keyboard_arrow_left')
      .on('click', () => this.sectionHandler.goPreviousSection());

    const w = 100 / sections.length;

    this.progressBarContainer
      .selectAll('div')
      .data(sections)
      .join(
        (enter) => enter
          .append('div')
          .attr('class', (d) => (d.isActive ? 'progress-item-active' : 'progress-item'))
          .style('width', `${w}%`)
          .on('click', (d) => this.sectionHandler.goToSection(d)),
        (update) => update,
        (exit) => exit.remove(),
      );

    this.progressBarContainer
      .append('span')
      .attr('class', 'material-icons nav-arrows')
      .text('keyboard_arrow_right')
      .on('click', () => this.sectionHandler.goNextSection());
  }

  updateProgressBar() {
    if (!this.progressBarContainer) return;
    this.progressBarContainer
      .selectAll('div')
      .data(this.sections)
      .join(
        (enter) => enter,
        (update) => update.attr('class', (d) => (d.isActive ? 'progress-item-active' : 'progress-item')),
        (exit) => exit.remove(),
      );
  }

  addNavButtons() {
    const navButtonsContainer = this.sidebarContainer
      .append('div')
      .attr('class', 'nav-buttons-container');

    this.navButtonsContainer = navButtonsContainer;

    this.navButtonsContainer
      .append('span')
      .attr('class', 'material-icons nav-arrows')
      .text('keyboard_arrow_left')
      .on('click', () => this.sectionHandler.goPreviousSection());

    this.navButtonsContainer
      .append('span')
      .attr('class', 'material-icons nav-arrows')
      .text('keyboard_arrow_right')
      .on('click', () => this.sectionHandler.goNextSection());
  }

  addContentArea() {
    const contentContainer = this.sidebarContainer.append('div').attr('class', 'content-container');
    this.contentContainer = contentContainer;

    const content = this.contentContainer.append('div').attr('class', 'content');
    this.content = content;
  }

  addContent(text) {
    this.content.html(text);
  }
}
