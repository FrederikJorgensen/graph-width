/* eslint-disable no-return-assign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-eval */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line no-unused-vars

import Chapter from '../Components/Chapter.js';
import Sidebar from '../Components/Sidebar.js';
import SectionHandler from './SectionHandler.js';
import Graph from '../Components/Graph.js';
import Tree from '../Components/Tree.js';
import TreeDecomposition from '../Components/TreeDecomposition.js';
import { getAllSubsets, setNavbarHeight } from '../Utilities/helpers.js';

function removeEverythingExceptLoader() {
  d3.select('#main').selectAll('*:not(#overlay):not(#loader)').remove();
}

function createOutputContainer() {
  d3.select('#app-area').append('div').attr('id', 'output');
}

function createVisualContainer() {
  d3.select('#app-area').append('div').attr('id', 'container');
}

function createAppAreaContainer() {
  d3.select('#center-container').append('div').attr('id', 'app-area');
}

function createCenterContainer() {
  d3.select('#main').append('div').attr('id', 'center-container');
}

export default class ChapterHandler {
  constructor() {
    this.currentChapter = 1;
    this.chapters = [
      new Chapter(async () => {}, 'Graph Separators', false),
      new Chapter(
        async () => {
          d3.select('#container').append('div').attr('id', 'graph-container');
          d3.select('#container').append('div').attr('id', 'tree-container');
        },
        'Treewidth & Tree Decompositions',
        false,
      ),
      new Chapter(async () => {}, 'Algorithms on Tree Decompositions', false),
      new Chapter(async () => {
        const customLeft = d3
          .select('#main')
          .append('div')
          .attr('class', 'custom-left');

        customLeft
          .append('div')
          .attr('id', 'custom-graph')
          .attr('class', 'custom-graph');

        const codeBlock = customLeft
          .append('div')
          .attr('class', 'code-block-container');

        const customCodeAreaContainer = codeBlock
          .append('div')
          .attr('class', 'custom-code-container');

        const codeHeader = customCodeAreaContainer
          .append('div')
          .attr('class', 'code-header');

        const customCodeArea = customCodeAreaContainer
          .append('div')
          .attr('class', 'custom-sidebar');

        const customRight = d3
          .select('#main')
          .append('div')
          .attr('class', 'custom-right');

        const customNiceTreeContainer = customRight
          .append('div')
          .attr('class', 'custom-nice-tree-container');

        customNiceTreeContainer.append('div').attr('id', 'custom-nice-tree');

        const graph = new Graph('custom-graph');
        graph.randomGraph();
        const niceTreeDecomposition = new Tree('custom-nice-tree');
        await graph.computeTreeDecomposition();
        await graph.readNiceTreeDecomposition();
        const niceTdData = graph.getNiceTreeDecomposition();
        niceTreeDecomposition.load(niceTdData);
        niceTreeDecomposition.addTooltip();
        niceTreeDecomposition.addArrow();

        customCodeArea
          .append('textarea')
          .attr('id', 'editor')
          .text(
            'switch(type){\n case "leaf":\n //Your code for a leaf node.\n break;\n\n case "introduce":\n // Your code for an introduce node.\n break;\n\n case "forget":\n //Your code for a forget node.\n break;\n\n case "join":\n // Your code for a join node.\n break;\n}',
          );

        const editor = CodeMirror.fromTextArea(
          document.getElementById('editor'),
          {
            mode: 'javascript',
            theme: 'material-palenight',
            lineNumbers: true,
            autoCloseBrackets: true,
          },
        );

        editor.setSize('100%', '100%');
        const root = niceTreeDecomposition.getRoot();
        niceTreeDecomposition.addTooltip();
        let current = 0;
        let customFunction = '';
        editor.on('change', () => {
          const userInput = editor.getValue();

          customFunction = `
            let i = 1;
            
            root.eachAfter((currentNode) => {
              if (current !== i++) return;

              niceTreeDecomposition.animateNode(currentNode);
              niceTreeDecomposition.animateLink(currentNode);

              const node = currentNode.data;

              let type = '';

              if ('children' in node === false) type = 'leaf';
              else if (node.children.length === 2) type = 'join';
              else if (node.vertices.length > node.children[0].vertices.length) type = 'introduce';
              else if (node.vertices.length < node.children[0].vertices.length) type = 'forget';

              ${userInput}

              niceTreeDecomposition.dpTable(node);
             })`;
        });

        const defaultString = 'switch(type){\n case "leaf":\n //Your code for a leaf node.\n break;\n\n case "introduce":\n // Your code for an introduce node.\n break;\n\n case "forget":\n //Your code for a forget node.\n break;\n\n case "join":\n // Your code for a join node.\n break;\n}';

        const formattedHamiltonian = js_beautify(defaultString, {
          indent_size: 2,
        });
        editor.setValue(formattedHamiltonian);

        codeHeader
          .append('span')
          .text('replay')
          .attr('class', 'material-icons code-buttons')
          .on('click', () => editor.setValue(defaultString));

        const controlsContainer = customRight
          .append('div')
          .attr('class', 'custom-control-area');

        const cc = controlsContainer
          .append('div')
          .attr('class', 'custom-controls');

        cc.append('span')
          .text('keyboard_arrow_left')
          .attr('class', 'material-icons pagination-arrows')
          .on('click', () => {
            if (current === 0) return;
            const N = root.descendants().length;
            --current;
            current %= N;
            eval(customFunction);
          });

        cc.append('span')
          .text('keyboard_arrow_right')
          .attr('class', 'material-icons pagination-arrows')
          .on('click', () => {
            const N = root.descendants().length;
            current++;
            if (current !== N) current %= N;
            eval(customFunction);
          });

        renderMathInElement(document.body);
      }, 'Create Custom Algorithm', false),
      new Chapter(
        async () => {
          let graphLoaded = false;
          let treeDecompositionLoaded = false;

          const graph = new Graph('sandbox-graph');
          const treeDecomposition = new Graph('sandbox-tree-decomposition');
          const niceTreeDecomposition = new Tree(
            'sandbox-nice-tree-decomposition',
            'nice',
            graph,
          );

          const td = new TreeDecomposition('sandbox-tree-decomposition', graph);

          const sandboxSidebar = d3
            .select('#main')
            .append('div')
            .attr('class', 'sandbox-sidebar-container');

          sandboxSidebar
            .append('input')
            .attr('value', 15)
            .attr('id', 'vertices-number')
            .attr('class', 'controls-number');

          sandboxSidebar
            .append('input')
            .attr('value', 15)
            .attr('id', 'edges-number')
            .attr('class', 'controls-number');

          sandboxSidebar
            .append('div')
            .attr('data-tooltip', 'Reload a random graph')
            .attr('class', 'big')
            .append('span')
            .text('replay')
            .attr('class', 'material-icons md-48')
            .on('click', () => {
              if (treeDecomposition.svg) treeDecomposition.clear();
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();

              const numberOfVertices = document.getElementById(
                'vertices-number',
              ).value;
              const numberOfEdges = document.getElementById('edges-number')
                .value;
              graph.randomGraph(numberOfVertices, numberOfEdges);
              graphLoaded = true;
            });

          sandboxSidebar
            .append('div')
            .attr('data-tooltip', 'Draw your own graph')
            .attr('class', 'big')
            .append('span')
            .text('palette')
            .attr('class', 'material-icons md-48')
            .on('click', () => {
              graph.enableDrawing();
              graphLoaded = true;
            });

          sandboxSidebar
            .append('div')
            .attr(
              'data-tooltip',
              'Compute a tree decomposition of the current graph',
            )
            .attr('class', 'big')
            .append('span')
            .text('device_hub')
            .attr('id', 'compute-td-button')
            .attr('class', 'material-icons md-48')
            .on('click', async () => {
              if (!graphLoaded) return;
              if (treeDecomposition.svg) treeDecomposition.clear();
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();
              await graph.computeTreeDecomposition();
              await graph.readTreeDecomposition();
              const treeDecompositionData = graph.getTreeDecomposition();
              treeDecomposition.loadGraph(treeDecompositionData, 'tree', graph);
              treeDecompositionLoaded = true;
            });

          sandboxSidebar
            .append('div')
            .attr('data-tooltip', 'Compute a nice tree decomposition')
            .attr('class', 'big')
            .append('span')
            .text('timeline')
            .attr('id', 'compute-nicetd-button')
            .attr('class', 'material-icons md-48')
            .on('click', async () => {
              if (!treeDecompositionLoaded) return;
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();
              await graph.readNiceTreeDecomposition();
              const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
              niceTreeDecomposition.load(niceTreeDecompositionData);
            });

          sandboxSidebar
            .append('div')
            .attr('data-tooltip', 'Clear all')
            .attr('class', 'big')
            .append('span')
            .text('clear')
            .attr('class', 'material-icons md-48')
            .on('click', async () => {
              this.graph = d3
                .select('#algo-text')
                .text('Current Algorithm = None Selected');
              if (graph.svg) graph.clear();
              if (td) td.clear();
              d3.select('#output').html(null);
              if (treeDecomposition.svg) treeDecomposition.clear();
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();
              if (niceTreeDecomposition.colorTable) niceTreeDecomposition.removeColorTable();
              if (niceTreeDecomposition.tooltip) niceTreeDecomposition.removeMisTable();
              graphLoaded = false;
              treeDecompositionLoaded = false;
            });

          const sandboxAppContainer = d3
            .select('#main')
            .append('div')
            .attr('class', 'sandbox-app-container');

          const leftSide = sandboxAppContainer
            .append('div')
            .attr('class', 'left-side');

          const rightSide = sandboxAppContainer
            .append('div')
            .attr('class', 'right-side');

          const sandBoxGraphContainer = leftSide
            .append('div')
            .attr('class', 'sandbox-graph-container');

          sandBoxGraphContainer
            .append('div')
            .attr('class', 'text-c')
            .append('text')
            .text('Graph')
            .attr('class', 'container-text');

          sandBoxGraphContainer
            .append('div')
            .attr('id', 'sandbox-graph')
            .attr('class', 'surface');

          const sandBoxTreeContainer = leftSide
            .append('div')
            .attr('class', 'sandbox-graph-container');

          sandBoxTreeContainer
            .append('div')
            .attr('class', 'text-c')
            .append('text')
            .text('Tree Decomposition')
            .attr('class', 'container-text');

          sandBoxTreeContainer
            .append('div')
            .attr('class', 'surface')
            .attr('id', 'sandbox-tree-decomposition');

          const niceTreeContainer = rightSide
            .append('div')
            .attr('class', 'nice-tree-container');

          niceTreeContainer
            .append('div')
            .attr('class', 'text-c')
            .append('text')
            .text('Nice Tree Decomposition')
            .attr('class', 'container-text');

          niceTreeContainer
            .append('div')
            .attr('class', 'surface')
            .attr('id', 'sandbox-nice-tree-decomposition');
        },

        '6. Sandbox',
      ),
    ];
  }

