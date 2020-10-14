import { deepClone, getKeysAsInts } from '../Utilities/helpers.js';

function removePairFromMatching(matching, pair) {
  const pairIndex = matching.indexOf(pair);
  matching.splice(pairIndex, 1);
  return matching;
}

function createTableHeader() {
  return String.raw`
  <thead>
    <tr>
      <th>d</th>
      <th>M</th>
    </tr>
  </thead>
  `;
}

function createMatchingString(matching) {
  let matchingString = '[ ';
  matching.forEach((pair) => {
    if (pair.length !== 0) matchingString += JSON.stringify(pair);
  });

  matchingString += ' ]';
  return matchingString;
}

function createDegreeString(verticesDegrees) {
  const verticesIds = Array.from(Object.keys(verticesDegrees));
  let matrixString = '';
  for (const vertexId of verticesIds) {
    const degree = verticesDegrees[vertexId];
    matrixString += String.raw`${vertexId} → ${degree} <br>`;
  }
  return matrixString;
}

function createRow(matrixString, matchingString) {
  return String.raw`
  <tr>
    <td>${matrixString}</td>
    <td>${matchingString}</td>
  </tr>`;
}

function createTableRows(solutionTypes) {
  let tableRowString = '';
  solutionTypes.forEach((solutionType) => {
    const verticesDegrees = solutionType[0];
    const matching = solutionType[1];
    const degreeString = createDegreeString(verticesDegrees, matching);
    const matchingString = createMatchingString(matching);
    tableRowString += createRow(degreeString, matchingString);
  });
  return tableRowString;
}

function createHTMLTable(tableHeader, tableRows) {
  return `<table id="dp-table" class="hamiltonianTable">${tableHeader}<tbody>${tableRows}</tbody></table>`;
}

function createHamiltonianHtmlTableString(table) {
  const solutionTypes = [...table.keys()];
  const solutionTypesBooleans = [...table.values()];
  const tableHeader = createTableHeader();
  const tableRows = createTableRows(solutionTypes, solutionTypesBooleans);
  const htmlTable = createHTMLTable(tableHeader, tableRows);
  return htmlTable;
}

function createTableForForgetNode(partialSolutions, forgottenVertex) {
  const table = new Map();

  partialSolutions.forEach((partialSolution) => {
    const solutionType = [];
    const degreeVertices = deepClone(partialSolution[0]);
    const matching = deepClone(partialSolution[1]);
    const valueOfForgottenVertex = degreeVertices[forgottenVertex];
    delete degreeVertices[forgottenVertex];

    if (valueOfForgottenVertex === 2) {
      solutionType.push(degreeVertices, matching);
      table.set(solutionType, true);
    }
  });

  return table;
}

function updateMatching(matching, w, introducedVertex) {
  matching = matching.filter((pair) => !pair.includes(w));
  const pair = [];
  pair.push(w, introducedVertex);
  matching.push(pair);
  return matching;
}

function createLeafNodeTable() {
  const table = new Map();
  const verticesDegrees = {};
  const matching = [];
  const state = [verticesDegrees, matching];
  table.set(state, true);
  return table;
}

function createTableForNodeAboveLeaf(tree) {
  const table = new Map();
  const solutionType = [];
  const d = {};
  d[tree.introducedVertex] = 0;
  const matching = [];
  const pair = [];
  pair.push(tree.introducedVertex);
  matching.push(pair);
  solutionType.push(d, matching);
  table.set(solutionType, true);
  return table;
}

function createSolutionTypeForDegreeZero(verticesDegrees, matching, tree) {
  const solutionType = [];
  const pair = [];
  verticesDegrees[tree.introducedVertex] = 0;
  pair.push(tree.introducedVertex);
  matching.push(pair);
  solutionType.push(verticesDegrees, matching);
  return solutionType;
}

function createSolutionTypeForDegreeOne(
  childVertices,
  verticesDegrees,
  matching,
  tree,
) {
  const solutionType = [];
  verticesDegrees[tree.introducedVertex] = 1;

  for (const childVertex of childVertices) {
    if (tree.graph.isEdge(childVertex, tree.introducedVertex)) {
      const degreeOfW = verticesDegrees[childVertex];

      switch (degreeOfW) {
        case 0:
          verticesDegrees[childVertex] = 1;
          matching = updateMatching(
            matching,
            childVertex,
            tree.introducedVertex,
          );
          solutionType.push(verticesDegrees, matching);
          return solutionType;
        case 1:
          for (let pair of matching) {
            if (pair.includes(childVertex)) {
              matching = removePairFromMatching(matching, pair);
              pair = pair.filter((x) => x !== childVertex);
              pair.push(tree.introducedVertex);
              matching.push(pair);
              verticesDegrees[childVertex] = 2;
              solutionType.push(verticesDegrees, matching);
              return solutionType;
            }
          }
          break;
        default:
          break;
      }
    }
  }
}

