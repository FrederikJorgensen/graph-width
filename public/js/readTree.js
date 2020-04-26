import loadNiceTreeDecomposition from './niceTreeDecomposition.js';
import loadTreeDecomposition from './treeDecomposition.js';

const a = 97;
const charArray = {};
for (let i = 0; i < 26; i++) charArray[String.fromCharCode(a + i)] = i + 1;
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);

export function readTreeDecomposition(treeData) {
  treeData.pop();
  const nodes = [];
  const links = [];
  const treeDecomp = {};
  for (let i = 0; i < treeData.length; i++) {
    const textLine = treeData[i];
    let bagLabel = '';

    if (textLine.startsWith('b')) {
      const splitted = textLine.split(' ');
      const bagId = parseInt(splitted[1], 10);
      splitted.shift();
      splitted.shift();
      for (let j = 0; j < splitted.length; j++) {
        bagLabel += `${splitted[j]}, `;
      }
      bagLabel = bagLabel.replace(/,\s*$/, '');
      nodes.push({ id: bagId, label: bagLabel });
    } else {
      const splitted = textLine.split(' ');
      links.push({ source: splitted[0], target: splitted[1] });
    }
  }
  treeDecomp.nodes = nodes;
  treeDecomp.links = links;
  loadTreeDecomposition(treeDecomp, '#tdSvg');
}

function readNiceTreeDecomposition(treeData) {
  treeData.splice(0, 3);
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
        baglabel += `${splitted[i]}, `;
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
      id: String(root),
      label: allBagLabels[root],
      vertices: verticesInBag[root],
      liss: 0,
    };

    if (children.length !== 0) { // if there are any children,
      tree.children = []; // add the children property to the tree object
      for (const child of children) {
        tree.children.push(createTree(child, nodes)); // then add the tree of each of the children
      }
    }
    return tree;
  }
  const newTree = createTree(root, edgePairs);
  loadNiceTreeDecomposition(newTree);
}

export default async function readLocalTreeFile(file, treeType) {
  const response = await fetch(file);
  const text = await response.text();
  const splittedText = text.split('\n');

  if (treeType === 'niceTreeDecomposition') {
    readNiceTreeDecomposition(splittedText);
  } else if (treeType === 'treeDecomposition') {
    readTreeDecomposition(splittedText);
  }
}
