/* eslint-disable class-methods-use-this */
/* eslint-disable no-return-assign */
/* eslint-disable no-restricted-globals */
import Section from '../Components/Section.js';
import Graph from '../Components/Graph.js';
import Tree from '../Components/Tree.js';
import TreeDecomposition from '../Components/TreeDecomposition.js';
import {
  graph1,
  cycleGraph,
  separatorGraph,
  cliqueGraph,
  treeGraph,
  gridGraph,
  treeExampleForDynamicProgramming,
  nonValidTreeDecomposition,
} from '../Utilities/graphs.js';
import { addOverlay } from '../controller.js';

function createOutputContainer() {
  d3.select('#app-area').append('div').attr('id', 'output');
}

function createOutputSurface() {
  d3.select('#output').append('div').attr('id', 'output-surface');
}

function setupTreeContainer() {
  return d3.select('#container').append('div').attr('id', 'tree-container');
}

function createGraphContainer() {
  return d3.select('#container').append('div').attr('id', 'graph-container');
}

function setupGraphAndTreeContainers() {
  const graphContainer = createGraphContainer();
  const treeContainer = setupTreeContainer();

  window.graphContainer = graphContainer;
  window.treeContainer = treeContainer;
}

function createSeparatorExerciseOutput() {
  d3.select('#output-surface')
    .append('div')
    .attr('id', 'separator-output')
    .attr('class', 'separator-exercise-output');
}

function setupContainersForTreeDecompositions() {
  d3.select('#tree-container')
    .style('display', 'flex')
    .style('flex-direction', 'column');

  d3.select('#tree-container')
    .append('div')
    .attr('id', 'tree1')
    .style('display', 'flex')
    .style('flex', '0.33');

  d3.select('#tree-container')
    .append('div')
    .attr('id', 'tree2')
    .style('display', 'flex')
    .style('flex', '0.33');

  d3.select('#tree-container')
    .append('div')
    .attr('id', 'tree3')
    .style('display', 'flex')
    .style('flex', '0.33');
}

