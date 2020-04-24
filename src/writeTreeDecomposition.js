const fs = require('fs');

function writeTreeDecompositionFile(data) {
  const treeDecompositionFile = fs.createWriteStream('public/td.td');
  const splitted = data.split('\n');
  const treeArray = [];

  for (let i = 0; i < splitted.length; i++) {
    if (splitted[i].startsWith('ntd')) break;
    splitted[i] = splitted[i].replace('\r', '');
    treeArray.push(splitted[i]);
  }

  treeArray.shift();
  treeArray.shift();

  for (let i = 0; i < treeArray.length; i++) {
    treeDecompositionFile.write(`${treeArray[i]}\n`);
  }

  treeDecompositionFile.end();
}

function writeNiceTreeDecomposition(data) {
  const niceTreeDecompositionFile = fs.createWriteStream('public/nicetd.td');
  const splitted = data.split('\n');

  let reachedNiceTD = false;
  const niceTreeArray = [];

  for (let i = 0; i < splitted.length; i++) {
    if (splitted[i].startsWith('ntd')) reachedNiceTD = true;
    if (reachedNiceTD) {
      splitted[i] = splitted[i].replace('\r', '');
      niceTreeArray.push(splitted[i]);
    }
  }
  niceTreeArray.shift();
  niceTreeArray.shift();

  for (let i = 0; i < niceTreeArray.length; i++) {
    niceTreeDecompositionFile.write(`${niceTreeArray[i]}\n`);
  }
  niceTreeDecompositionFile.end();
}

module.exports = {
  writeTreeDecompositionFile, writeNiceTreeDecomposition,
};
