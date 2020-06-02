/* eslint-disable class-methods-use-this */

function addTooltip() {
  d3.select('#main').append('div')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', 0);


  d3.select('#main')
    .append('img')
    .attr('src', './new.png')
    .attr('id', 'tooltip-arrow')
    .style('opacity', 0);
}

function resetStyles() {
  d3.selectAll('circle').classed('highlighted-vertex', false).classed('nonhighlight', true);
}


function highlightVertex(nodeId) {
  resetStyles();
  d3.selectAll('circle')
    .filter((node) => nodeId === node.data.id)
    .classed('nonhighlight', false)
    .classed('highlighted-vertex', true);
}

function moveTooltip(node, maxSetIncl, maxSetExcl) {
  addTooltip();
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

function getSubTree(rootOfSubtree, currentNode) {
  let subTree;
  rootOfSubtree.each((d) => {
    if (d.data.id === currentNode.id) subTree = d.descendants();
  });
  return subTree;
}

const getAllSubsets = (theArray) => theArray.reduce(
  (subsets, value) => subsets.concat(
    subsets.map((set) => [value, ...set]),
  ),
  [[]],
);

export default class Tree {
  constructor() {
    this.isMis = false;
    this.isColor = false;
    this.root = null;
    this.current = 0;
    this.graph = null;
  }

  hideTooltip() {
    d3.select('#tooltip').style('opacity', 0);
    d3.select('#tooltip-arrow').style('opacity', 0);
  }

  remove() {
    this.svg.remove();
  }

  setGraph(graph) {
    this.graph = graph;
  }

  getRoot() {
    return this.root;
  }

  setAllNodes() {
    this.root.eachAfter((node) => {
      node.largestSet = 0;
    });
  }

  highlightMaxSet(setToHighlight) {
    let sb = '';
    sb += setToHighlight.replace('{', '').replace('}', '');
    if (sb === 'Ø') return;
    sb = `[${sb}]`;
    const set = JSON.parse(sb);
    this.graph.runMis(this.currentSubTree, set, 0, true);
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

  setMisNormalTree() {
    this.isMisNormalTree = true;
  }

  nextStep() {
    const N = this.root.descendants().length;
    this.current++;
    if (this.current !== N) this.current %= N;
    if (this.isMisNormalTree) this.misiterative(this.current);
    if (this.isColor) this.threeColor(this.current);
  }

  previousStep() {
    if (this.current === 0) return;
    const N = this.root.descendants().length;
    --this.current;
    this.current %= N;
    if (this.isMisNormalTree) this.misiterative(this.current);
    if (this.isColor) this.threeColor(this.current);
  }

  animateNode(nodeToAnimate) {
    const descendants = nodeToAnimate.descendants();

    const descendantsIds = [];

    descendants.forEach((currentNode) => {
      descendantsIds.push(currentNode.data.id);
    });

    d3.select('#tree-container').selectAll('circle').classed('highlighted-node', (currentNode) => {
      if (descendantsIds.includes(currentNode.data.id)) return true;
      return false;
    });
  }

  animateLink(node) {
    const desLinks = node.links();
    const wat = [];

    desLinks.forEach((currentLink) => {
      wat.push(currentLink.source.data, currentLink.target.data);
    });

    d3.select('#tree-container line').classed('highlighted-link', (link) => {
      if (wat.includes(link.source.data)) return 'orange';
    });
  }

  isArrayInArray(arr, item) {
    const item_as_string = JSON.stringify(item);

    const contains = arr.some((ele) => JSON.stringify(ele) === item_as_string);
    return contains;
  }

  threeColor() {
    const colorArray = ['red', 'green', 'blue'];
    this.isMis = false;
    this.isColor = true;
    let i = 1;
    this.root.copy().eachAfter((currentNode) => {
      if (this.current !== i++) return;

      this.animateNode(currentNode);

      const node = currentNode.data;

      if ('children' in node === false) {
        const { top } = document.getElementById(`treeNode-${currentNode.data.id}`).getBoundingClientRect();
        const { left } = document.getElementById(`treeNode-${currentNode.data.id}`).getBoundingClientRect();

        d3.select('#tooltip-arrow')
          .style('opacity', 1)
          .style('left', `${left}px`)
          .style('top', `${top + 25}px`);

        d3.select('#color-table')
          .style('opacity', 1)
          .style('left', `${left - 50}px`)
          .style('top', `${top - 2}px`);
        node.pos = [];
        return;
      }

      const child = node.children[0];
      const subTree = getSubTree(this.root, currentNode.data);
      this.graph.newSubGraph(subTree);

      if (node.vertices.length > child.vertices.length) {
        const childClone = JSON.parse(JSON.stringify(child));
        const childsStates = childClone.states;
        const difference = node.vertices.filter((x) => !child.vertices.includes(x));
        const introducedVertex = difference[0];
        const newStates = [];

        if (child.vertices.length === 0) {
          for (const color of colorArray) {
            const newState = [];
            newState.push(color);
            newStates.push(newState);
          }
          const x = node.vertices[0];
          node.pos = childClone.pos;
          if (!node.pos.includes(introducedVertex)) node.pos.push(x);
          node.states = newStates;
        } else {
          for (const childState of childsStates) {
            for (const color of colorArray) {
              const newState = JSON.parse(JSON.stringify(childState));
              newState.push(color);
              if (this.graph.checkIntroducedVertex(introducedVertex, newState, subTree)) {
                newStates.push(newState);
              }
            }
          }
          node.states = newStates;
          node.pos = childClone.pos;
          if (!node.pos.includes(introducedVertex)) node.pos.push(introducedVertex);
        }
      }

      if (node.vertices.length < child.vertices.length) {
        const childClone = JSON.parse(JSON.stringify(child));
        const childStates = childClone.states;

        node.pos = childClone.pos;
        const forgottenVertex = child.vertices.filter((x) => !node.vertices.includes(x));
        if (node.pos.includes(parseInt(forgottenVertex, 10))) node.pos = node.pos.filter((x) => x !== parseInt(forgottenVertex, 10));


        for (const childState of childStates) {
          childState.pop();
        }

        for (let i = 0; i < childStates.length; i++) {
          const array1 = childStates[i];
          for (let j = 0; j < childStates.length; j++) {
            const array2 = childStates[j];
            if (JSON.stringify(array1) === JSON.stringify(array2)) childStates.splice(i, 1);
          }
        }
        node.states = childStates;
      }

      if (node.children.length === 2) {
        const child1 = node.children[0];
        const child1Clone = JSON.parse(JSON.stringify(child1));
        const child1States = child1Clone.states;

        const child2 = node.children[1];
        const child2Clone = JSON.parse(JSON.stringify(child2));
        const child2States = child2Clone.states;
        const newStates = [];

        if (child1States.length < child2States.length) {
          node.pos = child1.pos;
          for (const childState of child1States) {
            if (this.isArrayInArray(child2States, childState)) newStates.push(childState);
          }
        } else {
          node.pos = child2.pos;
          for (const childState of child2States) {
            if (this.isArrayInArray(child1States, childState)) newStates.push(childState);
          }
        }
        node.states = newStates;
      }

      let sb = '';
      sb += '<tr>';
      for (let i = 0; i < node.pos.length; i++) {
        sb += `<td><strong>${node.pos[i]}</strong></td>`;
      }

      sb += '</tr>';

      for (const state of node.states) {
        sb += '<tr>';
        for (const s of state) {
          let color = '';
          if (s === 'red') {
            color = 'red';
          }
          if (s === 'green') {
            color = 'green';
          }
          if (s === 'blue') {
            color = 'blue';
          }

          sb += `<td class="${color}">${s}</td>`;
        }
        sb += '</tr>';
      }

      const { top } = document.getElementById(`treeNode-${currentNode.data.id}`).getBoundingClientRect();
      const { left } = document.getElementById(`treeNode-${currentNode.data.id}`).getBoundingClientRect();

      d3.select('#tooltip-arrow')
        .style('opacity', 1)
        .style('left', `${left}px`)
        .style('top', `${top + 25}px`);

      d3.select('#color-table')
        .style('opacity', 1)
        .html(sb)
        .style('left', `${left - 50}px`)
        .style('top', `${top - 2}px`);
    });
  }

  createTable() {
    d3.select('#main')
      .append('table')
      .style('opacity', 0)
      .attr('id', 'color-table')
      .attr('class', 'table');
  }

  runThreeColor() {
    this.current = 0;
    this.threeColor();
  }

  mis() {
    this.isColor = false;
    this.isMis = true;
    this.animX = 0;
    let i = 0;
    this.root.copy().eachAfter((currentNode) => {
      i++;
      if (this.current !== i) return;

      currentNode.data.table = {};

      this.animateNode(currentNode);
      this.animateLink(currentNode);

      // Get all the subsets of the current vertices in this tree node
      const allSubsets = getAllSubsets(currentNode.data.vertices);

      // Get the subtree rooted at this node
      const subTree = getSubTree(this.root, currentNode.data);

      this.currentSubTree = subTree;

      // Leaf node
      if ('children' in currentNode.data === false) {
        currentNode.data.table = {};
        if (currentNode.data.vertices.length === 0) {
          currentNode.data.table[''] = 0;
        } else {
          const vertex = currentNode.data.vertices[0];
          currentNode.data.table[vertex] = 1;
        }
        d3.select('#tooltip').style('opacity', 0);
        return;
      }

      // Join node
      if (currentNode.data.children.length === 2) {
        // Get child 1's table
        const child1 = currentNode.data.children[0];
        const child1Clone = JSON.parse(JSON.stringify(child1));
        const child1Table = child1Clone.table;

        // Get child 2's table
        const child2 = currentNode.data.children[1];
        const child2Clone = JSON.parse(JSON.stringify(child2));
        const child2Table = child2Clone.table;

        for (const set of allSubsets) {
          const currentNodeValue = this.graph.runMis(subTree, set);
          const child1value = child1Table[set];
          const child2value = child2Table[set];
          currentNode.data.table[set] = child1value + child2value - currentNodeValue;
        }
      }

      // Forget node
      if (currentNode.data.vertices.length < currentNode.data.children[0].vertices.length) {
        const childsVertices = currentNode.data.children[0].vertices;
        const forgottenVertex = childsVertices
          .filter((x) => !currentNode.data.vertices.includes(x));

        for (const set of allSubsets) {
          const setWithV = JSON.parse(JSON.stringify(set));
          setWithV.push(forgottenVertex);
          const setWithoutV = this.graph.runMis(subTree, set);
          const algoWithV = this.graph.runMis(subTree, setWithV);
          currentNode.data.table[set] = Math.max(setWithoutV, algoWithV);
        }
      }

      // Introduce node
      if (currentNode.data.vertices.length > currentNode.data.children[0].vertices.length) {
        // Get the child's table
        const child = currentNode.data.children[0];
        const childClone = JSON.parse(JSON.stringify(child));
        const childsTable = childClone.table;

        // Set the current node's table
        currentNode.data.table = childsTable;

        // Find the introduced vertex
        const { vertices } = currentNode.data;
        const childsVertices = currentNode.data.children[0].vertices;
        const difference = vertices.filter((x) => !childsVertices.includes(x));
        const introducedVertex = difference[0];

        for (const set of allSubsets) {
          // Only run MIS if the introduced vertex is in the current set
          if (set.includes(introducedVertex)) {
            const maxSet = this.graph.runMis(subTree, set, introducedVertex);

            if (currentNode.data.table[set]) {
              currentNode.data.table[set]++;
            } else {
              currentNode.data.table[set] = maxSet;
            }
          }
        }
      }

      const keys = Object.keys(currentNode.data.table);
      const values = Object.values(currentNode.data.table);
      let sb = '';

      keys.forEach((key, index) => {
        if (key === '') {
          key = 'Ø';
          keys.splice(index, 1);
          keys.unshift(key);
          const val = values[index];
          values.splice(index, 1);
          values.unshift(val);
        }
      });

      keys.forEach((key, index) => {
        const value = values[index];
        if (value < -1000) return;
        if (key !== 'Ø') {
          key = `{${key}}`;
        }
        sb += `<tr id=${key} class="mis-row"><td class="sets">${key}</td><td>${value}</td></tr>`;
      });

      const { top } = document.getElementById(`treeNode-${currentNode.data.id}`).getBoundingClientRect();
      const { left } = document.getElementById(`treeNode-${currentNode.data.id}`).getBoundingClientRect();

      const start = `<table><tbody id="tbody">${sb}</tbody></table>`;

      d3.select('#tooltip-arrow')
        .style('opacity', 1)
        .style('left', `${left}px`)
        .style('top', `${top + 25}px`);

      d3.select('#tooltip')
        .html(start)
        .style('opacity', 1)
        .style('left', `${left - 50}px`)
        .style('top', `${top - 2}px`);

      d3.selectAll('.sets').on('mouseover', () => {
        this.highlightMaxSet(d3.event.target.innerText);
      });
      d3.selectAll('.sets').on('mouseleave', () => {
        d3.selectAll('circle').classed('highlighted-stroke', false);
      });
    });
  }

  maxNext() {
    /*     d3.select(document.body).on('keyup', () => {
      if (d3.event.key === 'ArrowRight') {
        increment();
      } else if (d3.event.key === 'ArrowLeft') {
        decrement();
      }
    }); */
    const N = this.root.descendants().length;
    this.current++;
    if (this.current !== N) this.current %= N;
    if (this.isMis) this.mis(this.current);
    if (this.isColor) this.threeColor(this.current);
  }

  maxPrevious() {
    if (this.current === 0) return;
    const N = this.root.descendants().length;
    --this.current;
    this.current %= N;
    if (this.isMis) this.mis(this.current);
    if (this.isColor) this.threeColor(this.current);
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
      .attr('class', 'nonhighlight')
      .attr('transform', `translate(${0}, ${40})`);

    g
      .append('text')
      .attr('dy', '.2em')
      .attr('text-anchor', 'middle')
      .attr('class', 'label')
      .text((d) => d.data.label)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('transform', `translate(${0}, ${40})`);
  }
}
