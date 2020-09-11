/* eslint-disable import/prefer-default-export */
export const contextMenu = function (d) {
  return [
    {
      title: 'Insert Child Node',
      action(elm, d, i) {
        const value = prompt('Value:');
        const splitted = value.split(',');
        const temp = [];
        splitted.forEach((vertix) => {
          const v = parseInt(vertix, 10);
          temp.push(v);
        });
        d.tree.addNode(d, value, temp);
      },
    },
    {
      title: 'Delete Node',
      action(elm, d, i) {
        d.tree.removeNode(d);
      },
    },
    {
      title: 'Set Value',
      action(elm, d, i) {
        const number = prompt('Value:');
        d.data.label = number;

        const splitted = number.split(',');
        const temp = [];
        splitted.forEach((vertix) => {
          const v = parseInt(vertix, 10);
          temp.push(v);
        });
        d.data.vertices = temp;
        d.tree.restart();
      },
    },
  ];
};
