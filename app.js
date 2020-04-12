/* eslint linebreak-style: ["error", "windows"] */
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(fileupload());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

function writeGraphFile(graph) {
  const file = fs.createWriteStream('./uploads/graph.gr');
  const newg = graph.replace('{', '').replace('"', '').replace('"', '').replace(':', '')
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
  const numberOfVertices = vertices.size;
  file.on('error', (err) => { console.log(err); });
  file.write(`p tw ${numberOfVertices} ${numberOfEdges}\n`);
  newestg.forEach((v) => { file.write(`${v.join(' ')}\n`); });
  file.end();
}

app.post('/compute', (req, res) => {
  const graph = JSON.stringify(req.body);
  writeGraphFile(graph);
  const command = 'bash scriptsample.sh graph.gr tree.td';
  const child = require('child_process').exec(command);
  child.stdout.pipe(process.stdout);
  child.on('exit', () => {
    res.send({ success: true });
  });
});

app.post('/upload', (req, res) => {
  console.log('IT WORKED LOL ');
  if (req.files) {
    const file = req.files.myFile;
    const filename = file.name;
    const treename = filename.replace('.gr', '');

    const command = `bash scriptsample.sh ${filename} ${treename}.td`;

    const child = require('child_process').exec(command);
    child.stdout.pipe(process.stdout);
    child.on('exit', () => {
      console.log('DONE!');
      file.mv(`./uploads/${filename}`, (err) => {
        if (err) {
          res.send({ success: false });
        } else {
          res.send({ success: true });
        }
      });
    });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
