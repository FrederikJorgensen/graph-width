/* eslint-disable import/prefer-default-export */
/* eslint-disable space-infix-ops */
/* eslint-disable no-undef */
/* eslint-disable dot-notation */

/* eslint-disable space-infix-ops */
/* eslint-disable quote-props */

import SpeechBubble from './components/SpeechBubble.js';
import * as separator from './chapters/02-graph-separator/graph.js';
import * as tdGraph from './chapters/03-tree-decomposition/graph.js';
import readLocalTreeFile from './chapters/03-tree-decomposition/readTree.js';
import * as treeWidthIntro from './chapters/01-tree-width-intro/tree-width-intro.js';
import contentData from './content.js';

export const width = document.getElementById('main').offsetWidth;
export const height = document.getElementById('main').offsetHeight;

function computeTreeDecomposition() {
  let json = JSON.stringify(tdGraph.getAllEdges());
  json += `-${tdGraph.getLargestNode()}`;

  $.ajax({
    url: '/compute',
    type: 'POST',
    data: json,
    processData: false,
    dataType: 'json',
    success() {
      // console.log(data);
    },
    complete() {
      const treeDecompositionPath = 'td.td';
      readLocalTreeFile(treeDecompositionPath, 'treeDecomposition');
    },
  });
}

export async function goNextExercise(currentExercise) {
  let query = window.location.search;
  query = query.substr(1);

  /*   const sb = new SpeechBubble();
  sb.add();
  sb.setPosition(100, 100); */

  if (query === 'graph-separator') {
    if (currentExercise === 1) {
      await sb.say('Nice you found a separator!');
      await readKey();
      separator.resetNodeStyling();
      separator.toggleExercise2();
      await sb.say('There are different kinds of separators. We will cover minimal separators next. A minimal separator set S is a separator in a graph if no proper subset of the set S also contains a separator. In other words if some graph has a separator set S = {A,B} then A on its own cannot separate the graph neither can B. <br/>Try to find a minimal separator in the graph.');
      const res = d3.select('.text-container').append('div').attr('id', 'exercise-result');
      d3.select('.text-container').style('height', '100%');
      const q = document.getElementById('exercise-result');
      renderMathInElement(q);
    }

    if (currentExercise === 2) {
      await sb.say('Great! You found a minimal separator in the graph!');
      separator.resetNodeStyling();
      separator.toggleExercise3();
      await readKey();
      await sb.say('Now try finding a balanced separator');
    }

    if (currentExercise === 3) {
      await sb.say('Awesome! You found a balanced separator in the graph! <br/><br/>You should now have a basic understanding of graph separators. In the coming chapters we are going to look at how tree decompositions exploit these separators in their graphs. Go to next chapter to continue learning :)');
      separator.resetNodeStyling();
      separator.toggleExercise3();
    }
  }
}

