/* eslint linebreak-style: ["error", "windows"] */
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(fileupload());
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');

function writeGraphFile(graph) {
  const file = fs.createWriteStream('src/graphs/graph.gr');
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
  file.on('error', (err) => {
    console.log(err);
  });
  file.write(`p tw ${numberOfVertices} ${numberOfEdges}\n`);
  newestg.forEach((v) => {
    file.write(`${v.join(' ')}\n`);
  });
  file.end();
}

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/compute', (req, res) => {
  const graph = JSON.stringify(req.body);
  writeGraphFile(graph);
  const command = 'cd src && bash runtreealgo.sh graph.gr tree.td';
  const child = require('child_process').exec(command);
  child.stdout.pipe(process.stdout);
  child.on('exit', () => {
    res.send({ success: true });
  });
});

app.listen(PORT);
