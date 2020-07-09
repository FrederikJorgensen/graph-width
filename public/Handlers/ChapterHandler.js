/* eslint-disable no-return-assign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-eval */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */

import Chapter from '../Components/Chapter.js';
import Sidebar from '../Components/Sidebar.js';
import SectionHandler from './SectionHandler.js';
import Graph from '../Components/Graph.js';
import Tree from '../Components/Tree.js';
import TreeDecomposition from '../Components/TreeDecomposition.js';
// eslint-disable-next-line no-unused-vars
import { getAllSubsets } from '../Utilities/helpers.js';

export default class ChapterHandler {
  constructor() {
    this.currentChapter = 1;
    this.chapters = [
      new Chapter(
        (async () => {
        }),
        '1. Graph Separators',
        false,
      ),
      new Chapter(
        (async () => {
          d3.select('#container')
            .append('div')
            .attr('id', 'graph-container');

          d3.select('#container')
            .append('div')
            .attr('id', 'tree-container');
        }),
        '2. Treewidth & Tree Decompositions',
        false,
      ),
      new Chapter(
        (async () => {
        }),
        '3. Nice Tree Decompositions',
        false,
      ),
      new Chapter(
        async () => {
        },
        '4. Algorithms on Tree Decompositions',
        false,
      ),
      new Chapter(
        async () => {
          const customLeft = d3.select('#main')
            .append('div')
            .attr('class', 'custom-left');

          customLeft
            .append('div')
            .attr('id', 'custom-graph')
            .attr('class', 'custom-graph');

          const codeBlock = customLeft.append('div')
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

          const customRight = d3.select('#main')
            .append('div')
            .attr('class', 'custom-right');

          const customNiceTreeContainer = customRight
            .append('div')
            .attr('class', 'custom-nice-tree-container');

          customNiceTreeContainer
            .append('div')
            .attr('id', 'custom-nice-tree');

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
            .text('switch(type){\n case "leaf":\n //Your code for a leaf node.\n break;\n\n case "introduce":\n // Your code for an introduce node.\n break;\n\n case "forget":\n //Your code for a forget node.\n break;\n\n case "join":\n // Your code for a join node.\n break;\n}');

          const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            value: 'function myScript(){return 100;}\n',
            mode: 'javascript',
            theme: 'material-palenight',
            lineNumbers: true,
            autoCloseBrackets: true,
          });

          editor.setSize('100%', '100%');

          const someString = `
          switch(type){ 
          case "leaf":
            // By definition we know that leaf nodes are empty.
            node.table[''] = 0;
            break;

          case "introduce":
            // Set all the entries of this table to be the same as the child's
            node.table = childTable;

            // Get the introduced vertex
            const introducedVertex = niceTreeDecomposition.getIntroducedVertex(node);

            for (const set of allSubsets) {
              // We only care about the subsets containing the introduced vertex v
              if (set.includes(introducedVertex)) {
                /* Check if a vertex inside this set is adjacent to the introduced vertex */
                const setWithoutV = set.filter((s) => s !== introducedVertex);
    
                if (graph.isVertexAdjacent(subTree, set)) {
                  // If the vertex is adjacent to another vertex in the set, we set the value to be -9999
                  node.table[set] = -9999;
                } else {
                  // If not we increment the value of the child table
                  let oldValue = childTable[setWithoutV];
                  oldValue++;
                  node.table[set] = oldValue;
                }
              }
            }
            break;

          case "forget":
            // Get the forgotten vertex.
            const forgottenVertex = niceTreeDecomposition.getForgottenVertex(node);

            for (const set of allSubsets) {
              /* Union the forgottenVertex with the current subset */
              const concatV = set.concat(forgottenVertex);
              concatV.sort();
    
              /* Value of set without v */
              const setWithoutV = childTable[set];
    
              /* Value of set with v */
              const setWithV = childTable[concatV];
    
              if (setWithoutV > setWithV) {
                node.table[set] = setWithoutV;
              } else {
                node.table[set] = setWithV;
              }
            }

            break;

          case "join":
            // Get child 2's table
            const child2Table = niceTreeDecomposition.getChild2Table(node);

            for (const set of allSubsets) {
              const child1value = childTable[set];
              const child2value = child2Table[set];
              const currentNodeValue = set.length;
              node.table[set] = child1value + child2value - currentNodeValue;
            }

            break;
          }`;

          const formattedJSON = js_beautify(someString, { indent_size: 2 });

          const root = niceTreeDecomposition.getRoot();

          let userInput = '';
          let current = 0;
          let customFunction = '';

          codeHeader
            .append('span')
            .text('play_arrow')
            .attr('class', 'material-icons code-buttons')
            .on('click', () => {
              userInput = editor.getValue();

              customFunction = `
          let i = 1;
          
          root.eachAfter((currentNode) => {
            if (current !== i++) return;

            niceTreeDecomposition.animateNode(currentNode);
            niceTreeDecomposition.animateLink(currentNode);

            const node = currentNode.data;

            node.table = {};

            let childTable;

            if ('children' in node) {
              childTable = niceTreeDecomposition.getChildTable(node);
            }

            const subTree = niceTreeDecomposition.getSubTree(root, node)
            
            const allSubsets = getAllSubsets(node.vertices);
            allSubsets.map((s) => s.sort());

            let type = '';

            if ('children' in node === false) type = 'leaf';
            else if (node.children.length === 2) type = 'join';
            else if (node.vertices.length > node.children[0].vertices.length) type = 'introduce';
            else if (node.vertices.length < node.children[0].vertices.length) type = 'forget';

            ${userInput}

            niceTreeDecomposition.drawTable(node);
          })`;
            });

          codeHeader
            .append('span')
            .text('replay')
            .attr('class', 'material-icons code-buttons')
            .on('click', () => editor.setValue('switch(type){\n case "leaf":\n //Your code for a leaf node.\n break;\n\n case "introduce":\n // Your code for an introduce node.\n break;\n\n case "forget":\n //Your code for a forget node.\n break;\n\n case "join":\n // Your code for a join node.\n break;\n}'));


          /*           misButtonContainer
            .append('button')
            .text('Show Max Independent Set Code')
            .attr('class', 'pure-material-button-contained')
            .on('click', () => editor.setValue(formattedJSON)); */


          const controlsContainer = customRight
            .append('div')
            .attr('class', 'custom-control-area');

          const cc = controlsContainer
            .append('div')
            .attr('class', 'custom-controls');

          cc
            .append('span')
            .text('keyboard_arrow_left')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => {
              if (current === 0) return;
              const N = root.descendants().length;
              --current;
              current %= N;
              eval(customFunction);
            });

          cc
            .append('span')
            .text('keyboard_arrow_right')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => {
              const N = root.descendants().length;
              current++;
              if (current !== N) current %= N;
              eval(customFunction);
            });

