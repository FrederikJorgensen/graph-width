import { contextMenu as menu } from '../Utilities/ContextMenu.js';

function errorSvg() {
  return `<svg class="exercise-icon incorrect-answer-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
}

function checkmarkSvg() {
  return `<svg class="exercise-icon correct-answer-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`;
}

export default class TreeDecomposition {
  constructor(container, graph) {
    this.container = container;
    this.nodes = [];
    this.links = [];
    this.lastNodeId = 0;
    this.graphOfTd = graph;
  }

  isConnected() {
    let componentCount = 1;
    let cluster = 2;

    if (this.nodes.length === 0) {
      componentCount = 0;
      return;
    }

    componentCount = 1;
    this.nodes.forEach((v) => {
      v.visited = false;
    });

    const adjList = {};
    this.nodes.forEach((v) => {
      adjList[v.id] = [];
    });

    this.links.forEach((e) => {
      adjList[e.source.id].push(e.target);
      adjList[e.target.id].push(e.source);
    });

    const q = [];
    q.push(this.nodes[0]);

    while (q.length > 0) {
      const v1 = q.shift();
      const adj = adjList[v1.id];

      for (let i = 0; i < adj.length; i++) {
        const v2 = adj[i];
        if (v2.visited) {
          continue;
        }
        q.push(v2);
      }

      v1.visited = true;
      v1.cluster = cluster.toString();
      if (q.length === 0) {
        for (let i = 0; i < this.nodes.length; i++) {
          if (!this.nodes[i].visited) {
            q.push(this.nodes[i]);
            componentCount++;
            cluster++;
            break;
          }
        }
      }
    }

    this.componentCount = componentCount;

    const isConnected = componentCount === 1;

    return isConnected;
  }

  isTree() {
    const isConnected = this.isConnected();
    if (isConnected && this.nodes.length - 1 === this.links.length) {
      return true;
    }
    return false;
  }

  areNodesInTree() {
    return this.graphOfTd.nodes.every((node) => this.masterNodes.includes(node.id));
  }

  isEveryGraphLinkInTree() {
    return this.graphOfTd.links.every((link) => {
      for (let i = 0; i < this.nodes.length; i++) {
        const currentBag = this.nodes[i];
        if (currentBag.vertices === undefined) continue;
        if (currentBag.vertices.includes(link.source.id) && currentBag.vertices.includes(link.target.id)) return true;
      }
      return false;
    });
  }

  checkConnectivity(subGraphNodes, subGraphLinks) {
    let componentCount = 1;
    let cluster = 2;

    if (subGraphNodes.length === 0) {
      componentCount = 0;
      return;
    }

    componentCount = 1;
    subGraphNodes.forEach((v) => {
      v.visited = false;
    });

    const adjList = {};
    subGraphNodes.forEach((v) => {
      adjList[v.id] = [];
    });

    subGraphLinks.forEach((e) => {
      adjList[e.source.id].push(e.target);
      adjList[e.target.id].push(e.source);
    });

    const q = [];
    q.push(subGraphNodes[0]);

    while (q.length > 0) {
      const v1 = q.shift();
      const adj = adjList[v1.id];

      for (let i = 0; i < adj.length; i++) {
        const v2 = adj[i];
        if (v2.visited) continue;
        q.push(v2);
      }

      v1.visited = true;
      v1.cluster = cluster.toString();
      if (q.length === 0) {
        for (let i = 0; i < subGraphNodes.length; i++) {
          if (!subGraphNodes[i].visited) {
            q.push(subGraphNodes[i]);
            componentCount++;
            cluster++;
            break;
          }
        }
      }
    }

    this.componentCount = componentCount;

    const isDisconnected = componentCount > 1;

    return { subGraphNodes, subGraphLinks, isDisconnected };
  }

