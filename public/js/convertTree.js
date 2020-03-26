const treeInput = document.getElementById("tree-input");
treeInput.addEventListener("change", readSingleFile, false);

function readSingleFile(evt) {
  //Retrieve the first (and only!) File from the FileList object
  var f = evt.target.files[0];
  let edges = [];
  var r = new FileReader();
  r.onload = function(e) {
    var lines = this.result.split("\n");
    let point = [];
    let damn = {};
    let finalList = [];

    for (var line = 0; line < lines.length; line++) {
      let textLine = lines[line];
      if (textLine.startsWith("c") || textLine.startsWith("s")) {
        continue;
      } else if (textLine.startsWith("b")) {
        let id;
        let graphNodes = [];
        if (textLine[6] == null) {
          id = textLine[4];
          graphNodes.push(textLine[8]);
        } else if (textLine[8] == null) {
          id = textLine[4] + textLine[6];
          graphNodes.push(textLine[4]);
          graphNodes.push(textLine[6]);
        } else {
          id = textLine[4] + textLine[6] + textLine[8];
          graphNodes.push(textLine[4]);
          graphNodes.push(textLine[6]);
          graphNodes.push(textLine[8]);
        }

        finalList.push({ id: id, graphNodes: graphNodes });
        damn[textLine[2]] = id;
      } else {
        point.push({ firstNode: textLine[0], secondNode: textLine[2] });
      }
    }

    for (i = 0; i < point.length; i++) {
      let first = point[i].firstNode;
      let second = point[i].secondNode;
      edges.push({
        source: damn[first],
        target: damn[second]
      });
    }

    let verticesAsString = JSON.stringify(finalList);
    let edgesAsString = JSON.stringify(edges);
    let nodes = '"nodes"' + ": " + verticesAsString;
    let links = '"links"' + ": " + edgesAsString;
    let finalTree = "{" + nodes + "," + links + "}";

    $.ajax({
      url: "/buildTree",
      type: "POST",
      data: finalTree,
      contentType: "application/json",
      processData: false,
      success: function(data) {
        console.log(data);
      },
      complete: function(data) {
        reloadTree("data/tree.json");
      }
    });
  };
  r.readAsText(f);
}
