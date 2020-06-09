/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable no-alert */
/* eslint-disable no-var */
/* eslint-disable import/prefer-default-export */
export const contextMenu = function (d) {
  return [
    {
      title: 'Set Value',
      action(elm, d, i) {
        const number = prompt('Value:');
        d.label = number;

        const splitted = number.split(',');
        const temp = [];
        splitted.forEach((vertix) => {
          const v = parseInt(vertix, 10);
          temp.push(v);
        });
        d.vertices = temp;
        d.graph.restart();
      },
    },
    {
      title: 'Delete Bag',
      action(elm, d, i) {
        d.graph.removeNode(d);
      },
    },
  ];
};
