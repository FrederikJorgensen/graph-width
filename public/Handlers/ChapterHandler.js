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

          const hamiltonianPathString = `
          
          const bag = node.vertices;

          let child;
          let childTable;
          let childKeys;

          if ('children' in node) {
            child = niceTreeDecomposition.getChild(node);
            childTable = child.table;
            childKeys = [...childTable.keys()];
          }

          let table = new Map();
          
          switch (type) {
            case 'leaf':
              break;
            case 'introduce':
              /* Get the introduced vertex */
              const introducedVertex = niceTreeDecomposition.getIntroducedVertex(node);
    
              /* If the bag below this one is empty we know
              there is just 1 vertex and we want to initiliaze this bag */
              if (child.vertices.length === 0) {
                for (let i = 0; i <= 2; i++) {
                  const state = [];
                  const d = {};
                  const firstVertex = bag[0];
                  d[firstVertex] = i;
                  const matchings = [];
                  const matching = [];
                  matchings.push(matching);
                  state.push(d);
                  state.push(matchings);
                  i === 1 ? table.set(state, false) : table.set(state, true);
                }
              } else {
                for (const childKey of childKeys) {
                  for (let i = 0; i <= 2; i++) {
                    const d = childKey[0];
                    const newMap = deepClone(d);
                    newMap[introducedVertex] = i;
                    const newArray = [];
                    newArray.push(newMap, []);
                    table.set(newArray, true);
                  }
                }
    
    
                for (const childState of childKeys) {
                  const oldMap = childState[0];
    
                  for (let i = 0; i <= 2; i++) {
                    const state = [];
                    const matching = [];
                    const matchings = [];
                    const newMap = {};
                    // const newMap = new Map(oldMap);
    
                    switch (i) {
                      case 0:
                        newMap.set(introducedVertex, 0);
                        matchings.push(matching);
                        state.push(newMap, matchings);
                        // states.push(state);
                        break;
                      case 1:
    
                        for (const w of child.vertices) {
                          if (this.graph.isEdge(w, introducedVertex)) {
                            for (const cs of childStates) {
                              const d = cs[0];
                              const M = cs[1];
    
                              if (d[w] === 1) {
                                newMap[introducedVertex] = 1;
                                state.push(newMap, matchings);
                                // states.push(state);
                              }
    
                              // Change the value of w
                            }
                          }
                        }
    
                        break;
    
                      case 2:
                        newMap.set(introducedVertex, 2);
                        state.push(newMap, matchings);
                        states.push(state);
                        break;
                    }
                  }
                }
              }
              break;
            case 'forget':
              const forgottenVertex = niceTreeDecomposition.getForgottenVertex(node);
              const state = [];
    
              for (const childKey of childKeys) {
                const state = [];
                const d = childKey[0];
                const M = childKey[1];
                delete d[forgottenVertex];
    
                for (const a of M) {
                  const aIndex = M.indexOf(a);
                  if (a.includes(forgottenVertex)) M.splice(aIndex);
                }
    
                state.push(d, M);
                table.set(state, true);
              }
    
              const keys = [...table.keys()];
              const temp = [];
    
              for (const key of keys) {
                const obj = key[0];
                const entry = JSON.stringify(obj);
                temp.push(entry);
              }
    
              /* Remove duplicates from array */
              const newArr = multiDimensionalUnique(temp);
    
              /* Reset the table */
              table = new Map();
    
              /* Convert it back to an array of objects */
              const arrayOfDegrees = [];
              for (const a of newArr) {
                const d = JSON.parse(a);
                arrayOfDegrees.push(d);
              }
    
              /* Get matching if any */
              for (const d of arrayOfDegrees) {
                const state = [];
                const keys = Object.keys(d);
                const possible = [];
                const matchings = [];
    
                for (const key of keys) {
                  const value = d[key];
                  if (value === 1) possible.push(key);
                }
  
    
                if (possible.length > 1 && possible.length % 2 === 0) {
                  for (let i = 0; i < possible.length; i += 2) {
                    const matching = [];
                    const e1 = possible[i];
                    const e2 = possible[i + 1];
                    matching.push(parseInt(e1, 10), parseInt(e2, 10));
                    matchings.push(matching);
                  }
                  state.push(d, matchings);
                  table.set(state, true);
                } else {
                  state.push(d, []);
                  table.set(state, false);
                }
              }
    
    
              break;
            case 'join':
              const leftTable = childKeys;
              const child2 = niceTreeDecomposition.getChild2(node);
              const rightTable = [...child2.table.keys()];
    
              break;
          }`;

          const formattedHamiltonian = js_beautify(hamiltonianPathString, { indent_size: 2 });
          editor.setValue(formattedHamiltonian);

          const formattedJSON = js_beautify(someString, { indent_size: 2 });

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
        },

        '6. Sandbox',
      ),
    ];
  }

  startFirstLevel() {
    d3.select('.nav').style('height', '5%');
    d3.select('#main').style('height', '95%');
    this.currentChapter = this.chapters[0];
    this.createChapter();
  }

  goToChapter(chapter, isSandbox, isCustom, navLink) {
    if (isSandbox) {
      d3.select('.nav').style('height', '5%');
      d3.select('#main').style('height', '95%');
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
      d3.select('.nav').style('height', '5%');
      d3.select('#main').style('height', '95%');
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
    d3.select('#main').style('height', '95%');

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
