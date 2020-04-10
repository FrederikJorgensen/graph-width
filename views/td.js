/* eslint-disable no-useless-concat */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-continue */
/* eslint-disable no-mixed-operators */
let graphNode;
let graphLink;
let graphLabel;
let treeNode;
let treeLink;
let treeLabel;
const adjlist = [];
let selected = [];
let graph1;
let finalGraph;

/** Sample a random graph G(n,m)
  * @param {Number} n vertices
  * @param {Number} m edges
  * @return {Graph}
  */
function randomGraph(n, m) {
  const maxNumEdges = n * (n - 1) / 2;
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined;

  const graph = { nodes: [], links: [] };
  for (let i = 0; i < n; i++) {
    graph.nodes[i] = { id: i, label: i };
  }

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);

  const state = {};
  for (let i = 0; i < m; i++) {
    const j = randomInt(i, maxNumEdges);
    if (!(i in state)) state[i] = i;
    if (!(j in state)) state[j] = j;
    [state[i], state[j]] = [state[j], state[i]];
  }

  function unpair(k) {
    const z = Math.floor((-1 + Math.sqrt(1 + 8 * k)) / 2);
    return [k - z * (1 + z) / 2, z * (3 + z) / 2 - k];
  }

  for (let i = 0; i < m; i++) {
    const [x, y] = unpair(state[i]);
    const u = graph.nodes[x];
    const v = graph.nodes[n - 1 - y];
    graph.links.push({ source: u, target: v });
  }
  return graph;
}

/* eslint-disable no-param-reassign */
function drawGraph(graph) {
  const width = document.getElementById('graph-container').offsetWidth;
  const height = document.getElementById('graph-container').offsetHeight;
  const svg = d3.select('#graph');

  const { nodes } = graph;
  const { links } = graph;

  graphLink = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link');

  graphNode = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 18)
    .attr('class', 'node');

  graphLabel = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text((d) => d.label);

  function ticked() {
    graphNode.attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    graphLink.attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    graphLabel
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);
  }

  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink(links).id((d) => d.id).distance(70).strength(1.5))
    .on('tick', ticked);


  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  links.forEach((d) => {
    adjlist[`${d.source.index}-${d.target.index}`] = true;
  });

  graphNode.call(
    d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended),
  );

  graph1 = graph;
}

function nodeShouldBeVisible(nodeIndex, vertices) {
  return vertices.some((vertix) => adjlist[`${vertix}-${nodeIndex}`] || adjlist[`${nodeIndex}-${vertix}`] || vertix === nodeIndex);
}

function linkShouldBeVisible(sourceIndex, targetIndex, indexes) {
  if (targetIndex !== undefined) {
    return nodeShouldBeVisible(sourceIndex, indexes)
          && nodeShouldBeVisible(targetIndex, indexes);
  }
  return indexes.some((d) => adjlist[`${sourceIndex}-${d}`]
           + adjlist[`${d}-${sourceIndex}`]);
}

function getVerticesIndexes(vertices) {
  graph1.nodes.forEach((currentNode) => {
    if (vertices.includes(currentNode.label)) {
      selected.push(currentNode.index);
    }
  });
  return selected;
}

function highlightNodes(hoveredNode) {
  const verticesToHighlight = hoveredNode.data.vertices;
  const indexes = getVerticesIndexes(verticesToHighlight);

  graphNode
    .attr('opacity', (o) => {
      if (nodeShouldBeVisible(o.index, indexes)) {
        return 1;
      }
      return 0.1;
    });

  graphLink.attr('opacity', (o) => {
    if (linkShouldBeVisible(o.source.index, o.target.index, indexes)) {
      return 1;
    }
    return 0;
  });
}

function resetHighlight() {
  graphNode.attr('opacity', 1);
  graphLink.attr('opacity', 1);
  selected = [];
}


