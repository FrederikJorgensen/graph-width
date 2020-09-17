import fs from 'fs';

export default function writeGraphFile(graph) {
  const trimmedGraph = graph
    .replace('edges', '')
    .replace('{', '')
    .replace('"', '')
    .replace('"', '')
    .replace(':', '')
    .replace('}', '')
    .replace('"', '')
    .replace('"', '');


  const splitted = trimmedGraph.split('largestNode');
  const numberOfVertices = splitted[1].replace(':', '');
  const edges = JSON.parse(splitted[0].replace(/,([^,]*)$/, ''));
  const numberOfEdges = edges.length;
  let newstring = '';

  newstring += `p tw ${numberOfVertices} ${numberOfEdges}\n`;
  edges.forEach((v) => {
    newstring += `${v.join(' ')}\n`;
  });

  fs.writeFile('src/graph.gr', newstring, (err) => {
    if (err) return console.log(err);
  });
}
