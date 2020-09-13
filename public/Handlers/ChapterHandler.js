/* eslint-disable no-return-assign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-eval */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line no-unused-vars

import Chapter from '../Components/Chapter.js';
import Sidebar from '../Components/Sidebar.js';
import Graph from '../Components/Graph.js';
import Tree from '../Components/Tree.js';
import SectionHandler from './SectionHandler.js';
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

function createSandboxGrid() {
  d3.select('#main')
    .append('div')
    .attr('class', 'sandbox-grid');
}

function createNiceTreeDecompositionContainer() {
  d3.select('.sandbox-grid')
    .append('div')
    .attr('class', 'card card-tall')
    .attr('id', 'nice-tree-decomposition-container');
}

function createTreeDecompositionContainer() {
  d3.select('.sandbox-grid')

    .append('div')
    .attr('class', 'card')
    .attr('id', 'tree-decomposition-container');
}

function createGraphContainer() {
  d3.select('.sandbox-grid')
    .append('div')
    .attr('class', 'card')
    .attr('id', 'sandbox-graph-container');
}

function createGraphButtonContainer() {
  d3.select('#sandbox-graph-container')
    .append('div')
    .attr('class', 'graph-buttons-container');
}

function createDefaultCodeEditorString() {
  return `
  switch(type){
    case "leaf":
    // Example of how to set the dynamic programming tabl.
    node.table['{1,2}'] = true
    //Your code for a leaf node.
    break;
    case "introduce":
    // Your code for an introduce node.
    break;
    case "forget":
    //Your code for a forget node.
    break;
    case "join":
    // Your code for a join node.
    break;
  }
  /* 
    You can control what's shown in the dynamic programming table by
    changing the node.table object.
    Example node.table['{1,2}'] = true.
    Will show the table with '{1,2}' in the first column
    and 'true' in the second column
  */
  `;
}

function createCustomAlgorithmNiceTreeDecompositionContainer() {
  d3.select('.custom-algorithm-grid')
    .append('div')
    .attr('class', 'card card-tall')
    .attr('id', 'nice-tree-decomposition-container');
}

function createCustomAlgorithmCodeEditorContainer() {
  const neww = d3.select('.custom-algorithm-grid')
    .append('div')
    .attr('class', 'card code-card');

  neww.append('div')
    .attr('class', 'code-header');

  neww.append('div')
    .attr('class', 'code-container')
    .attr('id', 'code-editor');
}

function createCustomAlgorithmGraphContainer() {
  d3.select('.custom-algorithm-grid')
    .append('div')
    .attr('class', 'card')
    .attr('id', 'custom-graph');
}

function createCustomAlgorithmGrid() {
  d3.select('#main').append('div').attr('class', 'custom-algorithm-grid');
}