/* eslint-disable no-param-reassign */
function drawTree(tree) {
  // Get height and width of the specified container
  const width = document.getElementById('tree-container').offsetWidth;
  const height = document.getElementById('tree-container').offsetHeight;

  let svg = d3.select('#tree');

  const drag = (simulation) => {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  };

  const root = d3.hierarchy(tree);
  const links = root.links();
  const nodes = root.descendants();

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(2).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-1500))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  svg = d3.selectAll('#tree')
    .attr('viewBox', [-width / 2, -height / 2, width, height]);

  treeLink = svg.append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line');

  treeNode = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 20)
    .attr('fill', '#1a7532')
    .call(drag(simulation));

  treeLabel = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'label')
    .text((d) => d.data.name);

  treeNode.on('mouseover', highlightNodes);
  treeNode.on('mouseout', resetHighlight);

  simulation.on('tick', () => {
    const ky = 1.2 * simulation.alpha();
    links.forEach((d) => {
      d.target.y += (d.target.depth * 120 - d.target.y) * ky;
    });

    treeLink
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    treeNode
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);


    treeLabel
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);
  });
}

function removeExistingGraph() {
  if (graphNode && graphLink && graphLabel) {
    graphNode.remove();
    graphLink.remove();
    graphLabel.remove();
  }
}

function removeExistingTree() {
  if (treeNode && treeLink && treeLabel) {
    treeNode.remove();
    treeLink.remove();
    treeLabel.remove();
  }
}

/* function readGraphFile(evt) {
  const f = evt.target.files[0];

  const edges = [];

  const r = new FileReader();
  r.onload = function onLoad() {
    const lines = this.result.split('\n');
    const list = [];
    for (let line = 0; line < lines.length; line++) {
      const textLine = lines[line];
      if (textLine.startsWith('c') || textLine.startsWith('p') || textLine.length < 1) {
        continue;
      } else {
        const firstNode = parseInt(textLine[0], 10);
        const secondNode = parseInt(textLine[2], 10);
        list.push(firstNode);
        list.push(secondNode);
        edges.push({ source: firstNode, target: secondNode });
      }
    }

    const sortedList = [...new Set(list)];
    const finalList = [];
    for (let i = 0; i < sortedList.length; i++) {
      finalList.push({ id: sortedList[i], label: sortedList[i] });
    }
    const jsonGraph = JSON.parse(finalGraph);
    removeExistingGraph();
    drawGraph(jsonGraph);
  };
  r.readAsText(f);
} */

function create() {
  removeExistingGraph();
  const graph = randomGraph(20, 20);
  drawGraph(graph);
}


const PetersenTree = {
  id: 1,
  name: '1, 2',
  vertices: [1, 2],
  children: [{
    id: 2,
    name: '2, 3',
    vertices: [2, 3],
    children: [{
      id: 3, name: '4, 3', vertices: [4, 3], children: [{ id: 4, name: '5, 4', vertices: [5, 4] }],
    }],
  },
  ],
};


/*
b 1 1 2
b 2 2 3
b 3 4 3
b 4 5 4
1 2
2 3
3 4
*/


/*
0 2 4 6 8
b 1 1 2
b 2 5 4
b 3 2 3
b 4 4 3
b 5 1 2 3
b 6 1
1 3
3 4
4 2
*/


/*
const result = document.createElement('PRE');
document.body.appendChild(result);

function convertTreeToJSON() {
  const lines = this.result.split('\n');
  const edges = [];
  const treeBags = [];
  const allNodes = [];

  const map1 = new Map();

  const res = {}; let current = res;

  for (let line = 0; line < lines.length; line++) {
    const textLine = lines[line];

    if (textLine.startsWith('c') || textLine.startsWith('s')) return;

    if (textLine.startsWith('b')) {
      const bagId = parseInt(textLine[2], 10);
      let bagLabel;
      let vertices;
      const firstNode = textLine[4];
      const secondNode = textLine[6];
      const thirdNode = textLine[8];

      if (secondNode === undefined) {
        bagLabel = firstNode;
        vertices = [firstNode];
      } else if (thirdNode === undefined) {
        bagLabel = firstNode + secondNode;
        vertices = [parseInt(firstNode, 10), parseInt(secondNode, 10)];
      } else {
        bagLabel = firstNode + secondNode + thirdNode;
        vertices = [firstNode, secondNode, thirdNode];
      }
      allNodes.push(bagId);
      treeBags.push({ bagId, bagLabel, vertices });
      map1.set(bagId, bagLabel);
      current.id = bagId;
      current.name = vertices.join(', '); // bagLabel;
      current.vertices = vertices;
      /* / a bit useless array below, put another slash @start to take it out
            current = (current.children = {});
            / */
