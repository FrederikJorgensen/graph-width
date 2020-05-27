/* eslint-disable quote-props */
/* eslint-disable quotes */
import Graph from '../../components/Graph.js';
import { readKey } from '../../helpers.js';
import SpeechBubble from '../../components/SpeechBubble.js';
import Button from '../../components/Button.js';
import Tree from '../../components/Tree.js';

function misButtonClicked() {
  const misButton = document.getElementById('mis-button');
  return new Promise((resolve) => {
    misButton.addEventListener('click', resolve, { once: true });
  });
}


async function loadContent() {
  const width = document.getElementById('main').offsetWidth;
  const height = document.getElementById('main').offsetHeight;

  const sb = new SpeechBubble();
  sb.add(width / 2, height / 2);

  const nodes1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];
  const links1 = [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 5, target: 1 },
    { source: 1, target: 6 },
    { source: 2, target: 7 },
    { source: 3, target: 8 },
    { source: 4, target: 9 },
    { source: 5, target: 10 },
    { source: 3, target: 1 },
  ];

  const nodes2 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];
  const links2 = [
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
  ];

  const graph2 = { nodes: nodes2, links: links2 };

  d3.select('#main')
    .append('div')
    .attr('id', 'box')
    .append('div')
    .attr('id', 'tw-intro');

  d3.select('#main')
    .append('div')
    .attr('id', 'graph-container')
    .style('position', 'absolute')
    .style('height', '100%')
    .style('width', '100%');

  await sb.say('Chapter 1: Introduction to Treewidth');
  await readKey();
  await sb.say('What does treewidth mean?');
  await readKey();
  await sb.say('The treewidth of a graph is a measure to see how "tree-like" a graph is.');
  await readKey();
  await sb.say('What does "tree-like" mean? Can we see if a graph is "tree-like" just by looking at it? Lets take a look at some graphs.');
  await readKey();
  sb.setPosition(sb.xPercentage, sb.yPercentage - 350);
  await sb.say('Can you tell if this graph is tree-like? <br/> <br/> We know that trees do not contain cycles and this graph has exactly 1 cycle. So it must be easy to turn this graph into a tree?');
  const g = new Graph();
  g.loadGraph({ nodes: nodes1, links: links1 }, 'graph-container');
  await readKey();
  await sb.say('Lets take a look at another graph. Now this graph contains many cycles but if we remove some vertices we could also easily turn this into a tree.');
  g.clear();
  g.loadGraph(graph2, 'graph-container');
  await readKey();
  g.clear();
  sb.setPosition(sb.xPercentage, sb.yPercentage + 350);
  await sb.say('Hmm.. We cant really tell how easy it is turn a graph into a tree just by looking at it seems.');
  await readKey();
  await sb.say('Why should we care about treewidth then? <br/> <br/> Well we know that many problems which are considered hard to execute on graphs are a lot easier to execute on trees. <br/><br/> Which means if we can turn a given graph into a tree we can essentially compute the same problem on that tree of the graph. We will discuss this further in Chapter 3...');
  await readKey();

  sb.setPosition(sb.xPercentage - 400, sb.yPercentage - 200);
  await sb.say('First let us consider a classic graph problem: <strong>Maximum Indpendent Set</strong>. <br/><br/> Recall that a maximum independent set is the largest possible size of an independent set of a graph.');
  const g2 = new Graph();
  g2.randomGraph();

  const b = new Button('Run Max Independent Set', () => g2.maximumIndependentSet(), 'mis-button');
  b.draw();
  await misButtonClicked();
  sb.addResult(`The algorithm you see here is a naive brute force
  algorithm that checks every subset of the graph and the running time is $$ O(2^n * n * (n-1)/2) $$
  As you can tell this algorithm is really slow as we check all subsets of the graph.
  <br/><br/>
  <div>Current Maximum Indepedent Set:</div>`);
  renderMathInElement(document.body);
  const skipForwardButton = new Button('Skip Forward', () => g2.changeMisAnimationSpeed(0), 'skip-forward-button');
  skipForwardButton.draw();
  await readKey();
  sb.clear();
  g2.clear();

  sb.setPosition((width / 2) + 500, sb.yPercentage);

  d3.select('#main')
    .append('div')
    .attr('id', 'tree-container')
    .style('position', 'absolute')
    .style('width', `${width / 5}px`)
    .style('height', `${height / 3}px`)
    .style('bottom', "50%")
    .style('left', "50%")
    .style('transform', "translate(-50%, 50%)");

  const tree = new Tree();

  const treeData = {
    "id": 1,
    "children": [
      {
        "id": 2,
        "children": [
          {
            "id": 5,
            "children": [{ "id": 10 }],
          },
          {
            "id": 7,
            "children": [
              { "id": 8 },
            ],
          },
        ],
      },
      {
        "id": 3,
        "children": [
          {
            "id": 4,
            "children": [
              { "id": 9 },
            ],
          },
          {
            "id": 6,
          },
        ],
      },
    ],
  };
  d3.select('#graph-container').remove();
  tree.load(treeData, 'tree-container');
  await sb.say(`Lets now look at how the <strong>Maximum Independent</strong> Set problem works on a tree.
  <br/><br/>
Using dynamic programming we can traverse the tree bottom-up and keep track of the 'state' of each node in the tree.
This way we are creating partial solutions throughout the algorithm, which is very efficient because we will only need to store and calculate very little data in each partial solution.
<br/><br/>
Try going through the algorithm step by step to see how it works.
  `);
  tree.setAllNodes();
  sb.addResult('The running time is \\( O(n) \\) as we only have to visit each tree node once.');
  renderMathInElement(document.body);
  const nextStepButton = new Button('Go next step', () => tree.nextStep(), 'next-step-button');
  nextStepButton.draw();
  const previousStepButton = new Button('Go previous step', () => tree.previousStep(), 'previous-step-button');
  previousStepButton.draw();
  await readKey();
  await sb.say(`As you just saw the same problem is vastly faster on a tree than a graph this is why treewidth is important.`);
}

loadContent();