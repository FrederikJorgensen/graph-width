const fs = require('fs');

function writeGraphFile(graph) {
  const newg = graph
    .replace('{', '')
    .replace('"', '')
    .replace('"', '')
    .replace(':', '')
    .replace('}', '')
    .replace('"', '')
    .replace('"', '');
  const newestg = JSON.parse(newg);
  const numberOfEdges = newestg.length;
  const vertices = new Set();

  newestg.forEach((link) => {
    vertices.add(link[0]);
    vertices.add(link[1]);
  });

  const array = Array.from(vertices);

  let largest = 0;

  for (let i = 0; i <= largest; i++) {
    if (array[i] > largest) {
      largest = array[i];
    }
  }
  const numberOfVertices = largest;

  let newstring = '';
  newstring += `p tw ${numberOfVertices} ${numberOfEdges}\n`;
  newestg.forEach((v) => {
    newstring += `${v.join(' ')}\n`;
  });

  fs.writeFile('src/graph.gr', newstring, (err) => {
    if (err) return console.log(err);
  });
}

module.exports = {
  writeGraphFile,
};