function createCodeEditor(formattedDeaultCodeEditorString) {
  d3.select('#code-editor')
    .append('textarea')
    .attr('id', 'editor')
    .text(formattedDeaultCodeEditorString);
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
        window.isCustomAlgorithm = true;
        createCustomAlgorithmGrid();

        d3.se;

        createCustomAlgorithmCodeEditorContainer();
        createCustomAlgorithmGraphContainer();
        createCustomAlgorithmNiceTreeDecompositionContainer();
        const defaultCodeEditorString = createDefaultCodeEditorString();
        const formattedDeaultCodeEditorString = js_beautify(defaultCodeEditorString, { indent_size: 2 });
        createCodeEditor(formattedDeaultCodeEditorString);

        const codeEditor = CodeMirror.fromTextArea(
          document.getElementById('editor'),
          {
            mode: 'javascript',
            theme: 'material-palenight',
            lineNumbers: true,
            autoCloseBrackets: true,
          },
        );

        codeEditor.setSize('100%', '100%');

        const graph = new Graph('custom-graph');
        graph.randomGraph();
        const niceTreeDecomposition = new Tree('nice-tree-decomposition-container');
        niceTreeDecomposition.setGraph(graph);
        window.niceTreeDecomposition = niceTreeDecomposition;
        await graph.computeTreeDecomposition();
        await graph.readNiceTreeDecomposition();
        const niceTdData = graph.getNiceTreeDecomposition();
        niceTreeDecomposition.load(niceTdData);
        niceTreeDecomposition.addArrow();

        const root = niceTreeDecomposition.getRoot();
        window.root = root;

        window.current = 0;

        let customFunction = '';
        codeEditor.on('change', () => {
          const userInput = codeEditor.getValue();

          customFunction = `
            let i = 0;

            root.eachAfter((currentNode) => {
              if (window.current !== ++i) return;
              const node = currentNode.data;
              const subTree = niceTreeDecomposition.getSubTree(niceTreeDecomposition.root, node);
              const inducedSubgraph = niceTreeDecomposition.graph.createSubgraph(subTree);
              niceTreeDecomposition.graph.highlightSubGraph(inducedSubgraph);
              node.table = {};

              let type = '';

              if ('children' in node === false) type = 'leaf';
              else if (node.children.length === 2) type = 'join';
              else if (node.vertices.length > node.children[0].vertices.length) type = 'introduce';
              else if (node.vertices.length < node.children[0].vertices.length) type = 'forget';

              ${userInput}

              const htmlString = niceTreeDecomposition.createCustomAlgorithmHtmlTableString(node.table);
              niceTreeDecomposition.moveTableArrow(node);
              niceTreeDecomposition.moveTable(htmlString);
             })`;

          window.customFunction = customFunction;
        });

        d3.select('#nice-tree-decomposition-container')
          .append('span')
          .text('keyboard_arrow_right')
          .attr('class', 'material-icons pagination-arrows')
          .attr('id', 'test')
          .on('click', () => {
            const N = root.descendants().length;
            window.current++;
            if (window.current !== N) window.current %= N;
            eval(customFunction);
          });
      }, 'Create Custom Algorithm', false),
      new Chapter(
        async () => {
          createSandboxGrid();
          createGraphContainer();
          createTreeDecompositionContainer();
          createNiceTreeDecompositionContainer();

          const graph = new Graph('sandbox-graph-container');
          this.graph = graph;

          const treeDecomposition = new Graph('tree-decomposition-container');
          this.treeDecomposition = treeDecomposition;

          const niceTreeDecomposition = new Tree('nice-tree-decomposition-container');
          this.niceTreeDecomposition = niceTreeDecomposition;

          // createInputForVertices();
          // createInputForEdges();
          // this.createClearAllButton(sandboxSidebar, graph, td, treeDecomposition, niceTreeDecomposition);
          this.createGraphButtons();
          this.createComputeTreeDecompositionButton();
          this.createComputeNiceTreeDecompositionButton();
        },

        '6. Sandbox',
      ),
    ];
  }

  createGraphButtons() {
    createGraphButtonContainer();
    this.createReloadGraphButton();
    this.createDrawGraphButton();
  }

  createReloadGraphButton() {
    d3.select('.graph-buttons-container')
      .append('span')
      .text('replay')
      .attr('class', 'material-icons md-48 custom-button')
      .on('click', () => this.handleCreateNewGraph());
  }

  handleCreateNewGraph() {
    // const numberOfVertices = document.getElementById('vertices-number').value;
    // const numberOfEdges = document.getElementById('edges-number').value;
    if (this.treeDecomposition) this.treeDecomposition.clear();
    if (this.niceTreeDecomposition) this.niceTreeDecomposition.clear();
    const numberOfVertices = 10;
    const numberOfEdges = 10;
    this.graph.randomGraph(numberOfVertices, numberOfEdges);
    this.treeDecompositionLoaded = false;
    this.graphLoaded = true;
  }

  createClearAllButton(sandboxSidebar, graph, td, treeDecomposition, niceTreeDecomposition) {
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
        this.graphLoaded = false;
        this.treeDecompositionLoaded = false;
      });
  }

  async handleComputeNiceTreeDecomposition() {
    if (!this.treeDecompositionLoaded) return;
    await this.graph.readNiceTreeDecomposition();
    const niceTreeDecompositionData = this.graph.getNiceTreeDecomposition();
    this.niceTreeDecomposition.load(niceTreeDecompositionData);
  }

  createComputeNiceTreeDecompositionButton() {
    d3.select('#nice-tree-decomposition-container')
      .append('span')
      .text('timeline')
      .attr('id', 'compute-nicetd-button')
      .attr('class', 'material-icons md-48 draw-graph-button custom-button')
      .on('click', async () => this.handleComputeNiceTreeDecomposition());
  }

  async handleComputeTreeDecomposition() {
    if (!this.graphLoaded) return;
    await this.graph.computeTreeDecomposition();
    await this.graph.readTreeDecomposition();
    const treeDecompositionData = this.graph.getTreeDecomposition();
    this.treeDecomposition.loadGraph(treeDecompositionData, 'tree');
    this.treeDecompositionLoaded = true;
  }

  createComputeTreeDecompositionButton() {
    d3.select('#tree-decomposition-container')
      .append('span')
      .text('device_hub')
      .attr('id', 'compute-td-button')
      .attr('class', 'material-icons md-48 draw-graph-button custom-button')
      .on('click', async () => this.handleComputeTreeDecomposition());
  }

  createDrawGraphButton() {
    d3.select('.graph-buttons-container')
      .append('span')
      .text('palette')
      .attr('class', 'material-icons md-48 custom-button')
      .on('click', () => this.handleDrawGraph());
  }

  handleDrawGraph() {
    if (this.treeDecomposition) this.treeDecomposition.clear();
    if (this.niceTreeDecomposition) this.niceTreeDecomposition.clear();
    this.graph.enableDrawing();
    this.graphLoaded = true;
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
    window.isCustomAlgorithm = false;
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