  checkCoherence() {
    /* Check if a node exists in multiple bags */
    for (let i = 0; i < this.graphOfTd.nodes.length; i++) {
      const currentNode = this.graphOfTd.nodes[i];
      currentNode.counter = 0;

      for (let j = 0; j < this.nodes.length; j++) {
        const currentBag = this.nodes[j];
        if (currentBag.vertices === undefined) continue;
        if (currentBag.vertices.includes(currentNode.id)) {
          currentNode.counter++;
        }
      }
    }

    const multipleNodes = this.graphOfTd.nodes.filter((node) => node.counter > 1);

    for (let i = 0; i < multipleNodes.length; i++) {
      const node = multipleNodes[i];
      /* find all bags with this node */

      const tempNodes = this.nodes.filter((bag) => {
        if (bag.vertices) return bag.vertices.includes(node.id);
      });

      const tempLinks = this.links.filter((link) => tempNodes.includes(link.source) && tempNodes.includes(link.target));
      const obj = this.checkConnectivity(tempNodes, tempLinks);
      if (obj.isDisconnected) return false;
    }
    return true;
  }

  checkTreeDecomposition() {
    let treeString;
    let nodeCoverageString;
    let edgeCoverageString;
    let coherenceString;

    if (this.isTree()) {
      treeString = `${checkmarkSvg()} Is a tree`;
    } else {
      treeString = `${errorSvg()} Is a tree`;
    }

    /* Check node coverage */
    if (this.areNodesInTree()) {
      nodeCoverageString = `${checkmarkSvg()} Node coverage`;
    } else {
      nodeCoverageString = `${errorSvg()} Node coverage`;
    }

    /* Check edge coverage */
    if (this.isEveryGraphLinkInTree()) {
      edgeCoverageString = `${checkmarkSvg()} Edge coverage`;
    } else {
      edgeCoverageString = `${errorSvg()} Edge coverage`;
    }

    /* Check coherence property */
    if (this.checkCoherence()) {
      coherenceString = `${checkmarkSvg()} Coherence`;
    } else {
      coherenceString = `${errorSvg()} Coherence`;
    }

    d3.select('.valid-td')
      .html(`
        <span>${treeString}</span>
        <span>${nodeCoverageString}</span>
        <span>${edgeCoverageString}</span>
        <span>${coherenceString}</span>
    `);
  }

  updateMasterList() {
    let temp = [];
    this.nodes.forEach((bag) => {
      if (bag.vertices) temp = temp.concat(bag.vertices);
    });

    const tempSet = [...new Set(temp)];
    this.masterNodes = tempSet;
  }

  removeEdge(d) {
    this.links.splice(this.links.indexOf(d), 1);
    d3.event.preventDefault();
    this.restart();
  }

  restart() {
    this.updateMasterList();
    /* Enter, update, remove link SVGs */
    this.svg.selectAll('line')
      .data(this.links, (d) => `v${d.source.id}-v${d.target.id}`)
      .join(
        (enter) => enter
          .append('line')
          .lower()
          .attr('class', 'tree-link')
          .on('contextmenu', (d) => this.removeEdge(d)),
        (update) => update,
        (exit) => exit.remove(),
      );

    /* Enter, update, remove ellipse SVGs */
    this.svg.selectAll('ellipse')
      .data(this.nodes, (d) => d.id)
      .join(
        (enter) => {
          enter.append('ellipse')
            .attr('rx', 30)
            .attr('ry', 25)
            .style('fill', '#2ca02c')
            .on('mouseover', () => this.disableAddNode())
            .on('mouseleave', () => this.enableAddNode())
            .on('mousedown', (d) => this.beginDrawLine(d))
            .on('mouseup', (d) => this.stopDrawLine(d))
            .on('contextmenu', d3.contextMenu(menu));
        },
        (update) => update.attr('rx', (d) => (d.label && d.label.length > 2 ? d.label.length * 8 : 30)),
        (exit) => exit.remove(),
      );

    this.svg.selectAll('text')
      .data(this.nodes, (d) => d.id)
      .join(
        (enter) => enter.append('text')
          .attr('dy', 4.5)
          .text((d) => d.label)
          .attr('class', 'graph-label'),
        (update) => update.text((d) => d.label),
        (exit) => exit.remove(),
      );

    this.simulation.force('link').links(this.links);
    this.simulation.nodes(this.nodes);
    this.simulation.alpha(0.5).restart();
    this.checkTreeDecomposition();
  }

  setGraph(graph) {
    this.graph = graph;
  }

  setg() {
    this.nodes.forEach((node) => {
      node.graph = this;
    });
  }

