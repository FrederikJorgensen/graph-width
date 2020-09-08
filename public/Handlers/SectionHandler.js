/* eslint-disable class-methods-use-this */
/* eslint-disable no-return-assign */
/* eslint-disable no-restricted-globals */
import Section from '../Components/Section.js';
import Graph from '../Components/Graph.js';
import Tree from '../Components/Tree.js';
import TreeDecomposition from '../Components/TreeDecomposition.js';
import {
  graph1, exampleGraph3, gridGraph, cliqueGraph, treeGraph, cycleGraph, hamTD, hamTD2, hamiltonianGraph,
} from '../Utilities/graphs.js';

export default class SectionHandler {
  constructor(sidebar, chapter) {
    this.sidebar = sidebar;
    this.currentSectionIndex = 0;
    this.currentChapter = chapter;

    window.sectionHandler = this;

    this.sections = [
      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>Before we explore treewidth there is one concept that we must familiarize ourselves with.</p>

          <p>That is the concept of a <strong>graph separator</strong>.</p>
          
          <p>We say that a set \\( S \\) is a graph separator in a graph \\( G \\) if the removal of that set from \\( G \\) leaves \\( G \\) into multiple connected components.</p>

          <p>In later chapters it becomes clear why we study graph separators. There are different types of graph separators we will cover those who are most relevant to treewidth in this chapter.</p>

          <p><i>Click on a vertex in the graph to see if it separates the graph.</i></p>
          `);

          this.sidebar.addExercise('Find one or multiple vertices that would separate the graph into different components.');

          d3.select('#output')
            .append('div')
            .attr('id', 'separator-output');

          const graph = new Graph('container');
          graph.loadGraph(exampleGraph3);
          graph.toggleSeparatorExercise();
        },
        'chapter1',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>Let \\( S \\) be a separator in some graph \\( G \\). We say that \\( S\\) is a <strong>minimal separator</strong> if no proper subset separates the graph \\( G \\)

          <p>In other words if some graph has a separator set \\( S = \\{ a,b \\} \\) then \\( a \\) on its own cannot separate the graph neither can \\( b \\).</p>
          `);
          this.sidebar.addExercise('Find a minimal separator in the graph.');
          d3.select('#output')
            .append('div')
            .attr('id', 'separator-output');

          const graph = new Graph('container');
          graph.loadGraph(exampleGraph3);
          graph.toggleMinimalSeparatorExercise();
        },

        'chapter1',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>Let \\( S \\) be a separator in some graph \\( G \\). We say that \\( S \\) is a balanced separator if every component of \\( G - S \\) has \\( \\leq V(G) / 2 \\)</p>