          renderMathInElement(document.body);
        },
        '7. Create Custom Algorithm',
      ),
      new Chapter(
        async () => {
          let graphLoaded = false;
          let treeDecompositionLoaded = false;

          const graph = new Graph('sandbox-graph');
          const treeDecomposition = new Graph('sandbox-tree-decomposition');
          const niceTreeDecomposition = new Tree('sandbox-nice-tree-decomposition', 'nice', graph);

          const td = new TreeDecomposition('sandbox-tree-decomposition', graph);

          const sandboxSidebar = d3.select('#main')
            .append('div')
            .attr('class', 'sandbox-sidebar-container');

          sandboxSidebar.append('input')
            .attr('value', 15)
            .attr('id', 'vertices-number')
            .attr('class', 'controls-number');

          sandboxSidebar.append('input')
            .attr('value', 15)
            .attr('id', 'edges-number')
            .attr('class', 'controls-number');

          sandboxSidebar.append('div')
            .attr('data-tooltip', 'Reload a random graph')
            .attr('class', 'big')
            .append('span')
            .text('replay')
            .attr('class', 'material-icons md-48')
            .on('click', () => {
              if (treeDecomposition.svg) treeDecomposition.clear();
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();

              const numberOfVertices = document.getElementById('vertices-number').value;
              const numberOfEdges = document.getElementById('edges-number').value;
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
            .attr('data-tooltip', 'Compute a tree decomposition of the current graph')
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
              this.graph = d3.select('#algo-text').text('Current Algorithm = None Selected');
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

          const sandboxAppContainer = d3.select('#main')
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


          /*           const controls = rightSide
            .append('div')
            .attr('id', 'controls');

          controls
            .append('h3')
            .attr('id', 'algo-text')
            .text('Current Algorithm = None Selected');

          const controlsContainer = controls.append('div')
            .attr('class', 'controls-container');

          controlsContainer
            .append('span')
            .text('keyboard_arrow_left')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => niceTreeDecomposition.previous());

          controlsContainer
            .append('span')
            .text('keyboard_arrow_right')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => niceTreeDecomposition.next()); */
        },

        '6. Sandbox',
      ),
    ];
  }

  startFirstLevel() {
    d3.select('.nav').style('height', '50px');
    this.currentChapter = this.chapters[0];
    this.createChapter();
  }

  goToChapter(chapter, isSandbox, isCustom, navLink) {
    if (isSandbox) {
      d3.select('.nav').style('height', '50px');
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
      d3.select('.nav').style('height', '50px');
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
    d3.select('#main').selectAll('*').remove();
    d3.select('.nav-links').style('opacity', 1);

    window.graphContainer = null;
    window.treeContainer = null;

    d3.select('#main')
      .append('div')
      .attr('id', 'center-container');

    const sidebar = new Sidebar(this.currentChapter.name);

    d3.select('#center-container')
      .append('div')
      .attr('id', 'app-area');

    d3.select('#app-area')
      .append('div')
      .attr('id', 'container');

    d3.select('#app-area')
      .append('div')
      .attr('id', 'output');

    this.currentChapter.create();

    const params = new URLSearchParams(location.search);
    const currentSectionIndex = params.get('section') - 1;

    const chapterNumber = this.chapters.indexOf(this.currentChapter) + 1;
    const chapterNumberString = `chapter${chapterNumber}`;

    const sectionHandler = new SectionHandler(sidebar, chapterNumberString);
    this.sectionHandler = sectionHandler;

    const currentSection = this.sectionHandler.sections[currentSectionIndex];

    if (params.get('section') > 0 && currentSectionIndex < sectionHandler.sections.length) {
      sectionHandler.goToSection(currentSection);
    } else {
      sectionHandler.loadFirstSection();
    }

    sidebar.addHandler(sectionHandler);
    sidebar.addProgresBar();

    this.chapters.map((c) => c.isActive = false);
    this.currentChapter.isActive = true;
  }
}
