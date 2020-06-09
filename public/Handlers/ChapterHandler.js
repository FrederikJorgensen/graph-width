/* eslint-disable import/prefer-default-export */

import Chapter from '../Components/Chapter.js';
import Sidebar from '../Components/Sidebar.js';
import SectionHandler from './SectionHandler.js';
import Menu from '../Components/Menu.js';

export default class ChapterHandler {
  constructor() {
    this.currentChapter = 1;
    this.chapters = [

      new Chapter(
        (
          async () => {
            d3.select('#main')
              .append('div')
              .attr('id', 'center-container');

            const sidebar = new Sidebar('Introduction to Treewidth');

            d3.select('#center-container')
              .append('div')
              .attr('id', 'app-area');

            d3.select('#app-area')
              .append('div')
              .attr('id', 'container');

            d3.select('#app-area')
              .append('div')
              .attr('id', 'output');


            const sectionHandler = new SectionHandler(sidebar, 'chapter1');
            sectionHandler.loadFirstSection();
            sidebar.addHandler(sectionHandler);
          }),
        '1. Introduction to Treewidth',
      ),

      new Chapter(
        (async () => {
          d3.select('#main')
            .append('div')
            .attr('id', 'center-container');

          const sidebar = new Sidebar('Graph Separators');

          d3.select('#center-container')
            .append('div')
            .attr('id', 'app-area');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'container');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'output');


          const sectionHandler = new SectionHandler(sidebar, 'chapter2');
          sectionHandler.loadFirstSection();
          sidebar.addHandler(sectionHandler);
        }),
        '2. Graph Separators',
      ),
      new Chapter(
        (async () => {
          d3.select('#main')
            .append('div')
            .attr('id', 'center-container');

          const sidebar = new Sidebar('Tree Decompositions');

          d3.select('#center-container')
            .append('div')
            .attr('id', 'app-area');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'container');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'output');


          const sectionHandler = new SectionHandler(sidebar, 'chapter3');
          sectionHandler.loadFirstSection();
          sidebar.addHandler(sectionHandler);
        }),
        '3. Tree Decompositions',
      ),
      new Chapter(
        (async () => {
          d3.select('#main')
            .append('div')
            .attr('id', 'center-container');

          const sidebar = new Sidebar('Nice Tree Decompositions');

          d3.select('#center-container')
            .append('div')
            .attr('id', 'app-area');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'container');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'output');

          const sectionHandler = new SectionHandler(sidebar, 'chapter4');
          sectionHandler.loadFirstSection();
          sidebar.addHandler(sectionHandler);
        }),
        '4. Nice Tree Decompositions',
      ),
      new Chapter(
        async () => {
          d3.select('#main')
            .append('div')
            .attr('id', 'center-container');

          const sidebar = new Sidebar('Algorithms on Tree Decompositions');

          d3.select('#center-container')
            .append('div')
            .attr('id', 'app-area');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'container');

          d3.select('#app-area')
            .append('div')
            .attr('id', 'output');

          const sectionHandler = new SectionHandler(sidebar, 'chapter5');
          sectionHandler.loadFirstSection();
          sidebar.addHandler(sectionHandler);
        },
        '5. Algorithms on Tree Decompositions',
      ),
    ];
  }

  startFirstLevel() {
    this.currentChapter = this.chapters[0];
    this.createLevel();
  }

  goToChapter(chapter) {
    this.currentChapter = chapter;
    this.createLevel();
  }

  createLevel() {
    d3.select('#main').selectAll('*').remove();

    const menu = new Menu();
    menu.draw();
    this.currentChapter.create();
  }

  addLink(text, chapter) {
    d3.select('#dashboard')
      .append('text')
      .attr('class', 'nav-links')
      .text(text)
      .style('font-size', '30px')
      .on('click', () => this.goToChapter(chapter));
  }
}
