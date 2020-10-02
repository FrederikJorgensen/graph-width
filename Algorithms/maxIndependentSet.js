const getAllSubsets = (theArray) => theArray.reduce(
  (subsets, value) => subsets.concat(
    subsets.map((set) => [value, ...set]),
  ),
  [[]],
);

function createTableJoinNodeMis(allSubsets, tree) {
  const table = {};

  for (const set of allSubsets) {
    const child1value = tree.childTable[set];
    const child2value = tree.childTable2[set];
    const currentNodeValue = set.length;
    table[set] = child1value + child2value - currentNodeValue;
  }

  return table;
}

function createTableForgetNodeMis(allSubsets, tree) {
  const table = {};

  for (const set of allSubsets) {
    const concatV = set.concat(tree.forgottenVertex);
    concatV.sort();
    const setWithoutV = tree.childTable[set];
    const setWithV = tree.childTable[concatV];
    if (setWithoutV > setWithV) {
      table[set] = setWithoutV;
    } else {
      table[set] = setWithV;
    }
  }

  return table;
}

function createTableForIntroduceNodeMis(allSubsets, tree) {
  const table = tree.childTable;

  for (const set of allSubsets) {
    if (set.includes(tree.introducedVertex)) {
      const setWithoutV = set.filter((s) => s !== tree.introducedVertex);
      if (tree.graph.isVertexAdjacent(tree.subTree, set)) {
        table[set] = -9999;
      } else {
        let oldValue = tree.childTable[setWithoutV];
        oldValue++;
        table[set] = oldValue;
      }
    }
  }
  return table;
}

function createMisTableHtmlString(table) {
  const keys = Object.keys(table);
  const values = Object.values(table);
  let htmlString = '';

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
    htmlString += `<tr id=${key}><td>${key}</td><td>${value}</td></tr>`;
  });

  return `<table class="hamiltonianTable"><thead><tr><td>S</td><td>MIS</td></tr></thead><tbody id="tbody">${htmlString}</tbody></table>`;
}

export default function maxIndependentSet(tree) {
  let i = 0;
  tree.root.copy().eachAfter((currentNode) => {
    if (tree.currentNodeIndex !== ++i) return;
    const node = currentNode.data;
    tree.setNodeType(node);
    tree.setSubTree(tree.root, node);
    const inducedSubgraph = tree.graph.createSubgraph(tree.subTree);
    tree.graph.highlightSubGraph(inducedSubgraph);
    const allSubsets = getAllSubsets(currentNode.data.vertices);
    allSubsets.map((s) => s.sort());
    if ('children' in node) tree.setChildTable(node);
    node.table = {};
    tree.graph.resetNodeColors();

    switch (tree.nodeType) {
      case 'leaf':
        tree.graph.hideArrow();
        tree.graph.hideHull();
        tree.graph.hideTooltip();
        node.table[''] = 0;
        break;
      case 'introduce':
        tree.setIntroducedVertex(node);
        tree.graph.addNodeArrow(tree.introducedVertex, 'Introduced Vertex');
        tree.graph.highlightNodeColor(tree.introducedVertex, 'rgb(128, 177, 211)');
        node.table = createTableForIntroduceNodeMis(allSubsets, tree);
        break;
      case 'forget':
        tree.setForgottenVertex(node);
        tree.graph.addNodeArrow(tree.forgottenVertex, 'Forgotten Vertex');
        tree.graph.highlightNodeColor(tree.forgottenVertex, 'rgb(251, 128, 114)');
        node.table = createTableForgetNodeMis(allSubsets, tree);
        break;
      case 'join':
        tree.setChildTable(node);
        tree.setChildTable2(node);
        node.table = createTableJoinNodeMis(allSubsets, tree);
        break;
      default:
        break;
    }
    const misHtmlTableString = createMisTableHtmlString(node.table);
    tree.moveTableArrow(node);
    tree.moveTable(misHtmlTableString);
  });
}
