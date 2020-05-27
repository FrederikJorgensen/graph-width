export default {
  home: {
    title: 'Home',
    scripts: ['home.js'],
    style: 'home.css',
    next: '?tree-width-intro',
  },
  'tree-width-intro': {
    title: 'Intro',
    scripts: ['tree-width-intro.js'],
    folder: '01-tree-width-intro',
    style: 'tree-width-intro.css',
    back: '/',
    next: '?graph-separator',
  },
  'graph-separator': {
    title: 'Graph Separator',
    scripts: ['graph.js'],
    style: 'graph.css',
    back: '?tree-width-intro',
    next: '?tree-width',
  },
  'tree-width': {
    'content-title': 'Treewidth',
    scripts: ['graph.js', 'tree-decomposition.js'],
    back: '?graph-separator',
    next: '?tree-decomposition',
  },
  'tree-decomposition': {
    'content-title': 'Tree Decompositions',
    scripts: ['graph.js', 'tree-decomposition.js'],
    back: '?tree-width',
    next: 'tba',
  },
  'nice-tree-decomposition': {
    'content-title': 'Nice Tree Decomposition',
    scripts: ['graph.js', 'tree-decomposition.js', 'nice-tree-decomposition.js'],
    back: '?tree-width',
    next: '?algorithms',
  },
  algorithms: {
    'content-title': 'Algorithms on tree decomps....',
    scripts: ['tree.js'],
    back: '?nice-tree-decomposition',
    next: '?max-independent-set',
  },
  'max-independent-set': {
    'content-title': 'Max Independent Set',
    back: '?algorithms',
    next: '?three-color',
  },
  'three-color': {
    'content-title': '3-Coloring',
    back: '?max-independent-set',
  },
};
