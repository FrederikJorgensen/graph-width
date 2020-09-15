function createHtmlForMisIterative(node, maxSetIncl, maxSetExcl) {
  if ('children' in node === false) {
    return `
    <table class="hamiltonianTable">
    <thead>
      <tr>
        <td></td>
        <td>MIS</td>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>Leaf</td>
        <td>1</td>
      </tr>
    </tbody>
  </table>`;
  }
  return `
    <table class="hamiltonianTable">
      <thead>
        <tr>
          <td>MIS</td>
          <td></td>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>Max set incl.</td>
          <td>${maxSetIncl}</td>
        </tr>

        <tr>
          <td>Max set excl.</td>
          <td>${maxSetExcl}</td>
        </tr>
      </tbody>
    </table>
    `;
}

export default function misiterative() {
  let i = 0;
  this.root.eachAfter((currentNode) => {
    i++;
    if (this.currentNodeIndex !== i) return;
    const node = currentNode.data;

    if ('children' in node === false) {
      node.largestSet = 1;
    }

    let maxSetExcl = 0;

    if (node.children.length === 1) {
      maxSetExcl = node.children[0].largestSet;
    }

    if (node.children.length === 2) {
      maxSetExcl = node.children[0].largestSet + node.children[1].largestSet;
    }

    let maxSetIncl = 1;

    if (node.children[0] !== undefined && 'children' in node.children[0]) {
      const left = node.children[0].children[0].largestSet;
      let right = 0;
      if (node.children[0].children.length === 2) right = node.children[0].children[1].largestSet;
      maxSetIncl += left + right;
    }

    if (node.children[1] !== undefined && 'children' in node.children[1]) {
      const left = node.children[1].children[0].largestSet;
      let right = 0;
      if (node.children[1].children.length === 2) right = node.children[1].children[1].largestSet;

      maxSetIncl += left + right;
    }
    node.largestSet = Math.max(maxSetExcl, maxSetIncl);
    const misIterativeTableHtmlString = createHtmlForMisIterative(node);
    this.moveTableArrow(node);
    this.moveTable(misIterativeTableHtmlString);
  });
}
