/* eslint linebreak-style: ["error", "windows"] */
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
// const child = require('child_process');


app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(fileupload());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.use(express.static(path.join(__dirname, 'public')));


app.post('/upload', (req, res) => {
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
