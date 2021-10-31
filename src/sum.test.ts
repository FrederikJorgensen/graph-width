interface INode {
  id: number;
}

interface ILink {
  source: number;
  target: number;
}

type AdjLink = `${number}-${number}`;

interface IGraph {
  nodes: INode[];
  links: ILink[];
}

const exampleGraph1 = {
  nodes: [{ id: 1 }, { id: 2 }, { id: 3 }],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
  ],
};

class Graph {
  nodes: INode[];
  links: ILink[];
  selectedNodes: INode[];
  adjencyList: AdjLink[];

  constructor(graphData: IGraph) {
    this.nodes = graphData.nodes;
    this.links = graphData.links;
    this.selectedNodes = [];

    // this.adjencyList = adjencyList;
  }

  setSelectedNodes(nodes: INode[]) {
    this.selectedNodes = nodes;
  }

  isNeighboring(nodeToCheck: INode) {
    return this.selectedNodes.some((selectNode) => {
      let link: AdjLink = `${selectNode.id}-${nodeToCheck.id}`;
      if (this.adjencyList[link]) return true;
      return false;
    });
  }

  areSelectedNodesAdjacent() {
    return (
      this.selectedNodes.length === 1 ||
      this.selectedNodes.every((node) => {
        if (this.isNeighboring(node)) return true;
        return false;
      })
    );
  }

  isBalancedSeparator() {
    if (!this.selectedNodes.length) return false;
    return this.areSelectedNodesAdjacent();
  }
}

test('select 1 node returns expected', () => {
  const graph = new Graph(exampleGraph1);
  graph.setSelectedNodes([{ id: 1 }]);
  expect(graph.selectedNodes).toEqual([{ id: 1 }]);
});

test('no selected nodes returns empty array', () => {
  const graph = new Graph(exampleGraph1);
  expect(graph.selectedNodes).toEqual([]);
});

test('balanced separator exercise returns false when there are no selected nodes', () => {
  const graph = new Graph(exampleGraph1);
  expect(graph.isBalancedSeparator()).toBeFalsy();
});

test('selected 1 node where it separates the graph should return true', () => {
  const graph = new Graph(exampleGraph1);
  graph.setSelectedNodes([{ id: 2 }]);
  expect(graph.isBalancedSeparator()).toBe(true);
});

// test('selected nodes that separate grid graph should return true', () => {
//   const graph = new Graph([
//     '1-2',
//     '2-3',
//     '3-6',
//     '6-9',
//     '9-8',
//     '8-7',
//     '7-4',
//     '4-5',
//     '5-8',
//     '5-6',
//     '5-2',
//     '4-1',
//   ]);
//   graph.setSelectedNodes([{ id: 4 }, { id: 5 }, { id: 6 }]);
//   expect(graph.isBalancedSeparator()).toBe(true);
// });