export default class SectionHandler {
  constructor(sidebar, chapter) {
    this.sidebar = sidebar;
    this.currentSectionIndex = 0;
    this.currentChapter = chapter;

    window.sectionHandler = this;

    this.sections = [
      new Section(async () => {
        this.sidebar.addContent(`
        In order to learn <i>treewidth</i> it is important to understand the concept of a graph separator.
        <p>A set $S$ is said to be a separator in a graph $G$ if the removal of that set leaves the graph into multiple components.</p>
        `);
        this.sidebar.addExercise('Find a separator in the graph.');
        createSeparatorExerciseOutput();
        const graph = new Graph('container');
        graph.loadGraph(separatorGraph);
        graph.enableSeparatorExercise();
        this.sidebar.setTitle('Graph Separator');
      }, 'chapter1'),
      new Section(
        async () => {
          this.sidebar.addContent(`
          <p>Let $S$ be a separator in a graph $G$.</p>
          <p>$S$ is a minimal separator if no proper subset of $S$ also separates the graph.</p>
          <p>In other words if some graph has a separator set $S = \\{ a,b \\}$ then $a$ on its own cannot separate the graph neither can $b$.</p>
          `);
          this.sidebar.addExercise('Find a minimal separator in the graph.');
          this.sidebar.setTitle('Minimal Separator');
          createSeparatorExerciseOutput();
          const graph = new Graph('container');
          graph.loadGraph(separatorGraph);
          graph.enableMinimalSeparatorExercise();
        },

        'chapter1'
      ),
      new Section(async () => {
        this.sidebar.addContent(`
          <p>Let $S$ be a separator in a graph $G$.</p>
          <p>We say that $S$ is a balanced separator if every component of $G - S$ has $ \\leq V(G) / 2 $</p>
          <p>That is every component after you remove $S$ should contain less than or equal amounts of vertices to the amount of vertices in the original graph divided by 2.</p>
          `);

        this.sidebar.addExercise('Find a balanced separator in the graph.');
        createSeparatorExerciseOutput();
        const graph = new Graph('container');
        graph.loadGraph(separatorGraph);
        graph.enableBalanceSeparatorExercise();
        this.sidebar.setTitle('Balanced Separator');
      }, 'chapter1'),
      new Section(async () => {
        this.sidebar.addContent(`
          <p>Informally we can describe the <i>treewidth</i> of a graph to be a tree "build" from its separators that we saw in the previous chapter.</p>
          <p>More formally we define the treewidth of a graph using the notion of <i>tree decompositions.</i></p>
          <p>A tree decomposition of a graph is a mapping of that graph into a tree adhering to certain properties.</p>
          <p>On the right you see a graph $G$ and one of its tree decompositions $T$.
          `);

        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        console.log(await graph.computeTreeDecomposition());
        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
              <p>We refer to each node in the tree decomposition as a <i>bag</i>.</p>
              <p>Each bag contains some vertices of the the graph.</p>
        `);
        this.sidebar.addExercise(
          'Try to hover over a bag to see its related vertices.'
        );
        this.sidebar.setTitle('Bags');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
        treeDecomposition.toggleHoverEffect();
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
            <p>We say that a tree decomposition is valid if it adheres to 3 properties: Node coverage, edge coverage and coherence.</p>
            <p><strong>Node Coverage</strong>: Every vertex that appears in the graph must appear in some bag of the tree decomposition. </p>
            <p>We will check every vertex in the graph and highlight the bag in the tree decompostion containing that vertex.</p>
            `);
        this.sidebar.setTitle('Node coverage');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
        this.sidebar.addButton(
          '<span class="material-icons">replay</span> Replay animation',
          () => graph.runNodeCoverage()
        );
        graph.runNodeCoverage();
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
            <strong>Edge coverage:</strong> For every edge that appears in the graph there is some bag in the tree decomposition which contains the vertice
            s of both ends of the edge.<br/><br/> Lets check if this holds true for our graph and tree decomposition.
            `);
        this.sidebar.setTitle('Edge coverage');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
        this.sidebar.addButton(
          '<span class="material-icons">replay</span> Replay animation',
          () => graph.runEdgeCoverage()
        );
        graph.runEdgeCoverage();
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
            <p><strong>Coherence:</strong> Consider 3 bags of the tree decomposition: $b_1$, $b_2$ and $b_3$ which form a path in the tree decomposition.</p>
            <p>If a vertex from the graph belongs to $b_1$ and $b_3$ it must also belong to $b_2$.</p>
            <p>That is, if a node exists in multiple bags it must form a connected subtree.</p>
        `);
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        this.sidebar.setTitle('Coherence');
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
        this.sidebar.addButton(
          '<span class="material-icons">replay</span> Replay animation',
          () => graph.highlightCoherence()
        );
        graph.highlightCoherence();
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
            <p>A graph can have multiple valid tree decompositions.</p>
            <p>Lets take a look at some other valid tree decompositions of the graph.</p>
            <p><strong>Example:</strong> The trivial tree decomposition of this graph contains all the graph's vertices in one bag.</p>
            `);
        this.sidebar.setTitle('Trivial tree decomposition');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        const treeDecomposition = new Graph('tree-container', 'tree');
        const trivialTreeDecomposition = graph.computeTrivialTreeDecomposition();
        treeDecomposition.loadGraph(trivialTreeDecomposition);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(
          '<p>This is another valid tree decomposition of the graph.</p>'
        );
        this.sidebar.setTitle('Valid tree decompositions');

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

        const treeDecomposition = new Graph('tree-container', 'tree');
        treeDecomposition.loadGraph(anotherTd);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addExercise(
          'Is this a valid tree decomposition of the graph?'
        );
        this.sidebar.setTitle('Valid tree decomposition quiz #1');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        const treeDecomposition = new Graph('tree-container', 'tree');
        treeDecomposition.loadGraph(nonValidTreeDecomposition);
        this.sidebar.addQuiz();
        this.sidebar.addChoice('Yes', false);
        this.sidebar.addChoice('No', true);
        this.sidebar.addSolution(
          'Since the vertex 1 is in 2 bags it must form a connected subtree but in this tree it does not. Recall property 3.'
        );
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addExercise(
          'Is this a valid tree decomposition of the graph?'
        );
        this.sidebar.setTitle('Valid tree decomposition quiz #2');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        this.sidebar.addQuiz();
        this.sidebar.addChoice('Yes', true);
        this.sidebar.addChoice('No', false);
        this.sidebar.addSolution(
          'It satisfies all the properties of a tree decomposition thus it is valid.'
        );
        const treeDecomposition = new Graph('tree-container', 'tree');
        await graph.computeTreeDecomposition();

        const td = graph.getTreeDecomposition();
        treeDecomposition.loadGraph(td);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
        <p>If there are different tree decompositions for a graph how do know which ones to use?</p>
        <p>We want to use the tree decomposition with the lowest possible vertices in it's largest bag, as this makes many algorithms compute faster on the tree decomposition.</p>
        <p class="fact"><span class="fact-title">Fact:</span> The <i>width</i> of a tree decomposition is the size of the largest bag minus 1.</p>
        <p class="fact"><span class="fact-title">Fact:</span> The <i>treewidth</i> of a graph is the minimum width amongst all the tree decompositions of the graph.</p>
        `);
        this.sidebar.addExercise(
          'What is the width of the current tree decomposition?'
        );
        this.sidebar.setTitle('Width vs treewidth');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree');
        treeDecomposition.loadGraph(td1);
        this.sidebar.addQuiz();
        this.sidebar.addChoice('1', false);
        this.sidebar.addChoice('2', true);
        this.sidebar.addChoice('3', false);
        function timeout(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }
        await timeout(1500);
        this.sidebar.addSolution(
          'The treewidth of a tree decomposition is the size of the largest bag - 1.'
        );
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addExercise(
          'What is the width of the tree decomposition?'
        );
        this.sidebar.setTitle('Width vs treewidth quiz #1');

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
        this.sidebar.addSolution(
          '4 Since the largest bag contains 5 vertices.'
        );

        const treeDecomposition = new Graph('tree-container', 'tree');
        treeDecomposition.loadGraph(anotherTd);
      }, 'chapter2'),
      new Section(async () => {
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
        this.sidebar.setTitle('Width vs treewidth quiz #2');
        this.sidebar.addExercise(
          'What is the width of the tree decomposition?'
        );
        this.sidebar.addQuiz();
        this.sidebar.addChoice('2', false);
        this.sidebar.addChoice('4', false);
        this.sidebar.addChoice('5', true);
        this.sidebar.addSolution(
          '5 Since the largest bag contains 6 vertices.'
        );
        const treeDecomposition = new Graph('tree-container', 'tree');
        treeDecomposition.loadGraph(td3);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
            <p>Lets assume that the 3 tree decompositions you see on the right are ALL of the possible tree decompositions of the graph \\( G \\)
            (This is not true but for this exercise we will make this assumption.)</p>
            `);
        this.sidebar.setTitle('Treewidth quiz #1');
        this.sidebar.addExercise('What is the <i>treewidth</i> of the graph?');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        setupContainersForTreeDecompositions();
        await graph.computeTreeDecomposition();

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

        const tree1 = new Graph('tree1', 'tree');
        const tree2 = new Graph('tree2', 'tree');
        const tree3 = new Graph('tree3', 'tree');

        this.tree1 = tree1;
        this.tree2 = tree2;
        this.tree3 = tree3;

        tree1.loadGraph(td1);
        tree2.loadGraph(td3);
        tree3.loadGraph(td4);

        this.sidebar.addQuiz();
        this.sidebar.addChoice('2', true);
        this.sidebar.addChoice('5', false);
        this.sidebar.addChoice('3', false);
        this.sidebar.addSolution(
          'The correct answer is 2. Recall that the treewidth of a graph is the minimum width amonst all of the possible tree decompositions.'
        );
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
            <p>We will now put our attention towards understanding how graph separators work in tree decompositions. If you dont recall the concept of graph separators go through chapter 2.</p>
            <p>Each bag in the tree decomposition act as a separator in the graph.</p>
            <p>For example the bag containing 2 3 4 separates 1 and 5 6 7 in the graph.</p>
            `);
        this.sidebar.setTitle('Separators in tree decompositions');
        this.sidebar.addExercise(
          'Hover over a bag in the tree decomposition to see how it separates the graph.'
        );
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
        treeDecomposition.toggleSeparator();
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
          <p>Let's test your knowledge of the tree decomposition properties.</p>
          <p><strong>Add bags</strong> for the tree decomposition by clicking anywhere in the highlighted space.</p>
          <p><strong>Add edges</strong> between bags by dragging and clicking on a node.</p>
          <p><strong>Change</strong> which vertices should be contained inside each bag by right-clicking and select set value. Separate each vertix using a comma.</p>
          <p>(Example: If you wanted 1, 2 and 3 contained in a bag, write it as such: 1,2,3)</p>
          <p><strong>Delete a bag</strong> by right-clicking and click delete bag.</p>
          <p><strong>Remove an edge</strong> by right-clicking on it.</p>
          `);
        this.sidebar.setTitle('Create the tree decomposition');
        this.sidebar.addExercise(
          'Draw the tree tree decompostion of the graph.'
        );
        const graph = new Graph('graph-container');
        graph.randomGraph();
        const td = new TreeDecomposition('tree-container', graph);
        this.td = td;
        td.enableDrawing();
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
        <p>Certain graph classes have constant treewidth regardless of the number of vertices/edges in that particular graph.</p>
        <p>Consider the $3$ x $3$ grid on the right. Intuitively we can see there is no way we can separate this graph using less than $3$ vertices.</p>
        <p class="fact"><span class="fact-title">Fact:</span> For every $k \\geq 2$, the treewidth of the $k$ x $k$ grid is exactly $k$</p>
        `);
        this.sidebar.setTitle('Treewidth of grids');
        const graph = new Graph('graph-container');
        graph.loadGraph(gridGraph);

        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
          <p><i>Trees</i> have treewidth 1.</p>
          <p>This is also the reason why we say that the width of the tree decomposition is the largest bag - 1. For historical reasons the first people studying treewidth wanted trees to have width 1.</p>
          `);
        this.sidebar.setTitle('Treewidth of trees');

        d3.select('#container').style('height', '100%');
        d3.select('#output').style('height', '0');

        const graph = new Graph('graph-container');
        graph.loadGraph(treeGraph);

        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
           <p>As you can tell by the graph and its tree decomposition a clique has a large treewidth. An optimal tree decomposition of a clique is the trivial decomposition.</p>
           <p class="fact"><span class="fact-title">Fact:</span> The treewidth of clique $k$ is $k - 1$</p>
          `);
        this.sidebar.setTitle('Treewidth of cliques');
        const graph = new Graph('graph-container');
        graph.loadGraph(cliqueGraph);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
      }, 'chapter2'),
      new Section(async () => {
        this.sidebar.addContent(`
           <p>Outerplanar graphs have treewidth 2.</p>
          `);
        this.sidebar.setTitle('Treewidth of outerplanar graphs');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
      }, 'chapter2'),

      new Section(async () => {
        this.sidebar.addContent(`
          <p>One part that you might have noticed that we left out is how do we construct these tree decompositions?</p>

          <p>This is because an algorithm that constructs a tree decomposition given a graph is far from a trivial thing to do.
          This in of itself could be a chapter. We have decided to rather focus on the properties of tree decompositions and how algorithms exploit them.</p>

          <p>All that is needed to know for this interactive course is that it is NP-Hard to determine the treewidth of a graph. 
          However there exists approximation algorithms that can find that provides an approximate treewidth given a graph. 
          (<a href="https://www.sciencedirect.com/science/article/pii/S0304397597002284?via%3Dihub">Bodlaender et al. 2016</a>)</p>

          <p>This also means discovering if a tree decomposition of width $k$ k exists without knowledge of the treewidth is also NP Hard.
          Although for a small constant $k$ it is possible to find a tree decomposition in linear time. (<a href="https://epubs.siam.org/doi/10.1137/S0097539793251219">Bodlaender 1996</a>)
          </p>         

          <p>If you want to know more of the construction of tree decompositions the Chapter 10.5 in <a href="https://www.pearson.com/us/higher-education/program/Kleinberg-Algorithm-Design/PGM319216.html"
          >Algorithm Design</a> is a good place to start.</p>

          <p>We use a Java library called <a href="https://github.com/maxbannach/Jdrasil">Jdrasil</a> to compute tree decompositions.
          The algorithm used in the library to obtain an exact tree decomposition is a mix of several known tree decomposition solvers.
          </p>

          <p>You can read more in their paper: <a href="https://drops.dagstuhl.de/opus/volltexte/2017/7605/pdf/LIPIcs-SEA-2017-28.pdf">Jdrasil: A Modular Library for Computing Tree Decompositions</a>.</p>
          `);
        this.sidebar.setTitle('Computing treewidth');
        const graph = new Graph('graph-container');
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const td1 = graph.getTreeDecomposition();
        const treeDecomposition = new Graph('tree-container', 'tree', graph);
        treeDecomposition.loadGraph(td1);
      }, 'chapter2'),
      new Section(async () => {
        if (!window.graphContainer && !window.treeContainer)
          setupGraphAndTreeContainers();
        this.sidebar.addContent(`
          <p>Algorithms that exploit tree decompositions are often represented using a variation of tree decompositions called nice tree decompositions.</p>

          <p>
            <strong>Notation:</strong>
            <br/ >
            $T$ for the tree decomposition.
            <br />
            $n$ for a node in $T$.
            <br />
            $B_n$ for the bag at node $n$.
            <br />
            $B_c$ for the bag at a child node $c$.
            <br />
            $v$ for a forgotten or introduced vertex.
          </p>

          <p>
            A rooted tree decomposition $T$ of a graph $G$ is nice if every node
            $n$ is of one of the following types:
          </p>
             
           <p>
            <svg class="lo" width="15" height="15">
            <rect class="leaf-node-sample" width="15" height="15">
            </svg>
         <strong>Leaf node:</strong>
            <br />
            $n$ has no children and $B_n$ contains no vertices
           </p>

          <p>
          <svg class="lo" width="15" height="15">
          <rect class="introduce-node-sample" width="15" height="15">
          </svg>
           <strong>Introduce node:</strong>
           <br />
           $n$ has a child $c$ then $B_n = B_c \\cup v $ where $v \\notin B_c$
         </p>

         <p>
         <svg class="lo" width="15" height="15">
         <rect class="forget-node-sample" width="15" height="15">
         </svg>
           <strong>Forget node:</strong>
           <br />
           $n$ has a child $c$ then $B_n = B_c - v$ where $v \\in B_c$
         </p>

          <p>
          <svg class="lo" width="15" height="15">
          <rect class="join-node-sample" width="15" height="15">
          </svg>
            <strong>Join node:</strong>
            <br/>
            $n$ has two children $l$ and $r$ then $B_n = B_{l} = B_{r}$
          </p>
          `);
        this.sidebar.setTitle('Nice Tree Decompositions');
        const graph = new Graph('graph-container');
        graph.randomGraph();
        await graph.computeTreeDecomposition();
        const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
        console.log(niceTreeDecompositionData);
        const niceTreeDecomposition = new Tree('tree-container');
        niceTreeDecomposition.load(niceTreeDecompositionData);
        niceTreeDecomposition.setGraph(this.graph);
      }, 'chapter3'),
      new Section(async () => {
        d3.select('#graph-container').remove();
        d3.select('#tree-container').remove();
        window.graphContainer = null;
        window.treeContainer = null;
        const tree = new Tree('container', 'normal-tree');
        window.niceTreeDecomposition = tree;
        tree.setMisNormalTree();
        tree.load(treeExampleForDynamicProgramming, 'normal-tree');
        tree.addArrow();

        this.sidebar.addContent(`
        <p class="warning"><i>This is not the best introduction to dynamic programming on tree decompositions since it makes use of grandchildren.
        Dániel Marx provides a better example <a href="https://www.youtube.com/watch?v=RV5iQji_icQ&t=135" target="_blank">in this video @ 1:35</a></i>.</p>
        <p>Most algorithms that exploit <i>tree decompositions</i> use dynammic programming. For this reason we will present a brief reminder on how dynammic programming works on general trees.</p>
        <p>Let's now look at how the <i>maximum independent set</i> problem works on a tree.</p>
        <div class="algorithm-description">
        <p>
          <strong>Input:</strong> A tree.
          <br>
          <strong>Output:</strong> The <i>maximum independent set</i> of the tree.
        </p>
          <div>
            <p class="algorithm-description-step">Step 1:</p>
            <hr />
            Perform a post-order (bottom-up) traversal of the tree.
          </div>

          <div>
            <p class="algorithm-description-step">Step 2:</p>
            <hr />
            At each node $n$ we compute a dynamic programming table $C_n$ with two rows.</p>
            <p>
              If $n$ is a leaf:
              <br />
              Set both rows to 1.
            </p>
            <p>
              If $n$ is not a leaf or a root node we calculate 2 rows:
              <br />
              <i>Max set incl.</i> we include $n$ and its grandchildren.
              <br />
              <i>Max set excl.</i> we do not include $n$ but we do include the children of $n$.
            </p>
            <p>Store the bigger of the 2.</p>
          </div>
    
          <div>
            <p class="algorithm-description-step">Step 3:</p>
            <hr />
            Retrieve the largest entry in the root table $C_r$ to get the <i>maximum independent set</i> of the tree.</p>
          </div>
          </div>
        
      `);
        this.sidebar.setTitle('Dynamic Programming on Trees');
        tree.setAllNodes();
        this.addAlgorithmControls(
          () => tree.previousStep(),
          () => tree.nextStep()
        );
      }, 'chapter3'),
      new Section(async () => {
        if (!window.graphContainer && !window.treeContainer)
          setupGraphAndTreeContainers();
        this.sidebar.addContent(`
        <p>
        Each row in the table $C_n$ consists of a subset $S \\subseteq B_n$ in the
        first column and the size of the maximum independent set of that set in
        the second column. If $S$ breaks the independence property we omit this entry from the table.
        </p>
      <div class="algorithm-description">
        <p>
          <strong>Input:</strong> A nice tree decomposition $T$ of a graph $G$.
          <br />
          <strong>Output:</strong> The size of the maximum independent set of $G$.
        </p>
  
        <div class="algorithm-description-node-type">
          <p class="algorithm-description-step">Step 1:</p>
          <hr />
          Perform a post-order (bottom-up) traversal of $T$.
        </div>
  
        <div>
          <p class="algorithm-description-step">Step 2:</p>
          <hr />
          For each node $n \\in T$ compute the table $C_n$.
          <br />
        </div>

        <div  class="algorithm-description-node-type">
          <svg class="lo" width="15" height="15"><rect class="leaf-node-sample" width="15" height="15"></svg>
          Leaf node $n$ where $B_n$ is empty.
          <br />
          $C_n(\\emptyset)=0$
        </div>
  
        <div class="algorithm-description-node-type">
          <svg class="lo" width="15" height="15"><rect class="introduce-node-sample" width="15" height="15"></svg>
          Introduce node: We introduce $v$ to a bag $B_c$ to get bag $B_n$.
          <br />
          $C_n(S) = C_c(S)$
          $$
            C_n(S \\cup \\{ v \\} ) = \\begin{cases} −∞ &
            \\text{if } \\exists w \\in S : \\{ v,w \\} \\in E(G) \\\\ C_c(S) + 1 &
            \\text{else } \\end{cases}
          $$
        </div>
  
        <div class="algorithm-description-node-type">
          <svg class="lo" width="15" height="15"><rect class="forget-node-sample" width="15" height="15"></svg>  
          Forget node: We forget $v$ from $B_c$ to get bag $B_n$.
          <br />
          $C_n(S) = max \\{ C_c(S), C_c( S \\cup \\{ v \\} ) \\}$
        </div>
  
        <div class="algorithm-description-node-type">
          <svg class="lo" width="15" height="15"><rect class="join-node-sample" width="15" height="15"></svg>
          Join node: We join node $l$ and $r$ to get node $n$. All the bags are the same that is: $B_n = B_{l} = B_{r}$.
          <br />
          $C_n(S) = B_{l}(S) + B_{r}(S) - |S|$
        </div>
  
        <p>
          <p class="algorithm-description-step">Step 3:</p>
          <hr />
          Retrieve the entry with the largest set from the root table $C_r$.
        </p>
      </div>
         `);
        const graph = new Graph('graph-container');
        const niceTreeDecomposition = new Tree('tree-container');
        window.niceTreeDecomposition = niceTreeDecomposition;
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
        niceTreeDecomposition.load(niceTreeDecompositionData);
        niceTreeDecomposition.setGraph(graph);
        niceTreeDecomposition.enableMaximumIndependentSet();
        this.sidebar.setTitle('Maximum Indpependent Set');
        this.createTableVisibilityButton();
        this.addAlgorithmControls(
          () => niceTreeDecomposition.previousDPStep(),
          () => niceTreeDecomposition.nextDPStep()
        );
      }, 'chapter3'),
      new Section(async () => {
        if (!window.graphContainer && !window.treeContainer)
          setupGraphAndTreeContainers();
        this.sidebar.addContent(`
        <p>We present an algorithm for finding out if a graph is <i>3-colorable</i> given a graph and a tree decomposition.</p>
        <p>
          <strong>Notation:</strong>
          <br>
          $T$ for the tree decomposition.
          <br>
          $B_n$ bag for a node $n$ in $T$.
          <br>
          $B_{\\downarrow n}$ for all vertices contained in all the bags below (and including) $n \\in T$.
          <br>
          $G_n$ for the induced sub-graph of the vertices in $B_{\\downarrow n}$.
          <br>
          $c$ is a function that labels each vertex $v \\in B_n$ one of the following colors: <span class="red">red</span>, <span class="green">green</span> or <span class="blue">blue</span>.
        </p>

        <p>
          <strong>What we want to see in a partial solution:</strong>
          <br>
          We define $c$ to be true if there exists a 3-coloring $c'$ of $G_n$ such that $c(v)=c'(v)$ for every $v \\in B_n$.
        <p>
          <div class="algorithm-description">
          <p>
            <strong>Input:</strong> A graph $G$ and its nice tree decomposition $T$.
            <br />
            <strong>Output:</strong> If $G$ is 3-colorable.
          </p>

          <div>
            <p class="algorithm-description-step">Step 1:</p>
            <hr />
            Perform a post-order (bottom-up) traversal of $T$.
          </div>

          <div>
            <p class="algorithm-description-step">Step 2:</p>
            <hr />
            <div  class="algorithm-description-node-type">
              <p><svg class="lo" width="15" height="15"><rect class="leaf-node-sample" width="15" height="15"></svg>
              Leaf node $n$ where $B_n$ is empty.</p>
              The table at leaf node consists of the empty function $c$.
            </div>

            <div class="algorithm-description-node-type">
              <p><svg class="lo" width="15" height="15"><rect class="introduce-node-sample" width="15" height="15"></svg>
              Introduce node: We introduce $v$ to a bag $B_c$ to get bag $B_n$.</p>
              If $c(v) \\neq c(w)$ for every adjacent $w$ of $v$ then set $c$ to $true$.
            </div>

            <div class="algorithm-description-node-type">
              <p><svg class="lo" width="15" height="15"><rect class="forget-node-sample" width="15" height="15"></svg>  
              Forget node: We forget $v$ from $B_c$ to get bag $B_n$.</p>
              $c$ is true if $c'$ is true for one of the extensions of $c$ to $B_c$.
              <br>
              In other words we compute all the possible ways to color $B_n$ and for each coloring we check if it can extended to $B_c$ with at least one of the possible colors.
            </div>

            <div class="algorithm-description-node-type">
              <p><svg class="lo" width="15" height="15"><rect class="join-node-sample" width="15" height="15"></svg>
              Join node: We join node $l$ and $r$ to get node $n$. All the bags are the same that is: $B_n = B_{l} = B_{r}$.</p>
              $C_n = C_l \\wedge C_r$
            </div>

          </div>
            <p class="algorithm-description-step">Step 3:</p>
            <hr />
            <p>If and only if the root table $C_r$ contains at least one true entry we know that graph $G$ is 3-colorable.</p>
          </div>
          </div>
          `);
        this.sidebar.setTitle('3-Colorable');
        this.createTableVisibilityButton();
        const graph = new Graph('graph-container');
        const niceTreeDecomposition = new Tree('tree-container');
        window.niceTreeDecomposition = niceTreeDecomposition;
        graph.loadGraph(graph1);
        await graph.computeTreeDecomposition();

        const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
        niceTreeDecomposition.load(niceTreeDecompositionData);
        niceTreeDecomposition.setGraph(graph);
        niceTreeDecomposition.enableThreeColor();
        this.addAlgorithmControls(
          () => niceTreeDecomposition.previousDPStep(),
          () => niceTreeDecomposition.nextDPStep()
        );
      }, 'chapter3'),
      new Section(async () => {
        if (!window.graphContainer && !window.treeContainer)
          setupGraphAndTreeContainers();
        this.sidebar.addContent(`
          <div>
          <p>Here is presented an algorithm for finding whether or not a graph has a <i>Hamiltonian cycle</i> given a graph and a tree decomposition.</p>
          <p>Consider a graph and its tree decomposition:
          <br />
          - We define the tree decomposition as $T$
          <br />
          - $B_n$ for the bag at a node $n \\in T$. 
          <br />
          - $B_{\\downarrow n}$ for all vertices contained in all the bags below (and including) $n \\in T$.
          </p>
          
          <p>
            Each state at node $n \\in T$ is a pair $(d,M)$ where:
            <br />
            - $d$ is a function that labels each vertex $v \\in B_n$ with a degree we want to see in a partial solution.
            <br />
            - $M$ is matching of the vertices that are labeled 0 or 1 by the function $d$.
          </p>

          <p>
            A state at node $n$ is supposed to be $true$ iff a partial solution of the state $(d,M)$ can be realized in the sub-graph induced by $B_{\\downarrow n}$.
          </p>

          <p>
          A vertex is considered an endpoint if it has been prescribed degree 0 or 1 by $d$.
          </p>

          </div>
          <div class="algorithm-description">
            <p>
              <strong>Input:</strong> A graph $G$ and a nice tree decomposition $T$.
              <br>
              <strong>Output:</strong> If $G$ contains a Hamiltonian cycle.
            </p>

            <div>
              <p class="algorithm-description-step">Step 1:</p>
              <hr />
              Perform a post-order (bottom-up) traversal of $T$.
            </div>

            <div>
              <p class="algorithm-description-step">Step 2:</p>
              <hr />
              For each node $n \\in T$ compute the table $C_n$.
            </div>

            <div  class="algorithm-description-node-type">
              <svg class="lo" width="15" height="15"><rect class="leaf-node-sample" width="15" height="15"></svg>
              Leaf node $n$ where $B_n$ is empty.
              <br />
              Contains one state $(d,M)$ where $d$ is the empty function and $M$ is the empty matching.
            </div>

            <div class="algorithm-description-node-type">
              <svg class="lo" width="15" height="15"><rect class="introduce-node-sample" width="15" height="15"></svg>
              Introduce node: We introduce $v$ to a bag $B_c$ to get bag $B_n$.
              <br />
              <br />
              $d(v)=0$ in this case we added $v$ as an isolated vertex. We add $v$ to the degree function and add $v$ as a singleton to $M$.
              <br />
              <br />
              $d(1)=1$ in this case we added $v$ as a path endpoint. We now need to check if there exists an edge $wv$ in $G$.
              If we find such an edge we then need to check the degree of $w$ in $(d',M')$.
              <div class="w">
              If $d(w)=0$
              <br />
              Set $w \\to 1$
              <br />
              Set $v \\to 1$
              <br />
              Add the pair $(w,v)$ to the matching $M$.
              <br />
              Set this state to $true$
              <br />
              If $d(w)=1$
              <br />
              We need to find a pair $(u,w)$ in $M'$ and change it to $(u,v)$.
              <br />
              Set $v \\to 1$
              <br />
              Set $w \\to 2$
              <br />
              Set this state to $true$
              </div>
              <br />
              $d(v)=2$ in this we added $v$ as an inner vertex of a path.
              We need to find two edges $vw_1$ and $vw_2$ in $G$. If such two edges exist we need to update $d$ and $M$ and set the state to $true$:
              <br />
              $d(w_1) = d'(w_1)+1$
              <br />
              $d(w_2) = d'(w_2)+1$
              <br />
              If $d(w_1)$ and $d(w_2)$ updated degrees are 1 we also need to add this to $M$.
            </div>

            <div class="algorithm-description-node-type">
              <svg class="lo" width="15" height="15"><rect class="forget-node-sample" width="15" height="15"></svg>  
              Forget node: We forget $v$ from $B_c$ to get bag $B_n$.
              <br />
              For all true states $(d',M')$ of $B_c$ do the following:
              <br />
              - Set states with $d(v)=2$ to $true$.
              <br />
              - To get $(d,M)$ remove $v$ from $d'$ and from $M'$.
            </div>

            <div class="algorithm-description-node-type">
              <svg class="lo" width="15" height="15"><rect class="join-node-sample" width="15" height="15"></svg>
              Join node: We join node $l$ and $r$ to get node $n$. All the bags are the same that is: $B_n = B_{l} = B_{r}$.
              <br />
              The states $s_l(d',M')$ of $B_l$ and the states $s_r(d'',M'')$ of $B_r$ are already known. We now want to compute the states $s_n(d,M)$ for $B_n$.
              First iterate over all states $s_l(d',M')$ of $B_l$ and $s_r(d'',M'')$ and check for the following:
              <br />
              - Is $d(v')+d(v'') \\leq 2$ for all $v \\in B_n$? 
              <br />
              - Does $M' \\cup M''$ contain a cycle?
              <br />
              If both requirements pass then this is a true state and $d(v)=d'(v)+d''(v)$ and $M=M' \\cup M''$.
            </div>

            <p class="algorithm-description-step">Step 3:</p>
            <hr />
            During the algorithm at a given node $n$ in $T$ if there exists no state (excluding leaf and root nodes) that means we found a sub-graph in the graph whose presence
            rules out a Hamiltonian cycle in the overall graph.
            If however there exists a state in the root node there exists a Hamiltonian cycle in the graph. 
            </div>
          </div>
          `);
        this.addContainers();
        this.sidebar.setTitle('Hamiltonian Cycle');
        const graph = new Graph('graph-container');
        const niceTreeDecomposition = new Tree('tree-container');
        window.niceTreeDecomposition = niceTreeDecomposition;
        graph.loadGraph(cycleGraph);
        await graph.computeTreeDecomposition();

        const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
        niceTreeDecomposition.load(niceTreeDecompositionData);
        niceTreeDecomposition.setGraph(graph);
        niceTreeDecomposition.addArrow();
        niceTreeDecomposition.enableHamiltonianCycle();
        this.createTableVisibilityButton();
        this.addAlgorithmControls(
          () => niceTreeDecomposition.previousDPStep(),
          () => niceTreeDecomposition.nextDPStep()
        );
      }, 'chapter3'),
    ];
    this.sections = this.sections.filter(
      (section) => section.chapter === this.currentChapter
    );
  }

  toggleTableVisibility() {
    if (window.tableIsVisible) {
      d3.select('#toggle-visibility-button').text('Show table');
      d3.select('#tableX').classed('tableVisible', false);
      d3.select('#tableX').classed('tableTransparent', true);
      d3.select('#tooltip-arrow').style('opacity', 0);
      window.tableIsVisible = false;
    } else {
      d3.select('#toggle-visibility-button').text('Hide table');
      d3.select('#tableX').classed('tableTransparent', false);
      d3.select('#tableX').classed('tableVisible', true);
      d3.select('#tooltip-arrow').style('opacity', 1);
      window.tableIsVisible = true;
    }
  }

  createTableVisibilityButton() {
    d3.select('#app-area')
      .append('div')
      .text('Hide Table')
      .attr('id', 'toggle-visibility-button')
      .attr('class', 'button toggle-table-visibilty')
      .on('click', () => this.toggleTableVisibility());
  }

  addAlgorithmControls(previous, next) {
    const controlsContainer = d3
      .select('#output-surface')
      .append('div')
      .attr('class', 'controls-container');

    controlsContainer
      .append('span')
      .text('keyboard_arrow_up')
      .attr('class', 'material-icons pagination-arrows')
      .attr('id', 'arrow-up')
      .on('click', next);

    controlsContainer
      .append('span')
      .text('keyboard_arrow_down')
      .attr('class', 'material-icons pagination-arrows')
      .on('click', previous);
  }

  addContainers() {
    if (!window.graphContainer && !window.treeContainer) {
      const graphContainer = d3
        .select('#container')
        .append('div')
        .attr('id', 'graph-container');

      const treeContainer = d3
        .select('#container')
        .append('div')
        .attr('id', 'tree-container');

      window.graphContainer = graphContainer;
      window.treeContainer = treeContainer;
    }
  }

  async createSection() {
    window.isSectionLoaded = false;
    addOverlay();
    if (!this.currentSection) this.currentSection = this.sections[0];
    if (this.sidebar) this.sidebar.clear();
    if (this.tree) this.tree.clear();
    window.sectionNumber = this.currentSectionIndex + 1;

    if (window.chapterNumber === 2 && window.sectionNumber === 15) {
      d3.select('#output').remove();
      d3.select('#app-area').append('div').attr('id', 'output');
      d3.select('#container').style('height', '93%');
      createOutputContainer();
      createOutputSurface();
    }

    if (window.chapterNumber === 2 && window.sectionNumber !== 15)
      d3.select('#container').style('height', '100%');
    d3.select('#graph-container').classed('graph-classes', false);
    this.handleQueryString();
    this.removeElements();
    this.sections.map((section) => (section.isActive = false));
    this.currentSection.isActive = true;
    this.sidebar.updateProgressBar();
    await this.currentSection.create();
  }

  handleQueryString() {
    window.history.replaceState({}, '', '?');
    const params = new URLSearchParams(location.search);
    params.set(
      'chapter',
      window.chapterHandler.chapters.indexOf(
        window.chapterHandler.currentChapter
      ) + 1
    );
    params.set('section', this.currentSectionIndex + 1);
    params.toString();
    window.history.replaceState({}, '', `?${params.toString()}`);
  }

  removeElements() {
    d3.select('#graph-container').selectAll('*').remove();
    d3.select('#tree-container').selectAll('svg').remove();
    d3.select('#container').selectAll('svg').remove();
    d3.select('#dp-container').remove();
    d3.select('#color-table').remove();
    d3.select('#graph-tooltip').remove();
    d3.select('#output-surface').selectAll('*').remove();
    d3.select('#tooltip').remove();
    d3.select('#tooltip-arrow').remove();
    d3.select('#tree1').remove();
    d3.select('#tree2').remove();
    d3.select('#tree3').remove();
    d3.select('#toggle-visibility-button').remove();
    d3.select('#tableX').remove();
  }

  async goPreviousSection() {
    if (window.isSectionLoaded === false) return;
    if (this.currentSectionIndex === 0) return;
    this.currentSectionIndex--;
    this.currentSection = this.sections[this.currentSectionIndex];
    await this.createSection();
  }

  async goNextSection() {
    if (window.isSectionLoaded === false) return;
    if (this.currentSectionIndex === this.sections.length - 1) return;
    this.currentSectionIndex++;
    this.currentSection = this.sections[this.currentSectionIndex];
    await this.createSection();
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
