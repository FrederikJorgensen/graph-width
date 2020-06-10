/* eslint-disable import/prefer-default-export */

import Chapter from '../Components/Chapter.js';
import Sidebar from '../Components/Sidebar.js';
import SectionHandler from './SectionHandler.js';
import Graph from '../Components/Graph.js';
import Tree from '../Components/Tree.js';

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
            sidebar.addProgresBar();
          }),
        '1. Introduction to Treewidth',
        false,
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
          sidebar.addProgresBar();
        }),
        '2. Graph Separators',
        false,
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
          sidebar.addProgresBar();
        }),
        '3. Tree Decompositions',
        false,
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
          sidebar.addProgresBar();
        }),
        '4. Nice Tree Decompositions',
        false,
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
          sidebar.addProgresBar();
        },
        '5. Algorithms on Tree Decompositions',
        false,
      ),
      new Chapter(
        async () => {
          d3.select('#main').classed('main', false);
          d3.select('#main').classed('main-sandbox', true);

          const graph = new Graph('sandbox-graph');
          const treeDecomposition = new Graph('sandbox-tree-decomposition');
          const niceTreeDecomposition = new Tree('sandbox-nice-tree-decomposition');

          const sandboxSidebarContainer = d3.select('#main')
            .append('div')
            .attr('class', 'sandbox-sidebar-container');

          const sandboxSidebar = sandboxSidebarContainer
            .append('div')
            .attr('class', 'sandbox-sidebar');

          sandboxSidebar
            .append('h2')
            .text('Graph Width Sandbox Mode')
            .style('text-align', 'center')
            .append('hr');

          sandboxSidebar
            .append('text')
            .text('Vertices:     ')
            .append('span')
            .attr('id', 'v')
            .text('0');

          sandboxSidebar
            .append('input')
            .attr('id', 'vertices-slider')
            .attr('type', 'range')
            .attr('min', 0)
            .attr('max', 100)
            .attr('step', 'any')
            .attr('step', '1')
            .attr('value', 0)
            .attr('class', 'slider')
            .on('input', () => {
              const val = document.getElementById('vertices-slider').value;
              d3.select('#v').text(val);
            });

          sandboxSidebar
            .append('text')
            .text('Edges:     ')
            .append('span')
            .attr('id', 'e')
            .text('0');

          sandboxSidebar
            .append('input')
            .attr('id', 'edges-slider')
            .attr('type', 'range')
            .attr('min', 0)
            .attr('max', 100)
            .attr('step', 'any')
            .attr('step', '1')
            .attr('value', 0)
            .attr('class', 'slider')
            .on('input', () => {
              const val = document.getElementById('edges-slider').value;
              d3.select('#e').text(val);
            });

          sandboxSidebar.append('button')
            .text('Random graph')
            .attr('class', 'sandbox-button')
            .on('click', () => {
              treeDecomposition.clear();
              niceTreeDecomposition.clear();
              const numberOfVertices = document.getElementById('vertices-slider').value;
              const numberOfEdges = document.getElementById('edges-slider').value;
              graph.randomGraph(numberOfVertices, numberOfEdges);
            });

          sandboxSidebar
            .append('button')
            .text('Compute tree decomposition')
            .attr('class', 'sandbox-button')
            .on('click', async () => {
              treeDecomposition.clear();
              niceTreeDecomposition.clear();
              await graph.computeTreeDecomposition();
              await graph.readTreeDecomposition();
              const treeDecompositionData = graph.getTreeDecomposition();
              treeDecomposition.loadGraph(treeDecompositionData, 'tree', graph);
            });

          sandboxSidebar
            .append('button')
            .text('Compute nice tree decomposition')
            .attr('class', 'sandbox-button')
            .on('click', async () => {
              niceTreeDecomposition.clear();
              await graph.readNiceTreeDecomposition();
              const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
              niceTreeDecomposition.load(niceTreeDecompositionData);
            });

          sandboxSidebar
            .append('button')
            .text('Clear All')
            .attr('class', 'sandbox-button')
            .on('click', async () => {
              graph.clear();
              treeDecomposition.clear();
              niceTreeDecomposition.clear();
            });

          const sandboxAppContainer = d3.select('#main')
            .append('div')
            .attr('class', 'sandbox-app-container');


          const leftSide = sandboxAppContainer
            .append('div')
            .attr('class', 'left-side');

          const rightSide = sandboxAppContainer
            .append('div')
            .attr('class', 'right-side');

          leftSide
            .append('div')
            .attr('id', 'sandbox-graph');

          leftSide
            .append('div')
            .attr('id', 'sandbox-tree-decomposition');

          rightSide
            .append('div')
            .attr('id', 'sandbox-nice-tree-decomposition');


          graph.randomGraph();

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          console.log('here');
          const treeDecompositionData = graph.getTreeDecomposition();


          treeDecomposition.loadGraph(treeDecompositionData, 'tree', graph);

          await graph.readNiceTreeDecomposition();
          const niceTreeDecompositionData = graph.getNiceTreeDecomposition();

          niceTreeDecomposition.load(niceTreeDecompositionData);
        },

        '6. Sandbox',
      ),
    ];
  }

  startFirstLevel() {
    d3.select('#main').style('flex', 0.95);
    d3.select('.nav').style('flex', 0.05);
    this.currentChapter = this.chapters[0];
    this.createLevel();
  }

  goToChapter(chapter) {
    this.currentChapter = chapter;
    this.createLevel();
  }

  createLevel() {
    d3.select('#main').selectAll('*').remove();
    d3.select('#main')
      .append('div')
      .style('position', 'absolute')
      .style('z-index', 20)
      .style('bottom', '10px')
      .style('right', '10px')
      .append('a')
      .attr('href', 'https://icons8.com/icon/41215/graph-clique')
      .text('Icon by Icons8');
    window.graphContainer = null;
    window.treeContainer = null;
    this.chapters.map((c) => c.isActive = false);
    this.currentChapter.isActive = true;
    this.currentChapter.create();
  }
}