/*       current = (current.children = [{}])[0];
      //* /
    } else {
      edges.push({ source: textLine[0], target: textLine[2] });
    }
  }
  return JSON.stringify(res, null, 2);
}
 */

/* const result = document.createElement('PRE');

result.innerText = x = JSON.stringify(
  convertTreeToJSON.call({ result: 'b 1 1 2\nb 2 2 3\nb 3 4 3\nb 4 5 4\n1 2\n2 3\n3 4' }), null, 1,
)
  .replace(/\[\n\s+(\d+),\n\s+(\d+)\n\s+]/g, '[$1, $2]')
  .replace(/\[\n\s+/g, '[').replace(/}\n\s+\]/g, '}]');

document.body.appendChild(result);
function convertTreeToJSON(x) {
  const lines = this.result.split('\n');
  const edges = [];
  const treeBags = [];
  const allNodes = [];

  const map1 = new Map();

  const res = {}; let current = res;

  for (let line = 0; line < lines.length; line++) {
    const textLine = lines[line];

    if (textLine.startsWith('c') || textLine.startsWith('s')) return;

    if (textLine.startsWith('b')) {
      const bagId = parseInt(textLine[2], 10);
      let bagLabel;
      let vertices;
      const firstNode = textLine[4];
      const secondNode = textLine[6];
      const thirdNode = textLine[8];

      if (secondNode === undefined) {
        bagLabel = firstNode;
        vertices = [firstNode];
      } else if (thirdNode === undefined) {
        bagLabel = firstNode + secondNode;
        vertices = [parseInt(firstNode, 10), parseInt(secondNode, 10)];
      } else {
        bagLabel = firstNode + secondNode + thirdNode;
        vertices = [firstNode, secondNode, thirdNode];
      }
      allNodes.push(bagId);
      treeBags.push({ bagId, bagLabel, vertices });
      map1.set(bagId, bagLabel);
      current.id = bagId;
      current.name = vertices.join(', '); // bagLabel;
      current.vertices = vertices;
      current = (current.children = [{}])[0];

    }
  }
  return res;
} */


/* function readTreeInput(evt) {
  const file = evt.target.files[0];
  const fileReader = new FileReader();

  fileReader.onload = function convertTreeToJSON() {
    const lines = this.result.split('\n');
    const res = {}; let current = res;

    for (let line = 0; line < lines.length; line++) {
      const textLine = lines[line];
      if (textLine.startsWith('c') || textLine.startsWith('s')) continue;

      if (textLine.startsWith('b')) {
        const bagId = parseInt(textLine[2], 10);
        let vertices;
        const firstNode = textLine[4];
        const secondNode = textLine[6];
        const thirdNode = textLine[8];

        if (secondNode === undefined) {
          vertices = [firstNode];
        } else if (thirdNode === undefined) {
          vertices = [parseInt(firstNode, 10), parseInt(secondNode, 10)];
        } else {
          vertices = [firstNode, secondNode, thirdNode];
        }
        console.log(textLine);
        console.log(res.id);

        if (res.id === undefined) {
          current = res;
        } else {
          current = res.children[res.children.push({}) - 1];
        }
        current.id = bagId;
        current.name = vertices.join(', '); // bagLabel;
        current.vertices = vertices;
        if (current === res) current.children = [];
      }
    }
    const newres = JSON.stringify(res).replace(/\[\n\s+(\d+),\n\s+(\d+)\n\s+]/g, '[$1, $2]').replace(/\[\n\s+/g, '[').replace(/}\n\s+\]/g, '}]')
      .replace(/\[\n\s+/g, '[')
      .replace(/}\n\s+\]/g, '}]');
    removeExistingTree();
    drawTree(res);
  };
  fileReader.readAsText(file);
} */

