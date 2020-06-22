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
          d3.select('#container')
            .append('div')
            .attr('id', 'graph-container');

          d3.select('#container')
            .append('div')
            .attr('id', 'tree-container');
        },
        '5. Misc',
        false,
      ),
      new Chapter(
        async () => {
          const sandboxSidebarContainer = d3.select('#main')
            .append('div')
            .attr('class', 'custom-algorithm-sidebar-container');

          const sandboxSidebar = sandboxSidebarContainer
            .append('div')
            .attr('class', 'custom-sidebar');

          sandboxSidebar
            .append('h2')
            .text('Create a custom algorithm')
            .style('margin', '5px')
            .style('text-align', 'center')
            .append('hr')
            .style('margin-bottom', '0');


          const sandboxAppContainer = d3.select('#main')
            .append('div')
            .attr('class', 'custom-algorithm-app-container');

          sandboxAppContainer
            .append('div')
            .attr('class', 'left-side')
            .attr('id', 'left-side');

          const rightSide = sandboxAppContainer
            .append('div')
            .attr('class', 'right-side')
            .attr('id', 'right-side');


          rightSide
            .append('div')
            .attr('id', 'sandbox-nice-tree-decomposition');

          const graph = new Graph('left-side');
          graph.randomGraph();
          const niceTreeDecomposition = new Tree('sandbox-nice-tree-decomposition');
          await graph.computeTreeDecomposition();
          await graph.readNiceTreeDecomposition();
          const niceTdData = graph.getNiceTreeDecomposition();
          niceTreeDecomposition.load(niceTdData);
          niceTreeDecomposition.addTooltip();
          niceTreeDecomposition.addArrow();

          // sandboxSidebar.append('text-area');

          sandboxSidebar
            .append('text')
            .html(`
              <p>Here you can create a custom algorithm that runs on a nice tree decomposition.</p>

              <p>Just specify what you want to happen at each type of node.</p>
            `).style('padding', '0 15px 0 15px');

          sandboxSidebar
            .append('textarea')
            .attr('id', 'editor');
          // .text('switch(type){\n case "leaf":\n //Your code for a leaf node.\n break;\n\n case "introduce":\n // Your code for an introduce node.\n break;\n\n case "forget":\n //Your code for a forget node.\n break;\n\n case "join":\n // Your code for a join node.\n break;\n}');

          const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            value: 'function myScript(){return 100;}\n',
            mode: 'javascript',
            theme: 'monokai',
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

              console.log("without v");
              console.log(setWithoutV);
              console.log("with v");
              console.log(setWithV);
    
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

          editor.setValue(formattedJSON);

          const root = niceTreeDecomposition.getRoot();

          let userInput = '';
          let current = 0;
          let customFunction = '';

          sandboxSidebar.append('button')
            .text('Run Code')
            .attr('class', 'sandbox-button')
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

              console.log(node.table);

              niceTreeDecomposition.drawTable(node);
  
            })`;
            });

          const controls = rightSide
            .append('div')
            .attr('id', 'controls');

          const controlsContainer = controls.append('div')
            .attr('class', 'controls-container');

          controlsContainer
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

          controlsContainer
            .append('span')
            .text('keyboard_arrow_right')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => {
              const N = root.descendants().length;
              current++;
              if (current !== N) current %= N;
              eval(customFunction);
            });
        },
        '7. Create Custom Algorithm',
      ),
      new Chapter(
        async () => {
          let graphLoaded = false;
          let treeDecompositionLoaded = false;
          let niceTreeDecompositionLoaded = false;

          const graph = new Graph('sandbox-graph');
          const treeDecomposition = new Graph('sandbox-tree-decomposition');
          const niceTreeDecomposition = new Tree('sandbox-nice-tree-decomposition', 'nice', graph);

          const td = new TreeDecomposition('sandbox-tree-decomposition', graph);

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
            .text('10');

          sandboxSidebar
            .append('input')
            .attr('id', 'vertices-slider')
            .attr('type', 'range')
            .attr('min', 0)
            .attr('max', 100)
            .attr('step', 'any')
            .attr('step', '1')
            .attr('value', 10)
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
            .text('10');

          sandboxSidebar
            .append('input')
            .attr('id', 'edges-slider')
            .attr('type', 'range')
            .attr('min', 0)
            .attr('max', 100)
            .attr('step', 'any')
            .attr('step', '1')
            .attr('value', 10)
            .attr('class', 'slider')
            .on('input', () => {
              const val = document.getElementById('edges-slider').value;
              d3.select('#e').text(val);
            });

          sandboxSidebar.append('h3').text('Graph Controls').attr('class', 'sandbox-sidebar-heading');

          sandboxSidebar.append('button')
            .text('Random Graph')
            .attr('class', 'sandbox-button')
            .on('click', () => {
              if (treeDecomposition.svg) treeDecomposition.clear();
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();

              const numberOfVertices = document.getElementById('vertices-slider').value;
              const numberOfEdges = document.getElementById('edges-slider').value;
              graph.randomGraph(numberOfVertices, numberOfEdges);
              d3.select('#compute-td-button').classed('sandbox-button', true);
              d3.select('#compute-td-button').classed('sandbox-button-disabled', false);
              d3.select('#draw-td-button').classed('sandbox-button', true);
              d3.select('#draw-td-button').classed('sandbox-button-disabled', false);
              graphLoaded = true;
            });

          sandboxSidebar
            .append('button')
            .text('Draw Graph')
            .attr('class', 'sandbox-button')
            .on('click', () => {
              graph.enableDrawing();
              graphLoaded = true;
              d3.select('#compute-td-button').classed('sandbox-button', true);
              d3.select('#compute-td-button').classed('sandbox-button-disabled', false);
              d3.select('#draw-td-button').classed('sandbox-button', true);
              d3.select('#draw-td-button').classed('sandbox-button-disabled', false);
            });


          sandboxSidebar.append('h3').text('TD Controls').attr('class', 'sandbox-sidebar-heading');

          sandboxSidebar
            .append('button')
            .text('Draw Tree Decomposition')
            .attr('id', 'draw-td-button')
            .attr('class', 'sandbox-button-disabled')
            .on('click', () => {
              if (!graphLoaded) return;
              td.enableDrawing();
            });

          sandboxSidebar
            .append('button')
            .text('Compute tree decomposition')
            .attr('id', 'compute-td-button')
            .attr('class', 'sandbox-button-disabled')
            .on('click', async () => {
              if (!graphLoaded) return;
              if (treeDecomposition.svg) treeDecomposition.clear();
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();
              await graph.computeTreeDecomposition();
              await graph.readTreeDecomposition();
              const treeDecompositionData = graph.getTreeDecomposition();
              treeDecomposition.loadGraph(treeDecompositionData, 'tree', graph);
              d3.select('#compute-nicetd-button').classed('sandbox-button', true);
              d3.select('#compute-nicetd-button').classed('sandbox-button-disabled', false);
              treeDecompositionLoaded = true;
            });

          sandboxSidebar.append('h3').text('Nice TD Controls').attr('class', 'sandbox-sidebar-heading');

          sandboxSidebar
            .append('button')
            .text('Compute nice tree decomposition')
            .attr('id', 'compute-nicetd-button')
            .attr('class', 'sandbox-button-disabled')
            .on('click', async () => {
              if (!treeDecompositionLoaded) return;
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();
              await graph.readNiceTreeDecomposition();
              const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
              niceTreeDecomposition.load(niceTreeDecompositionData);
              niceTreeDecompositionLoaded = true;
              d3.select('#three-color-b').classed('sandbox-button', true);
              d3.select('#three-color-b').classed('sandbox-button-disabled', false);
              d3.select('#max-inde-b').classed('sandbox-button', true);
              d3.select('#max-inde-b').classed('sandbox-button-disabled', false);
            });

          sandboxSidebar.append('h3').text('Algorithms').attr('class', 'sandbox-sidebar-heading');

          sandboxSidebar
            .append('button')
            .text('3-Colorable')
            .attr('class', 'sandbox-button-disabled')
            .attr('id', 'three-color-b')
            .on('click', () => {
              if (!niceTreeDecompositionLoaded) return;
              d3.select('#algo-text').text('Current Algorithm = 3-Colorable');
              niceTreeDecomposition.enableThreeColor();
            });

          sandboxSidebar
            .append('button')
            .text('Max Independent Set')
            .attr('class', 'sandbox-button-disabled')
            .attr('id', 'max-inde-b')
            .on('click', () => {
              if (!niceTreeDecompositionLoaded) return;
              d3.select('#algo-text').text('Current Algorithm = Max Independent Set');
              niceTreeDecomposition.enableMaximumIndependentSet();
            });

          sandboxSidebar
            .append('button')
            .text('Clear All')
            .attr('class', 'sandbox-button')
            .on('click', async () => {
              this.graph = d3.select('#algo-text').text('Current Algorithm = None Selected');
              d3.select('#compute-td-button').classed('sandbox-button', false);
              d3.select('#compute-td-button').classed('sandbox-button-disabled', true);
              d3.select('#compute-nicetd-button').classed('sandbox-button', false);
              d3.select('#compute-nicetd-button').classed('sandbox-button-disabled', true);
              d3.select('#three-color-b').classed('sandbox-button', false);
              d3.select('#three-color-b').classed('sandbox-button-disabled', true);
              if (graph.svg) graph.clear();
              if (td) td.clear();
              d3.select('#output').html(null);
              if (treeDecomposition.svg) treeDecomposition.clear();
              if (niceTreeDecomposition.svg) niceTreeDecomposition.clear();
              if (niceTreeDecomposition.colorTable) niceTreeDecomposition.removeColorTable();
              if (niceTreeDecomposition.tooltip) niceTreeDecomposition.removeMisTable();
              graphLoaded = false;
              treeDecompositionLoaded = false;
              niceTreeDecompositionLoaded = false;
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
            .attr('id', 'sandbox-graph')
            .append('text')
            .text('Graph')
            .attr('class', 'container-text');

          leftSide
            .append('div')
            .attr('id', 'sandbox-tree-decomposition')
            .append('text')
            .text('Tree Decomposition')
            .attr('class', 'container-text');

          leftSide
            .append('div')
            .attr('id', 'output');

          rightSide
            .append('div')
            .attr('id', 'sandbox-nice-tree-decomposition')
            .append('text')
            .text('Nice Tree Decomposition')
            .attr('class', 'container-text');

          const controls = rightSide
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
            .on('click', () => niceTreeDecomposition.maxPrevious());

          controlsContainer
            .append('span')
            .text('keyboard_arrow_right')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => niceTreeDecomposition.maxNext());
        },

        '6. Sandbox',
      ),
    ];
  }

  startFirstLevel() {
    d3.select('#main').style('flex', 0.95);
    d3.select('.nav').style('flex', 0.05);
    this.currentChapter = this.chapters[0];
    this.createChapter();
  }

  goToChapter(chapter, isSandbox) {
    if (isSandbox) {
      d3.select('.nav').style('flex', 0.05);
      window.history.replaceState({}, '', '?');
      d3.select('#main').selectAll('*').remove();
      window.history.replaceState({}, '', '');
      const params = new URLSearchParams(location.search);
      params.set('sandbox', 'true');
      window.history.replaceState({}, '', `?${params.toString()}`);
      chapter.create();
      /* Credit icon maker on every page */
      d3.select('#main')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', 20)
        .style('bottom', '10px')
        .style('right', '10px')
        .append('a')
        .attr('href', 'https://icons8.com/icon/41215/graph-clique')
        .text('Icon by Icons8');
      return;
    }
    d3.select('#sandbox-button').style('color', '#6d7e8e');
    this.currentChapter = chapter;
    this.createChapter();
  }


  createChapter() {
    /* Remove everything in main, sidebar and app area */
    d3.select('#main').selectAll('*').remove();

    /* Credit icon maker on every page */
    d3.select('#main')
      .append('div')
      .style('position', 'absolute')
      .style('z-index', 20)
      .style('bottom', '10px')
      .style('right', '10px')
      .append('a')
      .attr('href', 'https://icons8.com/icon/41215/graph-clique')
      .text('Icon by Icons8');

    /* Reset window globals */
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
    // const section = new Section(window.n, 'chapter5');
    // sectionHandler.addSection(section);
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
