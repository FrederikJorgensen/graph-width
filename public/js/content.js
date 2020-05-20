const contentData = {
  home: {
    'content-title': 'Home',
    next: '?graph-separator',
  },
  'graph-separator': {
    'content-title': 'Graph Separator',
    scripts: ['graph.js'],
    previous: '?home',
    next: '?tree-width',
  },
  'tree-width': {
    'content-title': 'Treewidth',
    scripts: ['graph.js', 'tree-decomposition.js'],
    previous: '?graph-separator',
    next: '?tree-decomposition',
  },
  'tree-decomposition': {
    'content-title': 'Tree Decompositions',
    scripts: ['graph.js', 'tree-decomposition.js'],
    previous: '?tree-width',
    next: 'tba',
  },
  'nice-tree-decomposition': {
    'content-title': 'Nice Tree Decomposition',
    scripts: ['graph.js', 'tree-decomposition.js', 'nice-tree-decomposition.js'],
    previous: '?tree-width',
    next: '?algorithms',
  },
  algorithms: {
    'content-title': 'Algorithms on tree decomps....',
    scripts: ['tree.js'],
    previous: '?nice-tree-decomposition',
    next: '?max-independent-set',
  },
  'max-independent-set': {
    'content-title': 'Max Independent Set',
    previous: '?algorithms',
    next: '?three-color',
  },
  'three-color': {
    'content-title': '3-Coloring',
    previous: '?max-independent-set',
  },

};
