export const graph1 = {
  nodes: [
    { id: 0 }, // a
    { id: 1 }, // a
    { id: 2 }, // b
    { id: 3 }, // c
    { id: 4 }, // d
    { id: 5 }, // e
    { id: 6 }, // f
    { id: 7 }, // g
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 2, target: 4 },
    { source: 3, target: 5 },
    { source: 3, target: 6 },
    { source: 4, target: 6 },
    { source: 4, target: 7 },
    { source: 6, target: 7 },
    { source: 5, target: 6 },
  ],
};

export const exampleGraph = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 }],
  links: [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    { source: 1, target: 5 },
    { source: 1, target: 6 },
    { source: 1, target: 7 },
    { source: 1, target: 8 },
    { source: 1, target: 9 },
    { source: 1, target: 10 },
    { source: 5, target: 8 },
    { source: 8, target: 3 },
    { source: 3, target: 6 },
    { source: 6, target: 9 },
    { source: 9, target: 4 },
    { source: 4, target: 7 },
    { source: 7, target: 2 },
    { source: 2, target: 10 },
    { source: 10, target: 5 },
  ],
};


export const exampleGraph2 = {
  nodes: [{ id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 }],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 5, target: 1 },
    { source: 1, target: 6 },
    { source: 2, target: 7 },
    { source: 3, target: 8 },
    { source: 4, target: 9 },
    { source: 5, target: 10 },
    { source: 3, target: 1 },
  ],
};

export const exampleGraph3 = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
  ],
  links:
    [
      { source: 1, target: 2 },
      { source: 3, target: 1 },
      { source: 7, target: 5 },
      { source: 5, target: 2 },
      { source: 8, target: 6 },
      { source: 6, target: 4 },
      { source: 6, target: 3 },
      { source: 4, target: 3 },
      { source: 4, target: 9 },
    ],
};

export const exampleGraph4 = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 2, target: 3 },
    { source: 2, target: 4 },
    { source: 4, target: 3 },
  ],
};

export const gridGraph = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 4, target: 5 },
    { source: 5, target: 6 },
    { source: 7, target: 8 },
    { source: 8, target: 9 },
    { source: 1, target: 4 },
    { source: 4, target: 7 },
    { source: 2, target: 5 },
    { source: 5, target: 8 },
    { source: 3, target: 6 },
    { source: 6, target: 9 },
  ],
};

export const cliqueGraph = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    { source: 1, target: 5 },
    { source: 2, target: 3 },
    { source: 2, target: 4 },
    { source: 2, target: 5 },
    { source: 3, target: 4 },
    { source: 3, target: 5 },
    { source: 4, target: 5 },
  ],
};

export const treeGraph = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 4 },
    { source: 4, target: 5 },
    { source: 4, target: 6 },
  ],
};

export const planarGraph = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 4 },
    { source: 4, target: 5 },
    { source: 5, target: 1 },
  ],
};

export const expanderGraph = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 2, target: 4 },
    { source: 2, target: 10 },
    { source: 2, target: 4 },
    { source: 3, target: 4 },
    { source: 3, target: 6 },
    { source: 4, target: 10 },
    { source: 4, target: 5 },
    { source: 4, target: 7 },
    { source: 5, target: 1 },
    { source: 5, target: 7 },
    { source: 6, target: 8 },
    { source: 6, target: 9 },
    { source: 7, target: 8 },
    { source: 7, target: 9 },
    { source: 8, target: 9 },
    { source: 8, target: 10 },
    { source: 9, target: 10 },
  ],

};

export const cycleGraph = {
  nodes: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 4 },
    { source: 4, target: 5 },
    { source: 5, target: 1 },
  ],
};

export const hamTD = {
  id: 6,
  label: '',
  vertices: [],
  liss: 0,
  children: [
    {
      id: 1,
      label: '1',
      vertices: [
        1,
      ],
      liss: 0,
      children: [
        {
          id: 2,
          label: '1,2',
          vertices: [
            1,
            2,
          ],
          liss: 0,
          children: [
            {
              id: 10,
              label: '1,2,5',
              vertices: [
                1,
                2,
                5,
              ],
              liss: 0,
              children: [
                {
                  id: 3,
                  label: '2,5',
                  vertices: [
                    2,
                    5,
                  ],
                  liss: 0,
                  children: [
                    {
                      id: 8,
                      label: '2,3,5',
                      vertices: [
                        2,
                        3,
                        5,
                      ],
                      liss: 0,
                      children: [
                        {
                          id: 7,
                          label: '3,5',
                          vertices: [
                            3,
                            5,
                          ],
                          liss: 0,
                          children: [
                            {
                              id: 5,
                              label: '3,4,5',
                              vertices: [
                                3,
                                4,
                                5,
                              ],
                              liss: 0,
                              children: [
                                {
                                  id: 11,
                                  label: '4,5',
                                  vertices: [
                                    4,
                                    5,
                                  ],
                                  liss: 0,
                                  children: [
                                    {
                                      id: 9,
                                      label: '5',
                                      vertices: [
                                        5,
                                      ],
                                      liss: 0,
                                      children: [
                                        {
                                          id: 4,
                                          label: '',
                                          vertices: [],
                                          liss: 0,
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
