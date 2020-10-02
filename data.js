import Graph from '../Components/Graph.js';
import Section from '../Components/Section.js';
import Tree from '../Components/Tree.js';
import TreeDecomposition from '../Components/TreeDecomposition.js';
import {
  graph1,
  cycleGraph,
  separatorGraph,
  cliqueGraph,
  treeGraph,
  gridGraph,
  nonValidTreeDecomposition,
  validTreeDecomposition2,
  td1,
  td2,
  td3,
  td4,
} from '../Utilities/graphs.js';

function toggleTableVisibility() {
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

function createTableVisibilityButton() {
  d3.select('#app-area')
    .append('div')
    .text('Hide Table')
    .attr('id', 'toggle-visibility-button')
    .attr('class', 'button toggle-table-visibilty')
    .on('click', () => this.toggleTableVisibility());
}

function addAlgorithmControls(previous, next) {
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

function addContainers() {
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

/* function createOutputContainer() {
  d3.select('#app-area').append('div').attr('id', 'output');
}

function createOutputSurface() {
  d3.select('#output').append('div').attr('id', 'output-surface');
} */

function setupContainersForTreeDecompositions() {
  d3.select('#tree-container')
    .style('display', 'flex')
    .style('flex-direction', 'column');

  d3.select('#tree-container')
    .append('div')
    .attr('id', 'tree1')
    .attr('class', 'multi-tree-container');

  d3.select('#tree-container')
    .append('div')
    .attr('id', 'tree2')
    .attr('class', 'multi-tree-container');

  d3.select('#tree-container')
    .append('div')
    .attr('id', 'tree3')
    .attr('class', 'multi-tree-container');
}

function setupTreeContainer() {
  d3.select('#container').append('div').attr('id', 'tree-container');
}

function createGraphContainer() {
  d3.select('#container').append('div').attr('id', 'graph-container');
}

function setupGraphAndTreeContainers() {
  createGraphContainer();
  setupTreeContainer();
}

function createSeparatorExerciseOutput() {
  d3.select('#output-surface')
    .append('div')
    .attr('id', 'separator-output')
    .attr('class', 'separator-exercise-output')
    .on('input', () => console.log('here'));
}

function createOutputContainer() {
  d3.select('#app-area')
    .append('div')
    .attr('id', 'output');
}

function createOutputSurface() {
  d3.select('#output').append('div').attr('id', 'output-surface');
}

const sections = [
  new Section(
    `
    <p>In order to learn <i>treewidth</i> it is important to understand the concept of a graph separator.</p>
    <p>A set $S$ is said to be a separator in a graph $G$ if the removal of that set leaves the graph into multiple components.</p>
    `,
    async () => {
      createOutputContainer();
      createOutputSurface();
      createSeparatorExerciseOutput();
      const graph = new Graph('container');
      graph.load(separatorGraph);
      graph.enableSeparatorExercise();
    },
    1,
    'Graph Separator',
  ),
  new Section(
    `
    <p>Let $S$ be a separator in a graph $G$.</p>
    <p>$S$ is a minimal separator if no proper subset of $S$ also separates the graph.</p>
    <p>In other words if some graph has a separator set $S = \\{ a,b \\}$ then $a$ on its own cannot separate the graph neither can $b$.</p>
    `,
    async () => {
      // this.sidebar.addExercise('Find a minimal separator in the graph.');
      createOutputContainer();
      createOutputSurface();
      createSeparatorExerciseOutput();
      const graph = new Graph('container');
      graph.load(separatorGraph);
      graph.enableMinimalSeparatorExercise();
    },
    1,
    'Minimal Separator',
  ),
  new Section(
    `
    <p>Let $S$ be a separator in a graph $G$.</p>
    <p>We say that $S$ is a balanced separator if every component of $G - S$ has $ \\leq V(G) / 2 $</p>
    <p>That is every component after you remove $S$ should contain less than or equal amounts of vertices to the amount of vertices in the original graph divided by 2.</p>
    `,
    async () => {
      // this.sidebar.addExercise('Find a balanced separator in the graph.');
      createOutputContainer();
      createOutputSurface();
      createSeparatorExerciseOutput();
      const graph = new Graph('container');
      graph.load(separatorGraph);
      graph.enableBalanceSeparatorExercise();
      // this.sidebar.setTitle('Balanced Separator');
    },
    1,
    'Balanced Separator',
  ),
  new Section(
    `
    <p>Informally we can describe the <i>treewidth</i> of a graph to be a tree "build" from its separators that we saw in the previous chapter.</p>
    <p>More formally we define the treewidth of a graph using the notion of <i>tree decompositions.</i></p>
    <p>A tree decomposition of a graph is a mapping of that graph into a tree adhering to certain properties.</p>
    <p>On the right you see a graph $G$ and one of its tree decompositions $T$.
    `,
    async () => {
      const graph = new Graph('graph-container');
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td);
    },
    2,
    'Tree decompositions',
  ),
  new Section(
    `
      <p>Each node in the tree decomposition is refered to as a <i>bag</i>.</p>
      <p>Each bag contains some vertices of the graph.</p>
    `,
    async () => {
      // this.sidebar.addExercise('Try to hover over a bag to see its related vertices.');
      // this.sidebar.setTitle('Bags');
      const graph = new Graph('graph-container');
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td);
      treeDecomposition.toggleHoverEffect();
    },
    2,
    'Bags',
  ),
  new Section(
    `
    <p>We say that a tree decomposition is valid if it adheres to 3 properties: Node coverage, edge coverage and coherence.</p>
    <p><strong>Node Coverage</strong>: Every vertex that appears in the graph must appear in some bag of the tree decomposition. </p>
    <p>We will check every vertex in the graph and highlight the bag in the tree decompostion containing that vertex.</p>
    `,
    async () => {
      const graph = new Graph('graph-container');
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td);
      graph.runNodeCoverage();
    },
    2,
    'Node coverage',
  ),
  new Section(
    `
    Edge coverage: For every edge that appears in the graph there is some bag in the tree decomposition which contains the vertice
    s of both ends of the edge.<br/><br/> Lets check if this holds true for our graph and tree decomposition.
    `,
    async () => {
      const graph = new Graph('graph-container');
      graph.setAnimationDuration(1200);
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td);
      // this.sidebar.addButton('<span class="material-icons">replay</span> Replay animation', () => graph.runEdgeCoverage());
      graph.runEdgeCoverage();
    },
    2,
    'Edge coverage',
  ),
  new Section(
    `
    <p><strong>Coherence:</strong> Consider 3 bags of the tree decomposition: $b_1$, $b_2$ and $b_3$ which form a path in the tree decomposition.</p>
    <p>If a vertex from the graph belongs to $b_1$ and $b_3$ it must also belong to $b_2$.</p>
    <p>That is, if a node exists in multiple bags it must form a connected subtree.</p>
    `,
    async () => {
      const graph = new Graph('graph-container');
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td);
      // this.sidebar.addButton('<span class="material-icons">replay</span> Replay animation', () => graph.highlightCoherence());
      graph.highlightCoherence();
    },
    2,
    'Coherence',
  ),
  new Section(
    `
    <p>A graph can have multiple valid tree decompositions.</p>
    <p>Lets take a look at some other valid tree decompositions of the graph.</p>
    <p><strong>Example:</strong> The trivial tree decomposition of this graph contains all the graph's vertices in one bag.</p>
    `,
    async () => {
      const graph = new Graph('graph-container');
      graph.load(graph1);
      const treeDecomposition = new TreeDecomposition('tree-container');
      const trivialTreeDecomposition = graph.computeTrivialTreeDecomposition();
      treeDecomposition.load(trivialTreeDecomposition);
    },
    2,
    'Trivial tree decomposition',
  ),
  new Section(
    '<p>This is another valid tree decomposition of the graph.</p>',
    async () => {
      const graph = new Graph('graph-container');
      graph.load(graph1);
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(validTreeDecomposition2);
    },
    2,
    'Valid tree decompositions',
  ),
  new Section(
    'Is this a valid tree decomposition of the graph?',
    async () => {
      const graph = new Graph('graph-container');
      graph.load(graph1);
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(nonValidTreeDecomposition);
      /*       this.sidebar.addQuiz();
      this.sidebar.addChoice('Yes', false);
      this.sidebar.addChoice('No', true);
      this.sidebar.addSolution(
        'Since the vertex 1 is in 2 bags it must form a connected subtree but in this tree it does not. Recall property 3.',
      ); */
    },
    2,
    'Valid tree decomposition quiz #1',
  ),
  new Section(
    'Is this a valid tree decomposition of the graph?',
    async () => {
      const graph = new Graph('graph-container');
      graph.load(graph1);
      /*       this.sidebar.addQuiz();
      this.sidebar.addChoice('Yes', true);
      this.sidebar.addChoice('No', false);
      this.sidebar.addSolution(
        'It satisfies all the properties of a tree decomposition thus it is valid.',
      ); */
      const treeDecomposition = new TreeDecomposition('tree-container');
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      treeDecomposition.load(td);
    },
    2,
    'Valid tree decomposition quiz #2',
  ),
  new Section(
    `
    <p>If there are different tree decompositions for a graph how do know which ones to use?</p>
    <p>We want to use the tree decomposition with the lowest possible vertices in it's largest bag, as this makes many algorithms compute faster on the tree decomposition.</p>
    <p class="fact"><span class="fact-title">Fact:</span> The <i>width</i> of a tree decomposition is the size of the largest bag minus 1.</p>
    <p class="fact"><span class="fact-title">Fact:</span> The <i>treewidth</i> of a graph is the minimum width amongst all the tree decompositions of the graph.</p>
    `,
    async () => {
      /*     this.sidebar.addExercise(
      'What is the width of the current tree decomposition?',
    ); */
      const graph = new Graph('graph-container');
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td1 = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td1);
      /*       this.sidebar.addQuiz();
      this.sidebar.addChoice('1', false);
      this.sidebar.addChoice('2', true);
      this.sidebar.addChoice('3', false);
      this.sidebar.addSolution(
        'The treewidth of a tree decomposition is the size of the largest bag - 1.',
      ); */
    },
    2,
    'Width vs treewidth',
  ),
  new Section(async () => {
    // this.sidebar.addExercise('What is the width of the tree decomposition?');
    const graph = new Graph('graph-container');
    graph.load(graph1);
    /*     this.sidebar.addQuiz();
    this.sidebar.addChoice('2', false);
    this.sidebar.addChoice('4', true);
    this.sidebar.addChoice('5', false);
    this.sidebar.addSolution('4 Since the largest bag contains 5 vertices.'); */
    const treeDecomposition = new TreeDecomposition('tree-container');
    treeDecomposition.load(td4);
  },
  2,
  'Width vs treewidth quiz #1'),
  new Section(async () => {
    const graph = new Graph('graph-container');
    graph.load(graph1);
    /*     this.sidebar.setTitle('Width vs treewidth quiz #2');
    this.sidebar.addExercise('What is the width of the tree decomposition?');
    this.sidebar.addQuiz();
    this.sidebar.addChoice('2', false);
    this.sidebar.addChoice('4', false);
    this.sidebar.addChoice('5', true);
    this.sidebar.addSolution('5 Since the largest bag contains 6 vertices.'); */
    const treeDecomposition = new TreeDecomposition('tree-container');
    treeDecomposition.load(td3);
  },
  2,
  'Width vs treewidth quiz #2'),
  new Section(
    `
    <p>Lets assume that the 3 tree decompositions you see on the right are ALL of the possible tree decompositions of the graph $G$
    (This is not true but for this exercise we will make this assumption.)</p>
    `,
    async () => {
      setupContainersForTreeDecompositions();
      // this.sidebar.addExercise('What is the <i>treewidth</i> of the graph?');
      const graph = new Graph('graph-container');
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();

      const tree1 = new TreeDecomposition('tree1');
      const tree2 = new TreeDecomposition('tree2');
      const tree3 = new TreeDecomposition('tree3');

      tree1.load(td1);
      tree2.load(td2);
      tree3.load(td);

      /* this.sidebar.addQuiz();
      this.sidebar.addChoice('2', true);
      this.sidebar.addChoice('5', false);
      this.sidebar.addChoice('3', false);
      this.sidebar.addSolution(
        'The correct answer is 2. Recall that the treewidth of a graph is the minimum width amonst all of the possible tree decompositions.',
      ); */
    },
    2,
    'Treewidth quiz #1',
  ),
  new Section(
    `
    <p>We will now put our attention towards understanding how graph separators work in tree decompositions. If you dont recall the concept of graph separators go through chapter 2.</p>
    <p>Each bag in the tree decomposition act as a separator in the graph.</p>
    <p>For example the bag containing 2 3 4 separates 1 and 5 6 7 in the graph.</p>
    `,
    async () => {
      // this.sidebar.addExercise('Hover over a bag in the tree decomposition to see how it separates the graph.');
      const graph = new Graph('graph-container');
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.setGraph(graph);
      treeDecomposition.load(td);
      treeDecomposition.toggleSeparator();
    },
    2,
    'Separators in tree decompositions',
  ),
  new Section(
    `
    <p><strong>Add bags</strong> for the tree decomposition by clicking anywhere in the highlighted space.</p>
    <p><strong>Add edges</strong> between bags by dragging and clicking on a node.</p>
    <p><strong>Change</strong> which vertices should be contained inside each bag by right-clicking and select set value. Separate each vertix using a comma.</p>
    <p>(Example: If you wanted 1, 2 and 3 contained in a bag, write it as such: 1,2,3)</p>
    <p><strong>Delete a bag</strong> by right-clicking and click delete bag.</p>
    <p><strong>Remove an edge</strong> by right-clicking on it.</p>
    `,
    async () => {
      // this.sidebar.addExercise('Draw the tree decompostion of the graph.');
      const graph = new Graph('graph-container');
      graph.randomGraph();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.setGraph(graph);
      treeDecomposition.enableDrawing();
    },
    2,
    'Create the tree decomposition',
  ),
  new Section(
    `
    <p>Certain graph classes have constant treewidth regardless of the number of vertices/edges in that particular graph.</p>
    <p>Consider the $3$ x $3$ grid on the right. Intuitively we can see there is no way we can separate this graph using less than $3$ vertices.</p>
    <p class="fact"><span class="fact-title">Fact:</span> For every $k \\geq 2$, the treewidth of the $k$ x $k$ grid is exactly $k$</p>
    `,
    async () => {
      const graph = new Graph('graph-container');
      graph.load(gridGraph);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td);
    },
    2,
    'Treewidth of grids',
  ),
  new Section(
    '<p><i>Trees</i> have treewidth 1.</p>',
    async () => {
      d3.select('#container').style('height', '100%');
      d3.select('#output').style('height', '0');
      const graph = new Graph('graph-container');
      graph.load(treeGraph);
      await graph.computeTreeDecomposition();
      const td = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td);
    },
    2,
    'Treewidth of trees',
  ),
  new Section(
    `
    <p>As you can tell by the graph and its tree decomposition a clique has a large treewidth. An optimal tree decomposition of a clique is the trivial decomposition.</p>
    <p class="fact"><span class="fact-title">Fact:</span> The treewidth of clique $k$ is $k - 1$</p>
    `,
    async () => {
      const graph = new Graph('graph-container');
      graph.load(cliqueGraph);
      await graph.computeTreeDecomposition();
      const td1 = graph.getTreeDecomposition();
      const treeDecomposition = new TreeDecomposition('tree-container');
      treeDecomposition.load(td1);
    },
    2,
    'Treewidth of cliques',
  ),
  new Section(
    `
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
    `,
    async () => {
      setupGraphAndTreeContainers();
      const graph = new Graph('graph-container');
      graph.randomGraph();
      await graph.computeTreeDecomposition();
      const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
      const niceTreeDecomposition = new Tree('tree-container');
      niceTreeDecomposition.load(niceTreeDecompositionData);
      niceTreeDecomposition.setGraph(this.graph);
    },
    3,
    'Nice tree decompositions',
  ),
  new Section(
    '',
    async () => {
      const graph = new Graph('graph-container');
      const niceTreeDecomposition = new Tree('tree-container');
      window.niceTreeDecomposition = niceTreeDecomposition;
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
      niceTreeDecomposition.load(niceTreeDecompositionData);
      niceTreeDecomposition.setGraph(graph);
      niceTreeDecomposition.enableMaximumIndependentSet();
      /*       this.createTableVisibilityButton();
      this.addAlgorithmControls(
        () => niceTreeDecomposition.previousDPStep(),
        () => niceTreeDecomposition.nextDPStep(),
      ); */
    },
    3,
    'Maximum Independent Set',
  ),
  new Section(
    'Content',
    async () => {
      // this.createTableVisibilityButton();
      const graph = new Graph('graph-container');
      const niceTreeDecomposition = new Tree('tree-container');
      window.niceTreeDecomposition = niceTreeDecomposition;
      graph.load(graph1);
      await graph.computeTreeDecomposition();
      const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
      niceTreeDecomposition.load(niceTreeDecompositionData);
      niceTreeDecomposition.setGraph(graph);
      niceTreeDecomposition.enableThreeColor();
      /*       this.addAlgorithmControls(
        () => niceTreeDecomposition.previousDPStep(),
        () => niceTreeDecomposition.nextDPStep(),
      ); */
    },
    3,
    '3-Colorable',
  ),
  new Section(async () => {
    const graph = new Graph('graph-container');
    const niceTreeDecomposition = new Tree('tree-container');
    window.niceTreeDecomposition = niceTreeDecomposition;
    graph.load(cycleGraph);
    await graph.computeTreeDecomposition();
    const niceTreeDecompositionData = graph.getNiceTreeDecomposition();
    niceTreeDecomposition.load(niceTreeDecompositionData);
    niceTreeDecomposition.setGraph(graph);
    niceTreeDecomposition.addArrow();
    niceTreeDecomposition.enableHamiltonianCycle();
    /*     this.createTableVisibilityButton();
    this.addAlgorithmControls(
      () => niceTreeDecomposition.previousDPStep(),
      () => niceTreeDecomposition.nextDPStep(),
    ); */
  },
  3,
  'Hamiltonian Cycle'),
];

export default sections;
