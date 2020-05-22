const contentData = {
  home: {
    'content-title': 'Home',
    scripts: ['home.js'],
    style: 'home.css',
    next: '?graph-separator',
  },
  'graph-separator': {
    title: 'Graph Separator',
    content: String.raw`<div class="seperator-content"> <div>Before exploring treewidth and tree decompositions it is important to understand the concept of a graph separator (also known as a <a href="https://en.wikipedia.org/wiki/Vertex_separator" >vertex separator</a >). <br /> A subset \(S \subset V \) containing some vertices in the graph is a seperator if the removal of \( S \) cuts the graph into several connected components. Try to find a separator in the graph...`,
    scripts: ['graph.js'],
    style: 'graph.css',
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
