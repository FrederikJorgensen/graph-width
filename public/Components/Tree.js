/* eslint-disable no-continue */
/* eslint-disable no-return-assign */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable class-methods-use-this */


function resetStyles() {
  d3.selectAll('circle').classed('highlighted-vertex', false).classed('nonhighlight', true);
}

function multiDimensionalUnique(arr) {
  const uniques = [];
  const itemsFound = {};
  for (let i = 0, l = arr.length; i < l; i++) {
    const stringified = JSON.stringify(arr[i]);
    if (itemsFound[stringified]) { continue; }
    uniques.push(arr[i]);
    itemsFound[stringified] = true;
  }
  return uniques;
}


function highlightVertex(nodeId) {
  resetStyles();
  d3.selectAll('circle')
    .filter((node) => nodeId === node.data.id)
    .classed('nonhighlight', false)
    .classed('highlighted-vertex', true);
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
  constructor(container) {
    this.container = container;
    this.isMis = false;
    this.isColor = false;
    this.root = null;
    this.current = 0;
    this.graph = null;
  }

  clear() {
    this.svg.remove();
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

  addTooltip() {
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

      /* Leaf node */
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


        node.positionTracker = [];
        return;
      }

      const child = node.children[0];
      const subTree = getSubTree(this.root, currentNode.data);
      this.graph.newSubGraph(subTree);

      /* Introduce Node */
      if (node.vertices.length > child.vertices.length) {
        /* Get child states */
        const childClone = JSON.parse(JSON.stringify(child));
        const childsStates = childClone.states;

        /* Find the introduced vertex */
        const difference = node.vertices.filter((x) => !child.vertices.includes(x));
        const introducedVertex = difference[0];

        /* Initialize new states */
        const newStates = [];

        if (child.vertices.length === 0) {
          for (const color of colorArray) {
            const newState = [];
            newState.push(color);
            newStates.push(newState);
          }
          const ps = childClone.positionTracker;
          if (!ps.includes(introducedVertex)) ps.push(introducedVertex);
          node.positionTracker = ps;
          node.states = newStates;
        } else {
          for (const childState of childsStates) {
            for (const color of colorArray) {
              const oldState = JSON.parse(JSON.stringify(childState));
              if (this.graph.checkIntroducedVertex(introducedVertex, childClone.positionTracker, oldState, color, subTree)) {
                /* If we are here, we can safely add the color */
                oldState.push(color);
                newStates.push(oldState);
              }
            }
          }
          node.states = newStates;

          const ps = childClone.positionTracker;
          if (!ps.includes(introducedVertex)) ps.push(introducedVertex);
          node.positionTracker = ps;
        }
      }

      /* Forgot node */
      if (node.vertices.length < child.vertices.length) {
        /* Get the child's data  */
        const childClone = JSON.parse(JSON.stringify(child));
        const childStates = childClone.states;

        /* Find the forgotten vertex */
        const forgottenVertex = child.vertices.filter((x) => !node.vertices.includes(x));


        /* Get the position of the childs vertices */
        const ps = childClone.positionTracker;
        const parsed = parseInt(forgottenVertex, 10);
        const forgottenVertexIndex = ps.indexOf(parsed);

        /* Remove the forgotten vertex from position tracker */
        ps.splice(forgottenVertexIndex, 1);
        node.positionTracker = ps;

        /* Remove the column in the table that includes forgotten vertices */
        for (const childState of childStates) {
          childState.splice(forgottenVertexIndex, 1);
        }

        const uw = multiDimensionalUnique(childStates);

        /* Update this table's state with the new states */
        node.states = uw;
      }

      /* Join node */
      if (node.children.length === 2) {
        const child1 = node.children[0];
        const child1Clone = JSON.parse(JSON.stringify(child1));
        const child1States = child1Clone.states;

        const child2 = node.children[1];
        const child2Clone = JSON.parse(JSON.stringify(child2));
        const child2States = child2Clone.states;
        const newStates = [];

        if (child1States.length < child2States.length) {
          node.positionTracker = child1.positionTracker;
          for (const childState of child1States) {
            if (this.isArrayInArray(child2States, childState)) newStates.push(childState);
          }
        } else {
          node.positionTracker = child2.positionTracker;
          for (const childState of child2States) {
            if (this.isArrayInArray(child1States, childState)) newStates.push(childState);
          }
        }
        node.states = newStates;
      }

      let sb = '';
      sb += '<tr>';
      for (let i = 0; i < node.positionTracker.length; i++) {
        sb += `<td><strong>${node.positionTracker[i]}</strong></td>`;
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

  addColorTable() {
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
      allSubsets.map((s) => s.sort());

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
        d3.select('#tooltip-arrow').style('opacity', 0);
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
          const child1value = child1Table[set];
          const child2value = child2Table[set];
          const currentNodeValue = set.length;
          currentNode.data.table[set] = child1value + child2value - currentNodeValue;
        }
      }

      // Forget node
      if (currentNode.data.vertices.length < currentNode.data.children[0].vertices.length) {
        const childsVertices = currentNode.data.children[0].vertices;
        const forgottenVertex = childsVertices
          .filter((x) => !currentNode.data.vertices.includes(x));

        // Get the child's table
        const child = currentNode.data.children[0];
        const childClone = JSON.parse(JSON.stringify(child));
        const childsTable = childClone.table;

        for (const set of allSubsets) {
          /* Union the forgottenVertex with the current subset */
          const concatV = set.concat(forgottenVertex);
          concatV.sort();

          /* Value of set without v */
          const setWithoutV = childsTable[set];

          /* Value of set with v */
          const setWithV = childsTable[concatV];

          if (setWithoutV > setWithV) {
            currentNode.data.table[set] = setWithoutV;
          } else {
            currentNode.data.table[set] = setWithV;
          }
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
          // We only care about the subsets containing the introduced vertex v
          if (set.includes(introducedVertex)) {
            /* Check if a vertex inside this set is adjacent to the introduced vertex */
            const setWithoutV = set.filter((s) => s !== introducedVertex);

            if (this.graph.isVertexAdjacent(subTree, set)) {
              currentNode.data.table[set] = -9999;
            } else {
              let oldValue = childsTable[setWithoutV];
              oldValue++;
              currentNode.data.table[set] = oldValue;
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
      // visitElement(node.data.id, animX);
      // animX++;
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

    return node.liss;
  }

  load(treeData, type) {
    const height = document.getElementById(this.container).offsetHeight;
    const width = document.getElementById(this.container).offsetWidth;
    const treeSvg = d3.select(`#${this.container}`).append('svg')
      .attr('width', width)
      .attr('height', height);

    this.svg = treeSvg;

    const root = d3.hierarchy(treeData);
    this.root = root;
    const treeLayout = d3.tree();
    treeLayout.size([width, height - 80]);
    treeLayout(root);

    /* Get the link data and draw the links */
    treeSvg
      .selectAll('line')
      .data(root.links())
      .enter()
      .append('line')
      .attr('class', 'tree-link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('transform', `translate(${0}, ${30})`);


    /* Get the node data and draw the nodes */
    treeSvg
      .selectAll('rect')
      .data(root.descendants())
      .enter()
      .append('rect')
      .attr('id', (d) => `treeNode-${d.data.id}`)
      .attr('width', 60)
      .attr('height', 25)
      .attr('x', (d) => d.x - 30)
      .attr('y', (d) => d.y)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('transform', `translate(${0}, ${30})`)
      .attr('class', 'tree-node')
      .style('stroke-width', '5px')
      .style('stroke', (d) => {
        if (type === 'nice') {
          if ('children' in d.data === false) return 'black';
          if (d.data.children.length === 2) return 'yellow';
          if (d.data.vertices.length > d.data.children[0].vertices.length) return 'blue';
          if (d.data.vertices.length < d.data.children[0].vertices.length) return 'red';
        } else {
          return 'black';
        }
      });

    treeSvg
      .selectAll('text')
      .data(root.descendants())
      .enter()
      .append('text')
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('class', 'label')
      .text((d) => d.data.label)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('transform', `translate(${0}, ${30})`);
  }
}
