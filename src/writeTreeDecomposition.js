export function createTreeDecomposition(data) {
  const nodes = [];
  const links = [];
  const treeDecomp = {};
  for (let i = 0; i < data.length; i++) {
    const textLine = data[i];
    let bagLabel = '';
    const vertices = [];
    if (textLine.startsWith('b')) {
      const splitted = textLine.split(' ');
      const bagId = parseInt(splitted[1], 10);
      splitted.shift();
      splitted.shift();
      for (let j = 0; j < splitted.length; j++) {
        if (j === splitted.length - 1) {
          bagLabel += `${splitted[j]}`;
        } else {
          bagLabel += `${splitted[j]} `;
        }
        const currentNode = parseInt(splitted[j], 10);
        vertices.push(currentNode);
      }
      bagLabel = `${bagLabel}`;
      nodes.push({ id: bagId, label: bagLabel, vertices });
    } else {
      const splitted = textLine.split(' ');
      const sourceNode = parseInt(splitted[0], 10);
      const targetNode = parseInt(splitted[1], 10);
      links.push({ source: sourceNode, target: targetNode });
    }
  }
  treeDecomp.nodes = nodes;
  treeDecomp.links = links;
  return treeDecomp;
}


export function createNiceTreeDecomposition(treeData) {
  const edgePairs = [];
  const allBagLabels = {};
  const verticesInBag = {};
  let root;

  for (let line = 0; line < treeData.length; line++) {
    const textLine = treeData[line];
    const splitted = textLine.split(' ');
    let baglabel = '';
    let bagId;

    if (textLine.startsWith('root')) {
      root = parseInt(treeData[line + 1], 10);
      break;
    } else if (textLine.startsWith('b')) {
      bagId = parseInt(splitted[1], 10);
      const vertices = [];
      for (let i = 2; i < splitted.length; i++) {
        baglabel += `${splitted[i]},`;

        const currentNode = parseInt(splitted[i], 10);
        vertices.push(currentNode);
      }
      baglabel = baglabel.replace(/,\s*$/, '');
      allBagLabels[bagId] = baglabel;
      verticesInBag[bagId] = vertices;
    } else {
      const sourceNode = parseInt(splitted[0], 10);
      const targetNode = parseInt(splitted[1], 10);
      const edge = [];
      edge.push(sourceNode, targetNode);
      edgePairs.push(edge);
    }
  }

  // https://stackoverflow.com/questions/61374720/build-tree-from-edge-pairs-and-root?noredirect=1#comment108574565_61374720
  function createTree(root, nodes) {
    const children = [];
    for (let i = 0; i < nodes.length; i++) {
      const indexOfRoot = nodes[i].indexOf(root);
      if (indexOfRoot !== -1) {
        children.push(nodes[i][Number(!indexOfRoot)]); // note that data like [1,2,4] or [1] will not work.
        nodes.splice(i, 1);
        i--; // after removing the element, decrement the iterator
      }
    }

    const tree = {
      id: parseInt(root, 10),
      label: allBagLabels[root],
      vertices: verticesInBag[root],
      liss: 0,
    };

    if (children.length !== 0) {
      // if there are any children,
      tree.children = []; // add the children property to the tree object
      for (const child of children) {
        tree.children.push(createTree(child, nodes)); // then add the tree of each of the children
      }
    }
    return tree;
  }
  const newTree = createTree(root, edgePairs);
  return newTree;
}
