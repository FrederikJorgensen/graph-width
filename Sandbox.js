import Graph from './Components/Graph';
import Tree from './Components/Tree';
import TreeDecomposition from './Components/TreeDecomposition';

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

export default class SandBoxPage {
  constructor() {
    this.create();
  }

  create() {
    createSandboxGrid();
    createGraphContainer();
    createTreeDecompositionContainer();
    createNiceTreeDecompositionContainer();
    const graph = new Graph('sandbox-graph-container');
    this.graph = graph;
    const treeDecomposition = new TreeDecomposition('tree-decomposition-container');
    this.treeDecomposition = treeDecomposition;
    const niceTreeDecomposition = new Tree('nice-tree-decomposition-container');
    this.niceTreeDecomposition = niceTreeDecomposition;
    this.createGraphButtons();
    this.createComputeTreeDecompositionButton();
    this.createComputeNiceTreeDecompositionButton();
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
    if (this.treeDecomposition) this.treeDecomposition.removeSvg();
    if (this.niceTreeDecomposition) this.niceTreeDecomposition.removeSvg();
    this.graph.enableDrawing();
    this.graphLoaded = true;
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
    if (this.treeDecomposition) this.treeDecomposition.removeSvg();
    if (this.niceTreeDecomposition) this.niceTreeDecomposition.removeSvg();
    const numberOfVertices = 10;
    const numberOfEdges = 10;
    this.graph.randomGraph(numberOfVertices, numberOfEdges);
    this.treeDecompositionLoaded = false;
    this.graphLoaded = true;
  }

  async handleComputeNiceTreeDecomposition() {
    if (!this.treeDecompositionLoaded) return;
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
    const treeDecompositionData = this.graph.getTreeDecomposition();
    this.treeDecomposition.load(treeDecompositionData, 'tree');
    this.treeDecompositionLoaded = true;
  }
}
