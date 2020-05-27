const colors = d3.scaleOrdinal(d3.schemeCategory10);

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const animDuration = 500;


d3.select('#main').append('div')
  .attr('id', 'tooltip')
  .style('position', 'absolute')
  .style('opacity', 0);


d3.select('#main')
  .append('img')
  .attr('src', './new.png')
  .attr('id', 'tooltip-arrow')
  .style('opacity', 0);

function highlightVertex(nodeId) {
  d3.selectAll('circle').style('fill', (currentNode) => {
    if (nodeId === currentNode.data.id) return 'orange';
    return '#1f77b4';
  });
}

function moveTooltip(node, maxSetIncl, maxSetExcl) {
  const { top } = document.getElementById(`treeNode-${node.id}`).getBoundingClientRect();
  const { left } = document.getElementById(`treeNode-${node.id}`).getBoundingClientRect();


  if ('children' in node === false) {
    d3.select('#tooltip').html('Largest set of a leaf is 1');
  } else {
    d3.select('#tooltip').html(`<div>Max set incl. node: ${maxSetIncl}</div>
    <div>
      Max set excl. node: ${maxSetExcl}
    </div>`);
  }

  d3.select('#tooltip-arrow')
    .style('opacity', 1)
    .style('left', `${left}px`)
    .style('top', `${top + 25}px`);

  d3.select('#tooltip')
    .style('opacity', 1)
    .style('left', `${left - 50}px`)
    .style('top', `${top - 2}px`);
}

let animX = 0;

export default class Tree {
  constructor() {
    this.current = 0;
  }

  getRoot() {
    return this.root;
  }

  setAllNodes() {
    this.root.eachAfter((node) => {
      node.largestSet = 0;
    });
  }


  async misiterative() {
    let i = 0;
    this.root.eachAfter(async (currentNode) => {
      i++;
      if (this.current !== i) return;
      const node = currentNode.data;

      /* We hit a leaf */
      if ('children' in node === false) {
        moveTooltip(node);
        highlightVertex(node.id);
        node.largestSet = 1;
        return node.largestSet;
      }
      /* Exclude current node */

      let maxSetExcl = 0;

      if (node.children.length === 1) {
        maxSetExcl = node.children[0].largestSet;
      }

      if (node.children.length === 2) {
        maxSetExcl = node.children[0].largestSet + node.children[1].largestSet;
      }

      let maxSetIncl = 1;

      /* Include current node */
      if (node.children[0] !== undefined && 'children' in node.children[0]) {
        const left = node.children[0].children[0].largestSet;
        let right = 0;
        if (node.children[0].children.length === 2) right = node.children[0].children[1].largestSet;
        maxSetIncl += left + right;
      }

      if (node.children[1] !== undefined && 'children' in node.children[1]) {
        const left = node.children[1].children[0].largestSet;
        let right = 0;
        if (node.children[1].children.length === 2) right = node.children[1].children[1].largestSet;

        maxSetIncl += left + right;
      }

      moveTooltip(node, maxSetIncl, maxSetExcl);
      highlightVertex(node.id);

      node.largestSet = Math.max(maxSetExcl, maxSetIncl);
      return node.largestSet;
    });
  }

  nextStep() {
    const N = this.root.descendants().length;
    this.current++;
    if (this.current !== N) this.current %= N;
    // this.current = ++this.current % N;
    this.misiterative(this.current);
  }

  previousStep() {
    if (this.current === 0) return;
    const N = this.root.descendants().length;
    --this.current;
    this.current %= N;
    this.misiterative(this.current);
  }


  maxIndependentSet(node) {
    // debugger;
    if (node === undefined) return 0;

    if (node.liss !== 0) return node.liss;

    if ('children' in node === false) {
      visitElement(node.data.id, animX);
      animX++;
      return node.liss = 1;
    }

    const lissExcl = this.maxIndependentSet(node.children[0]) + this.maxIndependentSet(node.children[1]);

    let lissIncl = 1;

    if (node.children[0] !== undefined && 'children' in node.children[0]) {
      lissIncl += this.maxIndependentSet(node.children[0].children[0]) + this.maxIndependentSet(node.children[0].children[1]);
    }
    if (node.children[1] !== undefined && 'children' in node.children[1]) {
      lissIncl += this.maxIndependentSet(node.children[1].children[0]) + this.maxIndependentSet(node.children[1].children[1]);
    }

    node.liss = Math.max(lissExcl, lissIncl);

    console.log(node.liss);
    return node.liss;
  }

  load(treeData, container) {
    this.container = container;

    const height = document.getElementById(container).offsetHeight;
    const width = document.getElementById(container).offsetWidth;
    const treeSvg = d3.select(`#${container}`).append('svg')
      .attr('width', width)
      .attr('height', height);

    this.svg = treeSvg;

    const root = d3.hierarchy(treeData);
    this.root = root;
    const treeLayout = d3.tree();
    treeLayout.size([width, height - 100]);
    treeLayout(root);

    treeSvg
      .append('g')
      .selectAll('line')
      .data(root.links())
      .enter()
      .append('line')
      .attr('class', 'tree-link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('transform', `translate(${0}, ${40})`);

    let nodeSvg = treeSvg
      .append('g')
      .selectAll('circle');

    nodeSvg = nodeSvg
      .data(root.descendants());


    const g = nodeSvg
      .enter()
      .append('g');

    g
      .append('circle')
      .attr('id', (d) => `treeNode-${d.data.id}`)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 25)
      .style('fill', colors(1))
      .attr('transform', `translate(${0}, ${40})`);

    g
      .append('text')
      .attr('dy', '.2em')
      .attr('text-anchor', 'middle')
      .attr('class', 'label')
      .text((d) => d.data.id)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('transform', `translate(${0}, ${40})`);
  }
}
