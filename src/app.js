import express from 'express';
import { join } from 'path';
import bodyParser from 'body-parser';
import fileupload from 'express-fileupload';
import writeGraphFile from './writeGraph.js';
import {
  createTreeDecomposition,
  createNiceTreeDecomposition,
} from './writeTreeDecomposition.js';
import * as childProcess from 'child_process'; // ES6 Syntax
let exec = childProcess.exec;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileupload());
app.use(express.static(join('public', '../public')));
app.set('view engine', 'ejs');

app.get('/', (_, res) => {
  res.render('index');
});

function splitString(treeDecompositionString) {
  const textLines = treeDecompositionString.split('\n');
  const tdArray = [];

  for (const textLine of textLines) {
    if (textLine.startsWith('ntd')) break;
    if (textLine.startsWith('td')) continue;
    if (textLine.startsWith('s')) continue;
    tdArray.push(textLine);
  }

  return tdArray;
}

function getNiceTdString(string) {
  const splitted = string.split('\n');
  let reachedNiceTD = false;
  const niceTreeArray = [];

  for (const textLine of splitted) {
    if (textLine.startsWith('s')) continue;
    if (reachedNiceTD) niceTreeArray.push(textLine);
    if (textLine.startsWith('ntd')) reachedNiceTD = true;
  }
  return niceTreeArray;
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
let treeDecompositionString = '';

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      } else {
        treeDecompositionString += stdout;
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

app.post('/compute', async (req, res) => {
  const graph = JSON.stringify(req.body);
  writeGraphFile(graph);
  const command = 'cd src && java -jar src.jar graph.gr';
  await execShellCommand(command);
  const td = splitString(treeDecompositionString);
  const ntd = getNiceTdString(treeDecompositionString);
  const t = createTreeDecomposition(td);
  const nt = createNiceTreeDecomposition(ntd);
  res.send({ success: true, td: t, niceTreeDecomposition: nt });
});

app.listen(PORT);
