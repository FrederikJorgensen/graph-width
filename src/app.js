/* eslint linebreak-style: ["error", "windows"] */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const writeGraph = require('./writeGraph.js');
const writeTreeDecomposition = require('./writeTreeDecomposition.js');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileupload());
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/compute', (req, res) => {
  const graph = JSON.stringify(req.body);
  writeGraph.writeGraphFile(graph);
  const command = 'cd src && java -jar src.jar graph.gr';
  const child = require('child_process').exec(command);
  let treeInput = '';
  child.stdout.on('data', (data) => {
    treeInput += data.toString();
  });
  child.on('exit', () => {
    writeTreeDecomposition.writeTreeDecompositionFile(treeInput);
    writeTreeDecomposition.writeNiceTreeDecomposition(treeInput);
    res.send({ success: true });
  });
});

app.listen(PORT);