async function loadContent(query) {
  const currentChapter = contentData[query];
  document.title = `${currentChapter['content-title']}`;

  let stringBuilder = '';
  currentChapter.scripts.forEach((script) => {
    stringBuilder += `<script type="module" src="js/${currentChapter.folder}/${script}"></script>`;
  });

  d3.select('body').append('script').text(stringBuilder);

  const main = d3.select('.main');

  let sb;


  if (query === 'home') {
    const homeLogo = main.append('div').attr('class', 'home-title').append('h2');
    homeLogo.text('GraphWidth.com').style('opacity', 0);
    homeLogo.transition().duration(3000).style('opacity', 0.9);
    const homeCenterContainer = d3.select('.home-title').style('opacity', 0);

    homeCenterContainer.append('p').text('An interactive way to learn graph width measures.');
    d3.select('.home-title').append('a').attr('href', currentChapter.next).append('button')
      .text('Start Learning')
      .attr('class', 'btn');

    homeCenterContainer.transition().duration(3000).style('opacity', 0.9);
  }

  if (query === 'graph-separator') {
    separator.toggleExercise1();
    await sb.say('Before we explore treewidth there is one concept that we must familiarize ourselves with. That is the concept of graph separators.');
    separator.main();
    await timeout(2000);
    await sb.say('We say that a set S is a <strong>graph separator</strong> if the removal of that set from the graph leaves the graph into multiple connected components. <br/><br/>Can you find one or multiple vertices that would separate the graph into different components? <br/> <br/> Click on a vertex to include it into the separator set.');
  }

  if (query === 'tree-width') {
    main.classed('center-graph-td ', true);
    main.append('div').attr('id', 'graph-td');
    d3.select('#graph-td').append('div').attr('id', 'graph-container');
    d3.select('#graph-td').append('div').attr('id', 'tree-container');

    await sb.say('Recall that treewidth is a way to measure how "tree-like" a graph is. What that actually means is how easy is it to decompose that graph into a tree. This is where <strong>tree decomposisiotns</strong> become very useful.');
    await readKey();
    sb.setPosition(sb.xPercentage, sb.yPercentage - 350);
    await sb.say('Below you see a graph and one of its valid tree decompositions');
    tdGraph.main();
    computeTreeDecomposition();

    await readKey();
    await sb.say('We say that a tree decomposition is valid if it has the following 3 properties.');

    await readKey();
    await sb.say('Lets use the graph and tree decomposition below to proof that it is a valid tree decomposition.');

    await readKey();
    await sb.say('<strong>Property 1 (Node Coverage):</strong> Every vertex that appears in the graph must appear in some bag of the tree decomposition. <br/><br/>We will check every vertex in the graph and highlight the bag in the tree decompostion containing that vertex.');
    await tdGraph.testNodeCoverage();
    await sb.say('Since every vertex in the graph appears in some bag of the tree decomposition the first property of tree decomposition holds true.');

    await readKey();
    tdGraph.resetStyles();
    await sb.say('Property 2 <strong>(Edge coverage):</strong> For every edge that appears in the graph there is some bag in the tree decomposition which contains the vertices of both ends of the edge.<br/><br/> Lets check if this holds true for our graph and tree decomposition.');
    await tdGraph.edgeCoverage();
    await sb.say('great property 2 holds true as well!');
    await readKey();
    tdGraph.resetStyles();
    await sb.say('<strong>Property 3 (Coherence):</strong> Lets consider 3 bags of the tree decomposition b1, b2 and b3 that form a path in the tree decomposition. If a vertex from the graph belongs to b1 and b3 it must also belong to b2.');
    await readKey();

    tdGraph.main();
    computeTreeDecomposition();
    await readKey();

    main.append('svg')
      .attr('id', 'am')
      .style('position', 'absolute')
      .style('height', '40px')
      .style('bottom', '250px')
      .style('left', `${(width/2) + 80}px`);

    main.append('div')
      .style('height', '40px')
      .text('Forgotten Vertices = ')
      .style('position', 'absolute')
      .style('bottom', '250px')
      .style('left', `${(width/2) - 80}px`);

    sb.setPosition(sb.xPercentage - 700, sb.yPercentage + 200);
    await sb.say('We can test this property by traversing the tree decomposition in post-order and keeping track of forgotten vertices. <br/><br/> We say that a vertex in a bag is forgotten if the vertex appear in the leaf bag but not in its parents bag. Then all we do every time we hit a leaf is check if the leaf contains any of the forgotten vertices and if so we conclude the tree decomposition does not adhere to his property. But if the leaf does not contain a forgotten vertex we continue traversing and deleting the leaf from the tree after we have procesed it.');
    await tdGraph.dfs();
    await sb.say('It also satifies the 3rd property. We have now proofed that this is indeed a valid tree decomposition of the given graph.');
    await readKey();
    await sb.say('A graph can have multiple tree decompositions.');
    await readKey();
    sb.setPosition(sb.xPercentage, sb.yPercentage - 300);
    await sb.say('A trivial tree decomposition contains all the graph vertices in one bag.');
    tdGraph.main();
    const tri = tdGraph.createTrivialTreeDecomposition();
    tdGraph.loadAnyGraph(tri, 'tree-container');
    await readKey();
    await sb.say('The largest size of the bag is...');
    tdGraph.main();
    await readKey();
    computeTreeDecomposition();
    await readKey();
    sb.setPosition(sb.xPercentage, sb.yPercentage - 300);
    await sb.say('The treewidth of the tree decomposition is the largest bag - 1.');
    await readKey();
    await sb.say('What is the treewidth of the current tree decomposition?');
    sb.setPosition(200, 500);
    sb.addQuiz();
    sb.addChoice('1', false);
    sb.addChoice('2', true);
    sb.addChoice('3', false);
    sb.addSolution('The treewidth of a tree decomposition is the size of the largest bag - 1.');
  }
}

window.onload = () => {
  let query = window.location.search;
  query = query.substr(1);

  const home = 'home';

  if (contentData.hasOwnProperty(query)) {
    loadContent(query);
  } else {
    loadContent(home);
  }
};
