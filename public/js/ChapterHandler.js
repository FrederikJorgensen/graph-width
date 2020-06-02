/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import Chapter from './components/Chapter.js';
import SpeechBubble from './components/SpeechBubble.js';
import Graph from './components/Graph.js';
import Button from './components/Button.js';
import Logo from './components/Logo.js';
import Tree from './components/Tree.js';
import { readKey } from './helpers.js';
import Menu from './components/Menu.js';

const width = document.getElementById('main').offsetWidth;
const height = document.getElementById('main').offsetHeight;

function misButtonClicked() {
  const misButton = document.getElementById('mis-button');
  return new Promise((resolve) => {
    misButton.addEventListener('click', resolve, { once: true });
  });
}

export default class ChapterHandler {
  constructor(sb) {
    this.currentChapter = 1;
    this.chapters = [

      new Chapter(
        (async () => {
          sb.add(width / 2, height / 2);

          const nodes1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];
          const links1 = [
            { source: 1, target: 2 },
            { source: 2, target: 3 },
            { source: 5, target: 1 },
            { source: 1, target: 6 },
            { source: 2, target: 7 },
            { source: 3, target: 8 },
            { source: 4, target: 9 },
            { source: 5, target: 10 },
            { source: 3, target: 1 },
          ];

          const nodes2 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];
          const links2 = [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 1, target: 4 },
            { source: 1, target: 5 },
            { source: 1, target: 6 },
            { source: 1, target: 7 },
            { source: 1, target: 8 },
            { source: 1, target: 9 },
            { source: 1, target: 10 },
            { source: 5, target: 8 },
            { source: 8, target: 3 },
            { source: 3, target: 6 },
            { source: 6, target: 9 },
            { source: 9, target: 4 },
            { source: 4, target: 7 },
            { source: 7, target: 2 },
            { source: 2, target: 10 },
            { source: 10, target: 5 },
          ];

          const graph2 = { nodes: nodes2, links: links2 };

          d3.select('#main')
            .append('div')
            .attr('id', 'box')
            .append('div')
            .attr('id', 'tw-intro');

          d3.select('#main')
            .append('div')
            .attr('id', 'graph-container')
            .style('position', 'absolute')
            .style('height', '100%')
            .style('width', '100%');

          await sb.say('Chapter 1: Introduction to Treewidth');
          await readKey();
          await sb.say('What does treewidth mean?');
          await readKey();
          await sb.say('The treewidth of a graph is a measure to see how "tree-like" a graph is.');
          await readKey();
          await sb.say('What does "tree-like" mean? Can we see if a graph is "tree-like" just by looking at it? Lets take a look at some graphs.');
          await readKey();
          sb.setPosition(sb.xPercentage, sb.yPercentage - 350);
          await sb.say('Can you tell if this graph is tree-like? <br/> <br/> We know that trees do not contain cycles and this graph has exactly 1 cycle. So it must be easy to turn this graph into a tree?');
          const g = new Graph('graph-container');
          g.loadGraph({ nodes: nodes1, links: links1 }, 'graph-container');
          await readKey();
          await sb.say('Lets take a look at another graph. Now this graph contains many cycles but if we remove some vertices we could also easily turn this into a tree.');
          g.clear();
          g.loadGraph(graph2, 'graph-container');
          await readKey();
          g.clear();
          sb.setPosition(sb.xPercentage, sb.yPercentage + 350);
          await sb.say('Hmm.. We cant really tell how easy it is turn a graph into a tree just by looking at it seems.');
          await readKey();
          await sb.say('Why should we care about treewidth then? <br/> <br/> Well we know that many problems which are considered hard to execute on graphs are a lot easier to execute on trees. <br/><br/> Which means if we can turn a given graph into a tree we can essentially compute the same problem on that tree of the graph. We will discuss this further in Chapter 3...');
          await readKey();

          sb.setPosition(sb.xPercentage - 400, sb.yPercentage - 200);
          await sb.say('First let us consider a classic graph problem: <strong>Maximum Indpendent Set</strong>. <br/><br/> Recall that a maximum independent set is the largest possible size of an independent set of a graph.');
          const g2 = new Graph('graph-container');
          g2.randomGraph();

          const b = new Button('Run Max Independent Set', () => g2.maximumIndependentSet(), 'mis-button');
          b.draw();
          await misButtonClicked();
          sb.addResult(`The algorithm you see here is a naive brute force
  algorithm that checks every subset of the graph and the running time is $$ O(2^n * n * (n-1)/2) $$
  As you can tell this algorithm is really slow as we check all subsets of the graph.
  <br/><br/>
  <div>Current Maximum Indepedent Set:</div>`);
          renderMathInElement(document.body);
          const skipForwardButton = new Button('Skip Forward', () => g2.changeMisAnimationSpeed(0), 'skip-forward-button');
          skipForwardButton.draw();
          await readKey();
          sb.clear();
          g2.clear();

          sb.setPosition((width / 2) + 500, sb.yPercentage);

          d3.select('#main')
            .append('div')
            .attr('id', 'tree-container')
            .style('position', 'absolute')
            .style('width', `${width / 5}px`)
            .style('height', `${height / 3}px`)
            .style('bottom', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, 50%)');

          const tree = new Tree();
          tree.setMisNormalTree();

          const treeData = {
            id: 1,
            label: 1,
            children: [
              {
                id: 2,
                label: 2,
                children: [
                  {
                    id: 5,
                    label: 5,
                    children: [{ id: 10, label: 10 }],
                  },
                  {
                    id: 7,
                    label: 7,
                    children: [
                      { id: 8, label: 8 },
                    ],
                  },
                ],
              },
              {
                id: 3,
                label: 3,
                children: [
                  {
                    id: 4,
                    label: 4,
                    children: [
                      { id: 9, label: 9 },
                    ],
                  },
                  {
                    id: 6, label: 6,
                  },
                ],
              },
            ],
          };
          d3.select('#graph-container').remove();
          tree.load(treeData, 'tree-container');
          await sb.say(`Lets now look at how the <strong>Maximum Independent</strong> Set problem works on a tree.
  <br/><br/>
Using dynamic programming we can traverse the tree bottom-up and keep track of the 'state' of each node in the tree.
This way we are creating partial solutions throughout the algorithm, which is very efficient because we will only need to store and calculate very little data in each partial solution.
<br/><br/>
Try going through the algorithm step by step to see how it works.
  `);
          tree.setAllNodes();
          sb.addResult('The running time is \\( O(n) \\) as we only have to visit each tree node once.');
          renderMathInElement(document.body);
          const nextStepButton = new Button('Go next step', () => tree.nextStep(), 'next-step-button');
          nextStepButton.draw();
          const previousStepButton = new Button('Go previous step', () => tree.previousStep(), 'previous-step-button');
          previousStepButton.draw();
          await readKey();
          sb.clearResult();
          sb.clearButtons();
          await sb.say('As you just saw the same problem is vastly faster on a tree than a graph. So if there exists a way to turn a graph into a tree a lot of problems can be solved quicker.');
          await readKey();
          tree.remove();
          tree.hideTooltip();
          sb.setPosition(width / 2, height / 2);
          await sb.say('That concludes the introduction to treewidth. You should now have a basic understanding of the motivation behind studying this graph measure. Continue to Chapter 2...');
        }),
        '1. Introduction to Treewidth',
      ),

      new Chapter(
        (async () => {
          sb.add(width / 2, height / 2);
          await sb.say('Chapter 2: Graph Separators');
          await sb.say('Before we explore treewidth there is one concept that we must familiarize ourselves with. That is the concept of graph separators.');
          await readKey();

          sb.setPosition(sb.xPercentage - 400, sb.yPercentage - 200);
          const graph = new Graph('main');

          const graph1 = {
            nodes: [
              { id: 1 },
              { id: 2 },
              { id: 3 },
              { id: 4 },
              { id: 5 },
              { id: 6 },
              { id: 7 },
              { id: 8 },
              { id: 9 },
            ],
            links:
            [
              { source: 1, target: 2 },
              { source: 3, target: 1 },
              { source: 7, target: 5 },
              { source: 5, target: 2 },
              { source: 8, target: 6 },
              { source: 6, target: 4 },
              { source: 6, target: 3 },
              { source: 4, target: 3 },
              { source: 4, target: 9 },
            ],
          };

          graph.loadGraph(graph1, 'main');
          graph.toggleSeparatorExercise();

          await sb.say(`We say that a set S is a <strong>graph separator</strong> if the removal of that set from the graph leaves the graph into multiple connected components.
              <br/><br/>Can you find one or multiple vertices that would separate the graph into different components?`);

          sb.addResult('Click on a vertex to include it into the separator set.');
          await readKey();
          graph.resetExercises();
          sb.clearResult();
          graph.toggleMinimalSeparatorExercise();
          await sb.say(`There are different kinds of separators. <br/><br/> We will cover minimal separators next.  <br/><br/> A minimal separator set S is a separator in a graph if no proper subset of the set S also contains a separator.
          <br/><br/>In other words if some graph has a separator set S = {A,B} then A on its own cannot separate the graph neither can B. <br/>Try to find a minimal separator in the graph.`);
          sb.addResult('Click on a vertex to include it into the separator set.');
          await readKey();
          graph.resetExercises();
          sb.clearResult();
          graph.toggleBalanceSeparatorExercise();
          sb.setPosition(sb.xPercentage, sb.yPercentage + 30);
          await sb.say(`<strong>Balanced separators:</strong> We say that a separator is balanced if every component that has been induced by the removal of the separator is less than <br/><br/> the number of vertices in the original graph 
          <br/><br/> <strong>minus</strong> <br/><br/> the number of vertices in the separator <br/><br/> <strong>divided by</strong> <br/><br/> 2. <br/><br/>Mathematically we denote this as such:`);
          sb.addMath(' We say that a separator \\( S \\) is balanced: if every component of $$ G \\setminus  S  \\leq \\frac{V(G)-S}{2} $$');
          sb.addExercise('<strong>Exercise:</strong> Find a balanced separator in the graph. Click on a vertex to include it into the separator set.');
          sb.addResult('Click on a vertex to include it into the separator set.');
          renderMathInElement(document.body);
          await readKey();
          graph.clear();
          sb.clear();
          sb.setPosition(width / 2, height / 2);
          sb.say('This concludes the chapter on graph separators. <br><br> In the next chapter you learn how graph separators are utilized by certain concepts within treewidth.  <br><br>  Continue to Chapter 3...');
        }),
        '2. Graph Separators',
      ),
      new Chapter(
        (async () => {
          sb.add(width / 2, height / 2);

          d3.select('#main').append('div').attr('id', 'graph-td');
          d3.select('#graph-td').append('div').attr('id', 'graph-container');
          d3.select('#graph-td').append('div').attr('id', 'tree-container');
          await sb.say('Chapter 3: Tree Decompositions');
          await readKey();
          await sb.say(`Recall that treewidth is a way to measure how "tree-like" a graph is and if the treewidth of a graph is small then we consider it very "tree-like".
          <br><br>
          Now we will explore a concept to define this formally.
          <br><br>
          We define treewidth using the concept of <strong>tree decompositions</strong>.`);
          await readKey();
          await sb.say('A <strong>tree decomposition</strong> is mapping of a graph structured as a tree that we use to define the treewidth of a graph.');
          await readKey();
          sb.setPosition(sb.xPercentage, sb.yPercentage - 350);
          await sb.say('Below you see a graph and one of its valid tree decompositions');
          const graph = new Graph('graph-container');
          graph.randomGraph();
          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const n = graph.getTreeDecomposition();

          const graph2 = new Graph();
          graph2.loadGraph(n, 'tree-container', 'tree');

          d3.select('#graph-container')
            .append('div')
            .text('Graph G')
            .style('font-size', '40px')
            .style('position', 'absolute')
            .style('left', `${width / 4}px`)
            .style('bottom', `${height / 4}px`);

          d3.select('#tree-container')
            .append('div')
            .text('Tree Decomposition T')
            .style('font-size', '40px')
            .style('position', 'absolute')
            .style('left', `${0.65 * width}px`)
            .style('bottom', `${0.2 * height}px`);


          await readKey();
          sb.setPosition(0.75 * width, sb.yPercentage);
          await sb.say('We refer to each node in the tree decomposition as a "bag". <br><br>Each bag contains some vertices of the the graph.');
          sb.addExercise('Try to hover over a bag in the tree decomposition to see the related vertices in the graph.');
          graph2.toggleHoverEffect();
          await readKey();
          graph.resetNodeStyling();
          graph2.toggleHoverEffect();
          sb.clear();
          sb.setPosition(0.5 * width, sb.yPercentage);
          await sb.say('We say that a tree decomposition is valid if it contains the following 3 properties.');
          await readKey();
          sb.addButton('Replay animation', () => graph.runNodeCoverage());
          await sb.say('<strong>Property 1 (Node Coverage):</strong> Every vertex that appears in the graph must appear in some bag of the tree decomposition. <br/><br/>We will check every vertex in the graph and highlight the bag in the tree decompostion containing that vertex.');
          sb.addMath('');
          graph.runNodeCoverage();
          await readKey();
          sb.setPosition(0.5 * width, 0.3 * height);
          sb.clear();
          graph.stopAllTransitions();
          graph2.stopAllTransitions();
          graph.resetNodeStyling();
          graph2.resetTreeDecompositionStyles();
          await sb.say('Property 2 <strong>(Edge coverage):</strong> For every edge that appears in the graph there is some bag in the tree decomposition which contains the vertices of both ends of the edge.<br/><br/> Lets check if this holds true for our graph and tree decomposition.');
          sb.addButton('Replay animation', () => graph.runEdgeCoverage());
          sb.addMath('');
          graph.runEdgeCoverage();
          await readKey();
          graph.resetNodeStyling();
          sb.clear();

          graph.stopAllTransitions();
          graph2.stopAllTransitions();
          graph.resetLinkStyles();
          graph.resetNodeStyling();
          graph2.resetTreeDecompositionStyles();
          await sb.say(`<strong>Property 3 (Coherence):</strong> Lets consider 3 bags of the tree decomposition: b1, b2 and b3 that form a path in the tree decomposition.
          <br><br>If a vertex from the graph belongs to b1 and b3 it must also belong to b2.`);

          await readKey();

          await sb.say(`We can test this property by traversing the tree decomposition in post-order and keeping track of forgotten vertices. <br/><br/>
           We say that a vertex in a bag is forgotten if the vertex appear in the leaf bag but not in its parents bag. <br/><br/>Then all we do every time we hit a leaf is check 
           if the leaf contains any of the forgotten vertices and if so we conclude the tree decomposition does not adhere to his property. <br/><br/>
           But if the leaf does not contain a forgotten vertex we continue traversing and deleting the leaf from the tree after we have procesed it.`);
          sb.addButton('Replay animation', () => graph2.runCoherence());
          sb.addMath('');
          await graph2.runCoherence();
          await readKey();
          sb.clear();
          graph2.resetLinkStyles();
          graph2.resetTreeDecompositionStyles();
          graph2.resetTextStyles();
          await sb.say('The last property holds true as well, since we would terminate the algorithm if we hit a forgotten vertex.');
          await readKey();
          await sb.say('Since all 3 properties hold true we have proofed that the tree on the right side is a valid tree decomposition of the graph on the left side.');
          await readKey();
          await sb.say('Is this the only valid tree decomposition of this graph? <br><br> No, a graph can have multiple valid tree decompositions. <br><br> Lets take a look at some other valid tree decompositions of this graph.');
          await readKey();
          await sb.say('<strong>Example:</strong> The trivial tree decomposition of this graph contains all the graphs vertices in one bag.');
          graph2.clear();
          const trivialTreeDecomposition = graph.computeTrivialTreeDecomposition();
          const trivGraph = new Graph();
          trivGraph.loadGraph(trivialTreeDecomposition, 'tree-container', 'tree');
          await readKey();
          await sb.say('The treewidth of the tree decomposition is the largest bag - 1.');
          await readKey();
          await sb.say('What is the treewidth of the current tree decomposition?');
          graph.clear();
          graph.randomGraph();
          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const n2 = graph.getTreeDecomposition();
          const graph3 = new Graph();
          graph3.loadGraph(n2, 'tree-container', 'tree');
          sb.setPosition(200, 500);
          sb.addQuiz();
          sb.addChoice('1', false);
          sb.addChoice('2', true);
          sb.addChoice('3', false);
          sb.addSolution('The treewidth of a tree decomposition is the size of the largest bag - 1.');
        }),
        '3. Tree Decompositions',
      ),
      new Chapter(
        (async () => {
          sb.add(width / 6, height / 6);
          d3.select('#main').append('div').attr('id', 'graph-td');
          d3.select('#graph-td').append('div').attr('id', 'graph-container');
          d3.select('#graph-td').append('div').attr('id', 'tree-container');
          const graph = new Graph('graph-container');
          graph.randomGraph();
          await graph.computeTreeDecomposition();
          await graph.readNiceTreeDecomposition();
          const nicetd = graph.getNiceTreeDecomposition();
          const tree = new Tree();
          tree.addTooltip();
          tree.load(nicetd, 'tree-container');
          tree.setGraph(graph);
          const niceTreeDecompositionButton = new Button('Compute Nice Tree Decomposition');
          niceTreeDecompositionButton.draw();
          const maxSetButton = new Button('Max Independent Set', () => tree.mis(), 'max-button');
          maxSetButton.draw();
          const next = new Button('next', () => tree.maxNext());
          next.draw();
          const previous = new Button('previous', () => tree.maxPrevious());
          previous.draw();
          const threeColorButton = new Button('3-Coloring', () => tree.runThreeColor());
          threeColorButton.draw();
          tree.createTable();
        }),
        '4. Nice Tree Decompositions',
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

    const logo = new Logo(150, 30);
    logo.draw();

    const menu = new Menu();
    menu.draw();

    this.currentChapter.create();
  }

  createDashboard() {
    d3.select('#main')
      .append('div')
      .attr('id', 'dashboard')
      .style('position', 'absolute')
      .style('height', '400px')
      .style('width', '400px')
      .style('bottom', '10px')
      .style('left', '10px')
      .style('display', 'flex')
      .style('flex-direction', 'column');
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