          <p>That is every component after you remove \\( S \\) should contain less than or equal amounts of vertices to the amount of vertices in the original graph divided by 2.</p>
          `);

          this.sidebar.addExercise('Find a balanced separator in the graph.');

          d3.select('#output')
            .append('div')
            .attr('id', 'separator-output');

          const graph = new Graph('container');
          graph.loadGraph(exampleGraph3);
          graph.toggleBalanceSeparatorExercise();
        },
        'chapter1',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>Informally we can describe the <strong>treewidth</strong> of a graph to be a tree "build" from its separators that we saw in the previous chapter.</p>

          <p>More formally we define the treewidth of a graph using the notion of <strong>tree decompositions.</strong></p>

          <p>A tree decomposition of a graph is a mapping of that graph into a tree adhering to certain properties.</p>

          <p>On the right you see a graph \\( G \\) and one of its tree decompositions \\( T \\).
            
            `);

          const graph = new Graph('graph-container');
          this.graph = graph;
          this.graph.loadGraph(graph1, 'graph-container', 'graph');

          await this.graph.computeTreeDecomposition();
          await this.graph.readTreeDecomposition();
          const td1 = this.graph.getTreeDecomposition();

          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', this.graph);
          this.treeDecomposition = treeDecomposition;
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
              <p>We refer to each node in the tree decomposition as a "bag".</p>
              
              <p>Each bag contains some vertices of the the graph.</p>
              `);

          this.sidebar.addExercise('Try to hover over a bag to see its related vertices.');

          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
          treeDecomposition.toggleHoverEffect();
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            <p>We say that a tree decomposition is valid if it contains the following 3 properties.</p>

            <p><strong>Property 1 (Node Coverage):</strong> Every vertex that appears in the graph must appear in some bag of the tree decomposition. </p>
            
            <p>We will check every vertex in the graph and highlight the bag in the tree decompostion containing that vertex.</p>
            `);
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);
          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', this.graph);

          this.sidebar.addButton('Replay animation', () => this.graph.runNodeCoverage());
          graph.runNodeCoverage();
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            Property 2 <strong>(Edge coverage):</strong> For every edge that appears in the graph there is some bag in the tree decomposition which contains the vertice
            s of both ends of the edge.<br/><br/> Lets check if this holds true for our graph and tree decomposition.
            `);
          /* Graph stuff */
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);
          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();

          /* Tree decomposition stuff */
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);

          /* Handlers and stuff */
          this.sidebar.addButton('Replay animation', () => this.graph.runEdgeCoverage());
          treeDecomposition.resetTreeDecompositionStyles();
          graph.runEdgeCoverage();
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            <p><strong>Property 3 (Coherence):</strong> Lets consider 3 bags of the tree decomposition: \\( b_1 \\), \\( b_2 \\) and \\( b_3 \\) that form a path in the tree decomposition.</p>

            <p>If a vertex from the graph belongs to \\( b_1 \\) and \\( b_3 \\) it must also belong to \\( b_2 \\).</p>
            
            <p>Lets check this by going through the vertices in the graph like we did at property 1. And if a node is in multiple bags it MUST form a connected subtree in the tree decomposition.</p>
            `);
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
          this.sidebar.addButton('Replay animation', () => graph.highlightCoherence());
          graph.highlightCoherence();
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            <p>Since all 3 properties hold true we have prooved that the tree on the right side is a valid tree decomposition of the graph on the left side.</p>

            <p>Is this the only valid tree decomposition of this graph? <br><br> No, a graph can have multiple valid tree decompositions.</p>
            
            <p>Lets take a look at some other valid tree decompositions of this graph.</p>

            <p><strong>Example:</strong> The trivial tree decomposition of this graph contains all the graphs vertices in one bag.</p>
            `);
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          const treeDecomposition = new Graph('tree-container');
          const trivialTreeDecomposition = graph.computeTrivialTreeDecomposition();
          treeDecomposition.loadGraph(trivialTreeDecomposition, 'tree');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent('<p>This is another valid tree decomposition of the graph.</p>');

          const anotherTd = {
            nodes: [
              { id: 1, label: '1 2' },
              { id: 2, label: '2 3 4' },
              { id: 3, label: '3 4 5 6 7' },
            ],
            links: [
              { source: 1, target: 2 },
              { source: 2, target: 3 },
            ],
          };
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(anotherTd, 'tree');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addExercise('Is this a valid tree decomposition of the graph?');

          const td3 = {
            nodes: [
              { id: 1, label: '1 2' },
              { id: 2, label: '2 3 4' },
              { id: 3, label: '1 3 4 5 6 7' },
            ],
            links: [
              { source: 1, target: 2 },
              { source: 2, target: 3 },
            ],
          };
          const graph = new Graph('graph-container');

          graph.loadGraph(graph1);

          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td3, 'tree');

          this.sidebar.addQuiz();
          this.sidebar.addChoice('Yes', false);
          this.sidebar.addChoice('No', true);
          this.sidebar.addSolution('Since the vertex 1 is in 2 bags it must form a connected subtree but in this tree it does not. Recall property 3.');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addExercise('Is this a valid tree decomposition of the graph?');
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          this.sidebar.addQuiz();
          this.sidebar.addChoice('Yes.', true);
          this.sidebar.addChoice('No.', false);
          this.sidebar.addSolution('It satisfies all the properties of a tree decomposition thus it is valid.');

          const td4 = {
            nodes: [
              { id: 1, label: '1 2' },
              { id: 2, label: '2 3 4 5' },
              { id: 3, label: '3 4 5' },
              { id: 4, label: '4 5 6' },
            ],
            links: [
              { source: 1, target: 2 },
              { source: 2, target: 3 },
              { source: 2, target: 4 },
            ],
          };

          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td4, 'tree');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            <p>If there are different tree decompositions for a graph how do know which ones to use?</p>

            <p>We want to use the tree decompositions with the lowest possible vertices in it's largest bag, as this make many algorithms that exploit tree decomposition more effective.</p>

            <p><strong>Definition:</strong> We say that the <strong>width</strong> of a tree decomposition is the the size of the largest bag of that tree decomposition - 1.</p>

            <p><strong>Definition:</strong> The <strong>treewidth</strong> of a graph is the minimum width amongst all the tree decompositions of \\( G \\).</p>
            `);
          this.sidebar.addExercise('What is the width of the current tree decomposition?');
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree');

          this.sidebar.addQuiz();
          this.sidebar.addChoice('1', false);
          this.sidebar.addChoice('2', true);
          this.sidebar.addChoice('3', false);
          this.sidebar.addSolution('The treewidth of a tree decomposition is the size of the largest bag - 1.');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addExercise('What about this one? What is the width?');

          const anotherTd = {
            nodes: [
              { id: 1, label: '1 2' },
              { id: 2, label: '2 3 4' },
              { id: 3, label: '3 4 5 6 7' },
            ],
            links: [
              { source: 1, target: 2 },
              { source: 2, target: 3 },
            ],
          };
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          this.sidebar.addQuiz();
          this.sidebar.addChoice('2', false);
          this.sidebar.addChoice('4', true);
          this.sidebar.addChoice('5', false);
          this.sidebar.addSolution('4 Since the largest bag contains 5 vertices.');

          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(anotherTd, 'tree');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          const td3 = {
            nodes: [
              { id: 1, label: '1 2' },
              { id: 2, label: '2 3 4' },
              { id: 3, label: '1 3 4 5 6 7' },
            ],
            links: [
              { source: 1, target: 2 },
              { source: 2, target: 3 },
            ],
          };
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          this.sidebar.addExercise(`
            Lets check one more. What is the width?            
            `);
          this.sidebar.addQuiz();
          this.sidebar.addChoice('2', false);
          this.sidebar.addChoice('4', false);
          this.sidebar.addChoice('5', true);
          this.sidebar.addSolution('5 Since the largest bag contains 6 vertices.');

          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td3, 'tree');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            <p>Lets assume that the 3 tree decompositions you see on the right are ALL of the possible tree decompositions of the graph \\( G \\). (This is not true but for this exercise we will make this assumption)</p>
        
            `);
          this.sidebar.addExercise('What is the <strong>treewidth</strong> of the <strong>graph \\( G \\)</strong>?');
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          d3.select('#tree-container')
            .style('display', 'flex')
            .style('flex-direction', 'column');

          d3.select('#tree-container').append('div')
            .attr('id', 'tree1')
            .style('display', 'flex')
            .style('flex', '0.33');

          d3.select('#tree-container').append('div')
            .attr('id', 'tree2')
            .style('display', 'flex')
            .style('flex', '0.33');

          d3.select('#tree-container').append('div')
            .attr('id', 'tree3')
            .style('display', 'flex')
            .style('flex', '0.33');

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();

          const td3 = {
            nodes: [
              { id: 1, label: '1 2' },
              { id: 2, label: '2 3 4' },
              { id: 3, label: '1 3 4 5 6 7' },
            ],
            links: [
              { source: 1, target: 2 },
              { source: 2, target: 3 },
            ],
          };

          const td4 = {
            nodes: [
              { id: 1, label: '1 2' },
              { id: 2, label: '2 3 4 5' },
              { id: 3, label: '3 4 5' },
              { id: 4, label: '4 5 6' },
            ],
            links: [
              { source: 1, target: 2 },
              { source: 2, target: 3 },
              { source: 2, target: 4 },
            ],
          };

          const tree1 = new Graph('tree1');
          const tree2 = new Graph('tree2');
          const tree3 = new Graph('tree3');

          this.tree1 = tree1;
          this.tree2 = tree2;
          this.tree3 = tree3;

          tree1.loadGraph(td1, 'tree');
          tree2.loadGraph(td3, 'tree');
          tree3.loadGraph(td4, 'tree');

          this.sidebar.addQuiz();
          this.sidebar.addChoice('2', true);
          this.sidebar.addChoice('5', false);
          this.sidebar.addChoice('3', false);
          this.sidebar.addSolution('The correct answer is 2. Recall that the treewidth of a graph is the minimum width amonst all of the possible tree decompositions.');
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            <p>We will now put our attention towards understanding how graph separators work in tree decompositions. If you dont recall the concept of graph separators go through chapter 2.</p>

            <p>Each bag in the tree decomposition act as a separator in the graph.</p>

            <p>For example the bag containing 2 3 4 separates 1 and 5 6 7 in the graph.</p>
            `);

          this.sidebar.addExercise('Hover over a bag in the tree decomposition to see how it separates the graph.');
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
          treeDecomposition.toggleSeparator();
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          
          <p>Lets test your knowledge of the tree decomposition properties.</p>
          
          <p><strong>Add bags</strong> for the tree decomposition by clicking anywhere in the highlighted space.</p>
          
          <p><strong>Add edges</strong> between bags by dragging and clicking on a node.</p>

          <p><strong>Change</strong> which vertices should be contained inside each bag by right-clicking and select set value. Separate each vertix using a comma.</p>

          <p>(Example: If you wanted 1, 2 and 3 contained in a bag, write it as such: 1,2,3)</p>

          <p><strong>Delete a bag</strong> by right-clicking and click delete bag.</p>

          <p><strong>Remove an edge</strong> by right-clicking on it.</p>
          `);
          this.sidebar.addExercise('Draw the tree tree decompostion of the graph \\( G \\).');

          const graph = new Graph('graph-container');
          graph.randomGraph();

          const td = new TreeDecomposition('tree-container', graph);
          this.td = td;

          td.enableDrawing();
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
           <p class="fact"><span class="fact-title">Fact:</span> For every \\( k \\geq 2\\), the treewidth of the \\( k\\) x \\( k \\) grid is exactly \\( k \\)</p>

           <p>Consider the \\( 3\\) x \\( 3 \\) grid on the right. Intuitively we can see there is no way we can separate this graph using less than \\( 3 \\) vertices.</p>
          
          `);
          const graph = new Graph('graph-container');
          graph.loadGraph(gridGraph);

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
        }, 'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>Certain graph classes has a constant treewidth regardless of the number of vertices/edges in that particular graph.</p>

          <p><strong>Trees</strong> have treewidth 1.</p>

          <p>This is also the reason why we say that width is the largest bag - 1. For historical reasons the first people studying treewidth wanted trees to have width 1.</p>
          `);

          d3.select('#container').style('height', '100%');
          d3.select('#output').style('height', '0');

          const graph = new Graph('graph-container');
          graph.loadGraph(treeGraph);

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
        },
        'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
           <p class="fact"><span class="fact-title">Fact:</span> The treewidth of clique \\( k \\) is \\( k - 1\\)</p>

           <p>As you can tell by the graph and its tree decomposition a clique has a large treewidth. An optimal tree decomposition of a clique is basically the trivial decomposition.</p>
          `);
          const graph = new Graph('graph-container');
          graph.loadGraph(cliqueGraph);
          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
        }, 'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
           <p>Outerplanar graphs have treewidth \\( 2 \\).</p>
          `);
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);
          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
        }, 'chapter2',
      ),

      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>One part that you might have noticed that we left out is how do we construct these tree decompositions?</p>

          <p>This is because an algorithm that constructs a tree decomposition given a graph is far from a trivial thing to do.
          This in of itself could be a chapter. We have decided to rather focus on the properties of tree decompositions and how algorithms exploit them.</p>

          <p>All that is needed to know for this interactive course is that it is NP-Hard to determine the treewidth of a graph. 
          However there exists approximation algorithms that can find that provides an approximate treewidth given a graph. 
          (<a href="https://www.sciencedirect.com/science/article/pii/S0304397597002284?via%3Dihub">Bodlaender et al. 2016</a>)</p>

          <p>This also means discovering if a tree decomposition of width \\( k \\) k exists without knowledge of the treewidth is also NP Hard.
          Although for a small constant \\( k \\) it is possible to find a tree decomposition in linear time. (<a href="https://epubs.siam.org/doi/10.1137/S0097539793251219">Bodlaender 1996</a>)
          </p>         

          <p>If you want to know more of the construction of tree decompositions the Chapter 10.5 in <a href="https://www.pearson.com/us/higher-education/program/Kleinberg-Algorithm-Design/PGM319216.html"
          >Algorithm Design</a> is a good place to start.</p>

          <p>We use a Java library called <a href="https://github.com/maxbannach/Jdrasil">Jdrasil</a> to compute tree decompositions.
          The algorithm used in the library to obtain an exact tree decomposition is a mix of several known tree decomposition solvers.
          </p>

          <p>You can read more in their paper: <a href="https://drops.dagstuhl.de/opus/volltexte/2017/7605/pdf/LIPIcs-SEA-2017-28.pdf">Jdrasil: A Modular Library for Computing Tree Decompositions</a>.</p>
          `);
          const graph = new Graph('graph-container');
          graph.loadGraph(graph1);

          await graph.computeTreeDecomposition();
          await graph.readTreeDecomposition();
          const td1 = graph.getTreeDecomposition();
          const treeDecomposition = new Graph('tree-container');
          treeDecomposition.loadGraph(td1, 'tree', graph);
        }, 'chapter2',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>Algorithms that exploit tree decompositions are often represented using a "nice tree decomposition".</p>

          <p><strong>Definition:</strong> A tree decomposition \\( (X,T) \\) where \\( X = (X_1,...,X_l) \\) is refered to as a nice tree decomposition if:</p>
          <p>Has all the properties of a tree decomposition.</p>
          <p>The tree \\( T\\) is <strong>rooted</strong></p>
          <p>Every node of \\( T \\) has at most 2 children.</p>
          <p>Every node of \\( T \\) must be one of the following types:</p>            
          <p><strong><span class="leaf">Leaf node:<span></strong> \\( i \\)  is a leaf in \\( T \\) then \\( |X_i|\\) \\( \\leq \\) 1</p>
          <p><strong><span class="join">& Join node:</span></strong>  \\( i \\) has two children \\( j \\) and \\( k \\), then \\( X_i = X_j = X_k \\)</p>
          <p><strong><span class="introduce">+ Introduce node:</span></strong>  \\( i \\) has 1 child \\( j \\), then \\( X_i = X_j \\cup \\{ v \\} \\) for a vertex \\( \\{ v \\} \\)</p>
          <p><strong><span class="forget">- Forget node:</span></strong> \\( i \\) has 1 child \\( j \\), then \\( X_i = X_j - \\{ v \\} \\) for a vertex \\( \\{ v \\} \\)</p>
          <p>On the right you see a nice tree decompostion of the current graph.</P>
          <p>Each node type of the tree is a different color and has a diffrent symbol to make it easier to tell the difference.</p>
          <p>Spend some time getting familiar with the difference between the nodes. As we will be refering them a lot in the coming sections.</p>
          `);

          if (!window.graphContainer && !window.treeContainer) {
            const graphContainer = d3.select('#container')
              .append('div')
              .attr('id', 'graph-container');

            const treeContainer = d3.select('#container')
              .append('div')
              .attr('id', 'tree-container');

            window.graphContainer = graphContainer;
            window.treeContainer = treeContainer;
          }

          const graph = new Graph('graph-container');
          this.graph = graph;
          this.graph.randomGraph();

          await this.graph.computeTreeDecomposition();
          await this.graph.readNiceTreeDecomposition();
          const niceTreeDecompositionData = this.graph.getNiceTreeDecomposition();

          const niceTreeDecomposition = new Tree('tree-container');
          this.treeDecomposition = niceTreeDecomposition;
          this.treeDecomposition.load(niceTreeDecompositionData);
          this.treeDecomposition.setGraph(this.graph);
        },
        'chapter4',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
            <p>We now introduce how algorithms exploit these tree decompositions.</p>

            <p>Most algorithms that run on tree decompositions use a <strong>bottom-up</strong> approach combined with <strong>dynamic programming</strong>.</p>
            
            <p>For each node in the tree decomposition we store some information in classical dynamic programming table. What we store in this table depends on the algorithm we are running and what type of node it is.</p>

            <p>The important part is that we store relatively little information at each node because we have 'split' up the graph into subgraphs by the properties of a tree decomposition.</p>

            <p>We will start with a refresher on how <strong>dynamic programming</strong> works on "normal" trees.</p>
          `);
        },
        'chapter4',
      ),
      new Section(
        async () => {
          if (this.graph) this.graph.clear();
          const tree = new Tree('container', 'normal-tree');
          this.tree = tree;
          this.tree.setMisNormalTree();

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


          this.tree.load(treeData, 'normal-tree');
          this.tree.addTooltip();
          this.tree.addArrow();

          this.sidebar.addContent(`
          <p>Let's now look at how the <strong>Maximum Independent Set</strong> problem works on a tree.</p>
          
          <p>Using dynamic programming we can traverse the tree bottom-up and keep track of the 'state' of each node in the tree.</p>

          <p>This way we are creating partial solutions throughout the algorithm, which is very efficient because we will only need to store and calculate very little data in each partial solution.</p>

          <p>The algorithm works as follow:</p>

          <p>
          <strong>Input:</strong> A tree.
          <br>
          <strong>Output:</strong> Maximum Independent Set of the tree.
          </p>
          <h3>Step 1:</h3>
          <p>Start by performing a post-order (bottom-up) traversal of the tree.</p>
          <h3>Step 2:</h3>

          <p>We just need to take care of a few cases here:</p>
          <ul>
            <li>If the current node is a <strong>leaf</strong> we know it has no children so we set the maximum independent set to be 1.</li>
            <li>For every other node we keep to rows in the table <strong>Max Set Incl</strong> which includes the current node so it cannot include its direct children but it can include the grandchildren.</li>
            <li>The other entry is <strong>Max Set Excl</strong> which means we do not include the current node so we can include its direct children.</li>
          </ul>

          <p>Then we simply get the bigger of Max Set Incl or Max Set Excl for each subsolution</p>
          <h3>Step 3:</h3>
          <p>Get the bigger entry in the table of the root node to get the maximum independent set of the entire tree.</p>
          
          <p>Try going through the algorithm step by step to see how it works. The running time is \\( O(n) \\) as we only have to visit each tree node once.</p>
`);

          d3.select('#container').style('background-color', '#EEEEEE');
          renderMathInElement(document.body);
          this.tree.setAllNodes();
          this.sidebar.addButton('Next Step', () => tree.nextStep());
          this.sidebar.addButton('Previous Step', () => tree.previousStep());
          this.addArrowKeyFunctionality(tree);
        },
        'chapter4',
      ),
      new Section(
        async () => {
          if (!window.graphContainer && !window.treeContainer) {
            const graphContainer = d3.select('#container')
              .append('div')
              .attr('id', 'graph-container');

            const treeContainer = d3.select('#container')
              .append('div')
              .attr('id', 'tree-container');

            window.graphContainer = graphContainer;
            window.treeContainer = treeContainer;
          }


          this.sidebar.addContent(`
          <p>The first algorithm we will consider is an algorithm to find the Maximum Indpependent Set of a graph \\( G \\) given its nice tree decomposition with width \\( k \\).</p>

          <p>Before explaining the algorithm lets introduce some notation that we will use from now on.</p>

          <p>Consider any bag in the nice tree decomposition \\( i,...,l \\) let \\( G_i = (V_i,E_i) \\) be the induced subgraph of all vertices in the bags of the descendants of bag \\( i \\) in \\( T \\)</p>

          <p>For each node \\( i \\) we will compute a table \\( C_i \\)</p>

          <p>Each row in the table \\( C_i \\) consists of a subset \\( S \\subseteq X_i \\) in the first column and the size of the maximum independent set of that set in the second column. </p>
          
          <p>If a subset \\( S \\subseteq X_i \\) breaks the independence property, that is some vertices in the set is neighboring each other we omit this entry from the table.</p>

          <p>Let's now describe the algorithm.</p>


          <section>
          <p><strong>Input:</strong> A nice tree decomposition of graph \\( G \\)</p>
          <p><strong>Output:</strong> The size of the Maximum Independent Set of \\( G \\)</p>
          </section>

          <p><strong>Step 1:</strong> Perform a post-order (bottom-up) traversal of the tree.</p>

          <p><strong>Step 2:</strong> Compute the table \\( C_i \\) for each node \\( i \\), depending on the type of node do the following:</p>
  

              <p>If we hit a <strong>leaf node</strong> \\( i \\) with \\( X_i\\) \\( \\leq 1 \\)</p>
              <p>\\( C_i(Ø) = 0 \\)</p>
              <p>\\( C_i( \\{ v \\} ) = 1 \\)</p>
              <p>That is we only consider two scenarios: either it has 0 vertices or exactly 1 vertex.</p>
              <p>The empty set does not contain a MIS, thus we set the entry to 0. 
              If the leaf contains a vertex then the size of the MIS is exactly 1, recall that the induced subgraph of a leaf consits of exactly 1 vertex.</p>

              <p>If we hit a <strong>forget node</strong> \\( i \\) with child \\( j \\), then \\( X_i = X_j \\setminus \\{ v \\} \\) and \\( S \\subseteq X_i \\)</p>
              <p>\\( C_i(S) = max \\{ C_j(S), C_j( S \\cup \\{ v \\} ) \\} \\)</p>
              <p>We check if the sets of \\( X_i \\) is bigger with the forgotten vertex or without it and then keep the bigger one.</p>
      
              
              <p>If we hit a <strong>join node</strong> \\( i \\) with 2 children \\( j_1 \\) and \\( j_ 2 \\), then \\( X_i = X_{j_1} = X_{j_2} \\) and \\( S \\subseteq X_i \\)</p>
              <p>\\( C_i(S) = C_{j_1}(S) + C_{j_2}(S) - |S| \\)</p>
              <p>As \\( X_i \\), \\(X_{j_1} \\) and \\( X_{j_2} \\) all contain the same vertices and recalling the coherence property of 
              tree decompositions we can see that the the vertices in \\( X_i \\) is the intersection of the nodes in the 2 subtrees. We can then add the table entries from the children nodes' table and substract the ones we counted twice./p>
     

              <p>If we hit a <strong>introduce node</strong> with child \\( j \\), then \\( X_i = X_j \\cup \\{ v \\} \\) and \\( S \\subseteq X_i \\)</p>
              <p>\\( C_i(S) = C_j(S)\\)</p>
             <p>
             $$
             C_i(S \\cup \\{ v \\} ) = \\begin{cases}
             −∞ & \\text{if } \\exists w \\in S : \\{ v,w \\} \\in E \\\\
             C_j(S) + 1 & \\text{else } 
            \\end{cases}
             $$
             </p>
             <p>To compute the table of an introduce node we take over all the child node \\( X_j \\) table's entries. If a \\( v \\in S \\) we test if there are any 
             vertices in the set that are adjacent and if so we know it is not an independent set and we set the value to be minus infinity. If it is not adjacent we add 1 to the existing entry.</p>

          <p><strong>Step 3:</strong></p> Lastly we return the largest independent set in the table \\( C_r \\) of the root node.

          <h2>Complexity</h2>
          <p>Using post-order traversal we visit each node exactly once which takes time \\( O(n) \\).</p>

          <p>We assume treewidth \\( k \\). So the largest bag must contain \\( k + 1 \\) vertices. Which means we need to compute at most \\( 2^{k+1} \\) rows for every table \\( C_i \\).
          Therefor the running time of this algorithm is \\( O(2^{k+1} n) \\).</p>

          <p>In conclusion, for graphs with bounded treewidth we can find the maximum independent set in linear time as:
            <ul>
              <li>We can compute a tree decomposition in linear time</li>
              <li>Transform it into a nice tree decomposition in linear time</li>
              <li>Run the algorithm in linear time</li>
            </ul>
          </p>

          <p>Step through the algorithm by using the b
         `);

          const graph = new Graph('graph-container');
          const niceTreeDecomposition = new Tree('tree-container');
          graph.loadGraph(graph1);

          await graph.computeTreeDecomposition();
          await graph.readNiceTreeDecomposition();
          const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
          niceTreeDecomposition.load(niceTreeDecompositionData);
          niceTreeDecomposition.setGraph(graph);
          niceTreeDecomposition.enableMaximumIndependentSet();

          this.addArrowKeyFunctionality(niceTreeDecomposition);

          const controlsContainer = d3.select('#output').append('div')
            .attr('class', 'controls-container');

          controlsContainer
            .append('span')
            .text('keyboard_arrow_left')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => niceTreeDecomposition.previousDPStep());

          controlsContainer
            .append('span')
            .text('keyboard_arrow_right')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => niceTreeDecomposition.nextStep());
        },
        'chapter4',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <h2>3-Colorable Algorithm:</h2>

          <p>We say that a graph \\( G \\) is \\( k-colorable \\) if we can color the vertices with \\( k \\) colors such that no two adjacent vertices has the same color.</p>

          <p>For illustration purposes we will consider the example of 3-colorable.</p>

          <section class="inout">
          <p><strong>Input:</strong> A nice tree decomposition of graph \\( G \\)</p>
          <p><strong>Output:</strong> If \\( G \\) is 3-colorable</p>
          </section>

          <p>
            \\( X_i \\) vertices appearing in the bag \\( x\\).
            <br>
            \\( V_x \\) vertices of the subtree rooted at bag \\( x \\).
          </p>

          <p>
            For every bag \\( x \\) and coloring \\( c : X_i  →  \\{ 1,2,3 \\} \\) we define the table \\( A[i,c] \\) to be true if there exists a 3-coloring of \\( V_x \\).
          <p>

          <p><strong>Step 1:</strong> Perform a post-order traversel of the nice tree decomposition.</p>

          <p><strong>Step 2:</strong></p>

          <p><strong>Leaf node:</strong> As a leaf node \\( X_i \\) contains at most 1 vertex. There are only 3 possible states for the vertex \\( \\{ v \\} → \\{ 1,2,3 \\} \\).</p>

          <p>
            <strong>Introduce node</strong> \\( i \\) with child \\( j \\) with \\( X_i = X_j \\cup \\{ v \\} \\) for some vertex \\( v \\).
            <br>
            If \\( c(v) \\neq c(w) \\) for every adjacent \\( w \\) of \\( v \\)
            <br>
            then \\( A[i,c] = A[j,c'] \\) where \\( c' \\) is \\( c \\) restricted to \\( X_j \\)
            <br>
            That is, before we color an introduced node we check if any of its neighbors has the color we want to color it. If it does, we do not include it in the table.
          </p>

          <p>
            <strong>Forget node</strong> \\( i \\) with 1 child \\( j \\) and \\( X_i = X_j \\setminus \\{ v \\} \\) and \\( S \\subseteq X_i \\)
            <br>
            \\( A[i,c] \\) is true if \\( A[j,c'] \\) is true for one of the extensions of \\( c \\) to \\( X_j \\).
            <br>
            In other words we compute all the possible ways to color \\( X_i \\) and for each coloring we check if it can extended to \\( X_j \\) with at least one of the possible colors.
          </p>

          <p>
            <strong>Join node</strong> \\( i \\) with 2 children \\( j_1 \\) and \\( j_2 \\) \\( X_i  = X_{j_1} = X_{j_2} \\)
            <br>
            \\( A[i,c] = A[j_1,c] + A[j_2,c] \\)
            <br>
            Each independent subproblem must be consistent.
          </p>

          <p><strong>Step 3:</strong> To see if graph \\( G \\) is 3-colorable we look at the table of the root \\( A_r \\). If and only if it contains at least one true entry we know that graph \\( G \\)
          is colorable, recall that the subgraph induced by the root is \\( G \\) including all vertices.</p>

          <h2>Complexity</h2>
          <p>The running time of performing a post-order traversal is \\( O(n) \\)</p>
          <p>There are at most \\( 3^{k+1} \\) sub problems where \\( k\\) is treewidth. Thus, the running time is \\( O(3^{k+1}n) \\)</p>
          
          
          `);

          if (!window.graphContainer && !window.treeContainer) {
            const graphContainer = d3.select('#container')
              .append('div')
              .attr('id', 'graph-container');

            const treeContainer = d3.select('#container')
              .append('div')
              .attr('id', 'tree-container');

            window.graphContainer = graphContainer;
            window.treeContainer = treeContainer;
          }

          const graph = new Graph('graph-container');
          const niceTreeDecomposition = new Tree('tree-container');
          graph.loadGraph(graph1);

          await graph.computeTreeDecomposition();
          await graph.readNiceTreeDecomposition();
          const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
          niceTreeDecomposition.load(niceTreeDecompositionData);
          niceTreeDecomposition.setGraph(graph);
          niceTreeDecomposition.enableThreeColor();

          this.addArrowKeyFunctionality(niceTreeDecomposition);

          const controlsContainer = d3.select('#output').append('div')
            .attr('class', 'controls-container');

          controlsContainer
            .append('span')
            .text('keyboard_arrow_left')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => niceTreeDecomposition.previousDPStep());

          controlsContainer
            .append('span')
            .text('keyboard_arrow_right')
            .attr('class', 'material-icons nav-arrows')
            .on('click', () => niceTreeDecomposition.nextStep());
        },
        'chapter4',
      ),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <h2>Hamiltonian Cycle</h2>

          <p>
            <strong>Input:</strong> A graph \\( G \\) and a nice tree decomposition \\( T \\)
            <br>
            <strong>Output:</strong> If \\( G \\) contains a hamiltonian cycle.
          </p>
          `);
          this.addContainers();

          d3.select('#main')
            .append('div')
            .attr('id', 'dp-container')
            .attr('class', 'table-wrapper')
            .append('table')
            .attr('id', 'dp-table')
            .attr('class', 'hamiltonianTable');
          const graph = new Graph('graph-container');
          const niceTreeDecomposition = new Tree('tree-container');
          graph.loadGraph(cycleGraph);
          await graph.computeTreeDecomposition();
          await graph.readNiceTreeDecomposition();
          niceTreeDecomposition.load(hamTD);
          niceTreeDecomposition.setGraph(graph);
          niceTreeDecomposition.addArrow();
          niceTreeDecomposition.enableHamiltonianPath();
          this.createTableVisibilityButton();
          this.addAlgorithmControls(() => niceTreeDecomposition.previousDPStep(), () => niceTreeDecomposition.nextDPStep());
          this.addArrowKeyFunctionality(niceTreeDecomposition);
        },
        'chapter4',
      ),
    ];
    this.sections = this.sections.filter((section) => section.chapter === this.currentChapter);
    if (this.currentChapter === 'chapter5') this.createCustomSection();
  }

  toggleTableVisibility() {
    if (window.tableIsVisible) {
      d3.select('#toggle-visibility-button').text('Show table');
      d3.select('#dp-container').classed('tableVisible', false);
      d3.select('#dp-container').classed('tableTransparent', true);
      window.tableIsVisible = false;
    } else {
      d3.select('#toggle-visibility-button').text('Hide table');
      d3.select('#dp-container').classed('tableTransparent', false);
      d3.select('#dp-container').classed('tableVisible', true);
      window.tableIsVisible = true;
    }
  }

  createTableVisibilityButton() {
    d3.select('#app-area')
      .append('div')
      .text('Hide Table')
      .attr('id', 'toggle-visibility-button')
      .attr('class', 'toggle-table-visibilty')
      .on('click', () => this.toggleTableVisibility());
  }

  addArrowKeyFunctionality(tree) {
    d3.select('body').on('keydown', () => {
      switch (event.key) {
        case 'ArrowUp':
          tree.nextDPStep();
          break;
        case 'ArrowDown':
          tree.previousDPStep();
          break;
        default:
      }
    });
  }

  addAlgorithmControls(previous, next) {
    const controlsContainer = d3.select('#output').append('div')
      .attr('class', 'controls-container');

    controlsContainer.append('div').html('Use the up and down arrow keys to step through the algorithm.');

    controlsContainer
      .append('span')
      .text('keyboard_arrow_left')
      .attr('class', 'material-icons nav-arrows')
      .on('click', previous);

    controlsContainer
      .append('span')
      .text('keyboard_arrow_right')
      .attr('class', 'material-icons nav-arrows')
      .on('click', next);
  }

  addContainers() {
    if (!window.graphContainer && !window.treeContainer) {
      const graphContainer = d3.select('#container')
        .append('div')
        .attr('id', 'graph-container');

      const treeContainer = d3.select('#container')
        .append('div')
        .attr('id', 'tree-container');

      window.graphContainer = graphContainer;
      window.treeContainer = treeContainer;
    }
  }

  createSection() {
    if (!this.currentSection) this.currentSection = this.sections[0];
    d3.select('#graph-container').classed('graph-classes', false);
    d3.select('.nav').style('height', '5%');
    d3.select('#main').style('height', '95%');

    /* Query strings */
    window.history.replaceState({}, '', '?');
    const params = new URLSearchParams(location.search);
    params.set('chapter', window.chapterHandler.chapters.indexOf(window.chapterHandler.currentChapter) + 1);
    params.set('section', this.currentSectionIndex + 1);
    params.toString();
    window.history.replaceState({}, '', `?${params.toString()}`);
    /* Query strings end */

    this.removeElements();

    if (this.sidebar) this.sidebar.clear();
    if (this.tree) this.tree.clear();

    this.sections.map((section) => section.isActive = false);
    this.currentSection.isActive = true;
    this.currentSection.create();
    this.sidebar.updateProgressBar();
  }

  removeElements() {
    d3.select('#graph-container').selectAll('*').remove();
    d3.select('#tree-container').selectAll('svg').remove();
    d3.select('#container').selectAll('svg').remove();
    d3.select('#dp-container').remove();
    d3.select('#color-table').remove();
    d3.select('#graph-tooltip').remove();
    d3.select('#output').selectAll('*').remove();
    d3.select('#tooltip').remove();
    d3.select('#tooltip-arrow').remove();
    d3.select('#tree1').remove();
    d3.select('#tree2').remove();
    d3.select('#tree3').remove();
  }

  goPreviousSection() {
    if (this.currentSectionIndex === 0) return;
    this.currentSectionIndex--;
    this.currentSection = this.sections[this.currentSectionIndex];
    this.createSection();
  }

  goNextSection() {
    if (this.currentSectionIndex === this.sections.length - 1) return;
    this.currentSectionIndex++;
    this.currentSection = this.sections[this.currentSectionIndex];
    this.createSection();
  }

  goToSection(section) {
    this.currentSection = section;
    this.currentSectionIndex = this.sections.indexOf(section);
    this.createSection();
  }

  loadFirstSection() {
    this.currentSection = this.sections[0];
    this.createSection();
  }
}
