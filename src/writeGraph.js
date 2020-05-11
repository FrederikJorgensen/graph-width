const fs = require('fs');

function writeGraphFile(graph) {
  const trimmedGraph = graph
    .replace('{', '')
    .replace('"', '')
    .replace('"', '')
    .replace(':', '')
    .replace('}', '')
    .replace('"', '')
    .replace('"', '');

  const splitted = trimmedGraph.split('-');
  const numberOfVertices = splitted[1];
  const edges = JSON.parse(splitted[0]);
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

module.exports = {
  writeGraphFile,
};