function createSolutionTypeForDegreeTwo(
  childVertices,
  verticesDegrees,
  matching,
  tree,
) {
  verticesDegrees[tree.introducedVertex] = 2;

  const solutionType = [];
  const neighbors = tree.graph.getNeighbors(tree.introducedVertex);
  const neighborsInSubGraph = neighbors.filter((value) => childVertices.includes(value));

  if (neighborsInSubGraph.length === 2) {
    const neighborOne = neighborsInSubGraph[0];
    const neighborTwo = neighborsInSubGraph[1];

    let oldVal = verticesDegrees[neighborOne];
    let oldVal2 = verticesDegrees[neighborTwo];

    verticesDegrees[neighborOne] = ++oldVal;
    verticesDegrees[neighborTwo] = ++oldVal2;

    matching = matching.filter((pair) => !pair.includes(neighborOne));
    matching = matching.filter((pair) => !pair.includes(neighborTwo));

    if (
      verticesDegrees[neighborOne] === 1
      && verticesDegrees[neighborTwo] === 1
    ) {
      const pair = [neighborOne, neighborTwo];
      matching.push(pair);
    }

    solutionType.push(verticesDegrees, matching);
    return solutionType;
  }
}

function createTableForIntroduceNode(partialSolutions, tree) {
  const table = new Map();
  partialSolutions.forEach((partialSolution) => {
    for (let i = 0; i <= 2; i++) {
      const verticesDegrees = deepClone(partialSolution[0]);
      const matching = deepClone(partialSolution[1]);
      const childVertices = getKeysAsInts(verticesDegrees);
      let solutionType = [];

      switch (i) {
        case 0:
          solutionType = createSolutionTypeForDegreeZero(
            verticesDegrees,
            matching,
            tree,
          );
          break;
        case 1:
          solutionType = createSolutionTypeForDegreeOne(
            childVertices,
            verticesDegrees,
            matching,
            tree,
          );
          break;
        case 2:
          solutionType = createSolutionTypeForDegreeTwo(
            childVertices,
            verticesDegrees,
            matching,
            tree,
          );
          break;
        default:
          break;
      }
      if (solutionType !== undefined) table.set(solutionType, true);
    }
  });
  return table;
}

export default function hamiltonianCycle(tree) {
  let i = 1;
  tree.root.eachAfter((currentNode) => {
    if (tree.currentNodeIndex !== i++) return;
    const node = currentNode.data;
    tree.setNodeType(node);
    tree.setSubTree(tree.root, node);
    const inducedSubgraph = tree.graph.createSubgraph(tree.subTree);
    tree.graph.resetNodeColors();
    tree.graph.highlightSubGraph(inducedSubgraph);

    let partialSolutions;
    if ('children' in node) {
      tree.setChild(node);
      if (tree.child.table.size !== 0) {
        partialSolutions = [...tree.child.table.keys()];
      }
    }

    switch (tree.nodeType) {
      case 'leaf':
        tree.graph.hideTooltip();
        tree.graph.hideArrow();
        tree.graph.hideHull();
        node.table = createLeafNodeTable();
        break;
      case 'introduce':
        tree.setIntroducedVertex(node);
        tree.graph.addNodeArrow(tree.introducedVertex, 'Introduced vertex');
        tree.graph.highlightNodeColor(
          tree.introducedVertex,
          'rgb(128, 177, 211)',
        );
        if (tree.child.vertices.length === 0) {
          node.table = createTableForNodeAboveLeaf(tree);
        } else {
          node.table = createTableForIntroduceNode(partialSolutions, tree);
        }
        break;
      case 'forget':
        tree.setForgottenVertex(node);
        tree.graph.addNodeArrow(tree.forgottenVertex, 'Forgotten vertex');
        tree.graph.highlightNodeColor(
          tree.forgottenVertex,
          'rgb(251, 128, 114)',
        );
        node.table = createTableForForgetNode(
          partialSolutions,
          tree.forgottenVertex,
        );
        break;
      case 'join':
        break;
      default:
        break;
    }
    const tableData = createHamiltonianHtmlTableString(node.table);
    tree.moveTableArrow(node);
    tree.moveTable(tableData);
  });
}
