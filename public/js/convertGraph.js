const graphInput = document.getElementById("graph-input");
graphInput.addEventListener("change", readSingleFile, false);

function readSingleFile(evt) {
  //Retrieve the first (and only!) File from the FileList object

  var f = evt.target.files[0];
  let edges = [];

  var r = new FileReader();
  r.onload = function(e) {
    var lines = this.result.split("\n");
    var list = [];
    for (var line = 0; line < lines.length; line++) {
      let textLine = lines[line];
      if (textLine.startsWith("c") || textLine.startsWith("p")) {
        continue;
      } else {
        list.push(textLine[0]);
        list.push(textLine[2]);
        edges.push({ source: textLine[0], target: textLine[2] });
      }
    }

    let sortedList = [...new Set(list)];

    let finalList = [];
    for (i = 0; i < sortedList.length; i++) {
      finalList.push({ id: sortedList[i] });
    }

    let verticesAsString = JSON.stringify(finalList);
    let edgesAsString = JSON.stringify(edges);
    let nodes = '"nodes"' + ": " + verticesAsString;
    let links = '"links"' + ": " + edgesAsString;
    let finalGraph = "{" + nodes + "," + links + "}";

    $.ajax({
      url: "/buildGraph",
      type: "POST",
      data: finalGraph,
      contentType: "application/json",
      processData: false,
      success: function(data) {
        console.log(data);
      },
      complete: function(data) {
        reloadGraph("data/graph.json");
      }
    });
  };
  r.readAsText(f);
  // location.reload();
}
