export default class Sidebar {
  constructor(title) {
    this.title = title;
    this.draw();
    this.addTitleContainer();
    this.addTitle(this.title);
    this.addHorizontalLine();
    this.addContentArea();
  }

  clear() {
    this.content.html(null);
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
      .attr('class', 'button')
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
      .attr('class', 'button')
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
      .html(buttonText)
      .attr('class', 'button')
      .on('click', () => {
        event();
      });
  }

  addTitleContainer() {
    const titleContainer = this.sidebarContainer
      .append('div')
      .attr('class', 'sidebar-title-container');
    this.titleContainer = titleContainer;
  }

  addHorizontalLine() {
    this.titleContainer
      .append('hr')
      .attr('class', 'new4');
  }

  addTitle(title) {
    this.titleContainer
      .append('h3')
      .text(title)
      .attr('class', 'chapter-title');
  }

  setTitle(title) {
    d3.select('.chapter-title').html(title);
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
    const width = 100 / sections.length;

    this.addProgressBarContainer();
    this.addLeftPaginationArrow();
    this.addPaginationRectangles(sections, width);
    this.addRightPaginationArrow();
  }

  addProgressBarContainer() {
    this.progressBarContainer = this.sidebarContainer
      .append('div')
      .attr('class', 'progress-bar-container');
  }

  addRightPaginationArrow() {
    this.progressBarContainer
      .append('span')
      .attr('class', 'material-icons pagination-arrows')
      .text('keyboard_arrow_right')
      .on('click', () => this.sectionHandler.goNextSection());
  }

  addPaginationRectangles(sections, width) {
    this.progressBarContainer
      .selectAll('div')
      .data(sections)
      .join(
        (enter) => enter
          .append('div')
          .attr('class', (d) => (d.isActive ? 'progress-item-active' : 'progress-item'))
          .style('width', `${width}%`)
          .on('click', (section) => this.sectionHandler.goToSection(section)),
        (update) => update,
        (exit) => exit.remove(),
      );
  }

  addLeftPaginationArrow() {
    this.progressBarContainer
      .append('span')
      .attr('class', 'material-icons pagination-arrows')
      .text('keyboard_arrow_left')
      .on('click', () => this.sectionHandler.goPreviousSection());
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