  startFirstLevel() {
    setNavbarHeight();
    this.currentChapter = this.chapters[0];
    this.createChapter();
  }

  goToChapter(chapter, isSandbox, isCustom, navLink) {
    if (isSandbox) {
      setNavbarHeight();
      window.history.replaceState({}, '', '?');
      d3.select('#main').selectAll('*').remove();
      d3.select('.nav-links').style('opacity', 1);
      window.history.replaceState({}, '', '');
      const params = new URLSearchParams(location.search);
      params.set('sandbox', 'true');
      window.history.replaceState({}, '', `?${params.toString()}`);
      chapter.create();
      return;
    }

    if (isCustom) {
      setNavbarHeight();
      d3.select('#main').selectAll('*').remove();
      d3.select('.nav-links').style('opacity', 1);
      window.history.replaceState({}, '', '?');
      window.history.replaceState({}, '', '');
      const params = new URLSearchParams(location.search);
      params.set('custom', 'true');
      window.history.replaceState({}, '', `?${params.toString()}`);
      chapter.create();
      return;
    }

    if (navLink) {
      window.history.replaceState({}, '', '?');
      window.history.replaceState({}, '', '');
    }

    this.currentChapter = chapter;
    this.createChapter();
  }

  createChapter() {
    removeEverythingExceptLoader();
    window.graphContainer = null;
    window.treeContainer = null;
    createCenterContainer();
    const sidebar = new Sidebar(this.currentChapter.name);
    createAppAreaContainer();
    createVisualContainer();
    createOutputContainer();
    this.currentChapter.create();
    const params = new URLSearchParams(location.search);
    const currentSectionIndex = params.get('section') - 1;
    const chapterNumber = this.chapters.indexOf(this.currentChapter) + 1;
    const chapterNumberString = `chapter${chapterNumber}`;
    const sectionHandler = new SectionHandler(sidebar, chapterNumberString);
    this.sectionHandler = sectionHandler;
    const currentSection = this.sectionHandler.sections[currentSectionIndex];
    if (
      params.get('section') > 0
      && currentSectionIndex < sectionHandler.sections.length
    ) {
      sectionHandler.goToSection(currentSection);
    } else {
      sectionHandler.loadFirstSection();
    }
    sidebar.addHandler(sectionHandler);
    sidebar.addProgresBar();
    this.chapters.map((c) => (c.isActive = false));
    this.currentChapter.isActive = true;
  }
}