  addNode() {
    if (this.canAddNode === false) return;
    const e = d3.event;
    if (e.button === 0) {
      const coords = d3.mouse(e.currentTarget);
      const newNode = {
        x: coords[0], y: coords[1], id: ++this.lastNodeId,
      };
      this.nodes.push(newNode);
      this.setg();
      this.restart();
    }
  }

  enableAddNode() {
    this.canAddNode = true;
  }

  disableAddNode() {
    this.canAddNode = false;
  }

  removeNode(d) {
    d3.event.preventDefault();
    const linksToRemove = this.links.filter((l) => l.source === d || l.target === d);
    linksToRemove.map((l) => this.links.splice(this.links.indexOf(l), 1));
    const indexOfNode = this.nodes.indexOf(d);
    this.nodes.splice(indexOfNode, 1);
    this.restart();
  }

  leftCanvas() {
    this.dragLine.classed('hidden', true);
    this.mousedownNode = null;
  }

  updateDragLine() {
    if (!this.mousedownNode) return;
    const coords = d3.mouse(d3.event.currentTarget);
    this.dragLine.attr(
      'd',
      `M${
        this.mousedownNode.x
      },${
        this.mousedownNode.y
      }L${
        coords[0]
      },${
        coords[1]}`,
    );
  }

  hideDragLine() {
    this.svg.selectAll('ellipse').style('fill', '#2ca02c');
    this.dragLine.classed('hidden', true);
    this.mousedownNode = null;
    this.restart();
  }

  beginDrawLine(d) {
    this.svg.selectAll('ellipse').filter((node) => node === d).style('fill', 'orange');
    if (d3.event.ctrlKey) return;
    d3.event.preventDefault();
    this.mousedownNode = d;
    this.dragLine
      .classed('hidden', false)
      .attr(
        'd',
        `M${
          this.mousedownNode.x
        },${
          this.mousedownNode.y
        }L${
          this.mousedownNode.x
        },${
          this.mousedownNode.y}`,
      );
  }

  stopDrawLine(d) {
    this.svg.selectAll('ellipse').style('fill', '#2ca02c');
    if (!this.mousedownNode || this.mousedownNode === d) return;
    for (let i = 0; i < this.links.length; i++) {
      const l = this.links[i];
      if (
        (l.source === this.mousedownNode && l.target === d)
        || (l.source === d && l.target === this.mousedownNode)
      ) {
        return;
      }
    }
    const newLink = { source: this.mousedownNode, target: d };
    this.links.push(newLink);
  }

  clear() {
    if (this.svg) this.svg.remove();
    this.nodes = [];
    this.links = [];
  }

  enableDrawing() {
    if (this.svg) this.clear();
    d3.select('#output-surface').append('div').attr('class', 'valid-td');
    const w = document.getElementById(this.container).offsetWidth;
    const h = document.getElementById(this.container).offsetHeight;
    this.width = w;
    this.height = h;
    const svg = d3.select(`#${this.container}`).append('svg').attr('width', w).attr('height', h);
    this.svg = svg;
    this.svg.style('cursor', 'crosshair');

    this.restartSimulation();

    this.svg
      .on('mousedown', () => this.addNode())
      .on('contextmenu', () => d3.event.preventDefault())
      .on('mousemove', () => this.updateDragLine())
      .on('mouseup', () => this.hideDragLine())
      .on('mouseleave', () => this.leftCanvas());

    this.dragLine = this.svg
      .append('path')
      .attr('class', 'dragLine hidden')
      .attr('d', 'M0,0L0,0');
  }

  restartSimulation() {
    const simulation = d3.forceSimulation()
      .force('x', d3.forceX(this.width / 2).strength(0.1))
      .force('y', d3.forceY(this.height / 2).strength(0.1))
      .nodes(this.nodes)
      .force('charge', d3.forceManyBody().strength(-900))
      .force('link', d3.forceLink(this.links).id((d) => d.id).distance(100).strength(0.05))
      .force('collision', d3.forceCollide().radius((d) => d.rx + 100))
      .on('tick', () => {
        this.svg.selectAll('ellipse').attr('transform', (d) => `translate(${d.x},${d.y})`);
        this.svg.selectAll('text').attr('x', (d) => d.x).attr('y', (d) => d.y);

        this.svg.selectAll('line').attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);
      });

    simulation.force('link').links(this.links);
    this.simulation = simulation;
  }
}