function readTreeInput(evt) {
  const file = evt.target.files[0];
  const fileReader = new FileReader();

  fileReader.onload = function convertTreeToJSON() {
    const lines = this.result.split('\n');
    const treeBags = [];
    const allNodes = [];
    const nodesWithChildren = [];
    const edgesArray = [];

    for (let line = 0; line < lines.length; line++) {
      const textLine = lines[line];
      const bagId = parseInt(textLine[2], 10);
      const firstNode = textLine[4];
      const secondNode = textLine[6];
      const thirdNode = textLine[8];
      let bagLabel;
      let vertices;


      if (textLine.startsWith('c') || textLine.startsWith('s')) return;
      if (textLine.startsWith('b')) {
        if (secondNode === undefined) {
          bagLabel = firstNode;
          vertices = [firstNode];
        } else if (thirdNode === undefined) {
          bagLabel = firstNode + secondNode;
          vertices = [firstNode, secondNode];
        } else {
          bagLabel = firstNode + secondNode + thirdNode;
          vertices = [firstNode, secondNode, thirdNode];
        }
        allNodes.push(bagId);
        treeBags.push({ bagId, bagLabel, vertices });
      } else {
        const sourceNode = parseInt(textLine[0], 10);
        const targetNode = parseInt(textLine[2], 10);
        const edges = {};
        edges.source = sourceNode;
        edges.target = targetNode;
        edgesArray.push(edges);
        if (nodesWithChildren.indexOf(sourceNode) === -1) nodesWithChildren.push(sourceNode);
      }
    }

    // create the nodes without children
    const nodesWithoutChildren = allNodes.filter((n) => !nodesWithChildren.includes(n));
    let stc; let
      st;
    let result = '';

    // All nodes [1,2,3,4,5]
    // Nodes with children [1,2]
    // Nodes without children [3,4]
    // edges 1 - 2
    // 1->2
    // 1->3
    // 2->4
    // 2->5

    function checkIfLinkExists(parent, child) {
      for (let i = 0; i < edgesArray.length; i++) {
        if (edgesArray[i].source === parent && edgesArray[i].target === child) return true;
      }
      return false;
    }

    function findChildren(node) {
      let result = '';
      let st = '';
      const temp = [];
      for (let i = 0; i < edgesArray.length; i++) {
        if (edgesArray[i].source === node) {
          temp.push(edgesArray[i].target);
        }
      }

      for (let i = 0; i < temp.length; i++) {
        if ((i + 1) === temp.length) {
          st = `
          {
            "id": ${temp[i]},
            "name": ${temp[i]}
          }`;
        } else {
          st = `
          {
            "id": ${temp[i]},
            "name": ${temp[i]}
          },`;
        }
        result += st;
      }
      return result;
    }

    for (let i = 0; i < 1; i++) {
      stc = `{
              "id":${nodesWithChildren[i]},
              "name":${nodesWithChildren[i]},
              "children":[`;
      result += stc;
      for (let j = 0; j < allNodes.length; j++) {
        const currentParent = nodesWithChildren[i];
        const currentChild = allNodes[j];


        if (checkIfLinkExists(currentParent, currentChild)) {
          /*           if ((j + 1) === allNodes.length) {
            console.log('here');
            console.log(currentChild);
            st = `{"id":${currentChild},"name":${currentChild}}`;
            result += st;
            continue;
          } */

          // check if the child has children as well..
          if (nodesWithChildren.includes(currentChild)) {
            st = `{
                  "id":${currentChild},
                  "name":${currentChild},
                  "children":[${findChildren(currentChild)}]},`;
            result += st;
          } else {
            st = `{"id":${currentChild},"name":${currentChild}}`;
            result += st;
          }
        }
      }
      const endOfString = ']}';
      result += endOfString;
    }
    const newstring = result.replace(/,(?=[^,]*$)/, '');
    const newobj = JSON.parse(newstring);
    removeExistingTree();
    drawTree(newobj);
  };
  fileReader.readAsText(file);
}


const tree = {
  id: 1,
  name: '1, 2, 3',
  vertices: [1, 2, 3],
  children: [
    {
      id: 2,
      name: '2, 3, 4',
      vertices: [2, 3, 4],
      children: [],
    },
    {
      id: 3,
      name: '4, 5, 6',
      vertices: [4, 5, 6],
      children: [],
    },
  ],
};

function uploadGraph(evt) {
  const file = evt.target.files[0];

  $.ajax({
    url: '/upload',
    type: 'POST',
    data: file,
    processData: false,
    success(data) {
      console.log('upload successful!');
    },
  });
}


// document.getElementById('graph-input').addEventListener('change', uploadGraph);
document.getElementById('tree-input').addEventListener('change', readTreeInput);
document.getElementById('reload').addEventListener('click', create);
drawTree(tree);
