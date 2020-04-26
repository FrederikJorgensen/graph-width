import * as graphFactory from './graphFactory.js';

const a = 97;
const charArray = {};
for (let i = 0; i < 26; i++) charArray[String.fromCharCode(a + i)] = i + 1;
const charArray2 = {};
for (let i = 0; i < 26; i++) charArray2[i + 1] = String.fromCharCode(a + i);

export default function newReadGraphFile(file) {
  const f = event.target.files[0];
  const r = new FileReader();
  const newGraph = {};
  const nodes = [];
  const links = [];
  r.onload = function onLoad() {
    const lines = this.result.split('\n');
    lines.shift();

    const filtered = lines.filter((el) => el !== '');

    function nodeExists(node) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === node) return true;
      }
      return false;
    }

    for (let i = 0; i < filtered.length; i++) {
      const textLine = lines[i];
      const splitted = textLine.split(' ');
      if (!textLine.startsWith('c')) {
        let firstNode;
        let secondNode;
        let firstNodeLabel;
        let secondNodeLabel;

        if (Number.isNaN(splitted[0].trim())) {
          firstNode = charArray[firstNodeLabel];
          secondNode = charArray[secondNodeLabel];
          firstNodeLabel = splitted[0].trim();
          secondNodeLabel = splitted[1].trim();
        } else {
          firstNode = parseInt(splitted[0], 10);
          secondNode = parseInt(splitted[1], 10);
          firstNodeLabel = splitted[0];
          secondNodeLabel = splitted[1];
        }

        if (!nodeExists(firstNode)) {
          nodes.push({ id: firstNode, label: firstNodeLabel });
        }

        if (!nodeExists(secondNode)) {
          nodes.push({ id: secondNode, label: secondNodeLabel });
        }

        links.push({ source: firstNode, target: secondNode });
      }
    }
    newGraph.nodes = nodes;
    newGraph.links = links;
    graphFactory.loadGraph(newGraph, '#graphSvg');
  };
  r.readAsText(f);
}
