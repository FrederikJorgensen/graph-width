/* eslint-disable import/prefer-default-export */
/* eslint-disable space-infix-ops */
/* eslint-disable no-undef */
/* eslint-disable dot-notation */

/* eslint-disable space-infix-ops */
/* eslint-disable quote-props */

import SpeechBubble from './SpeechBubble.js';
import * as separator from './graph-separator/graph.js';
import * as tdGraph from './tree-width/graph.js';
import readLocalTreeFile from './tree-width/readTree.js';
import * as treeWidthIntro from './tree-width-intro/tree-width-intro.js';
import loadTreeDecomposition from './tree-width/tree-decomposition.js';


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


function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readKey() {
  return new Promise((resolve) => {
    window.addEventListener('keypress', resolve, { once: true });
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

/* d3.select('.button-container').append('div').attr('class', 'buttons');
d3.select('.buttons').append('a').attr('href', currentChapter.back).append('div')
  .attr('class', 'btn')
  .text('Back');
d3.select('.buttons').append('a').attr('href', currentChapter.next).append('div')
  .attr('class', 'btn')
  .text('Next');
 */
async function loadContent(query) {
  const currentChapter = contentData[query];
  document.title = `${currentChapter['content-title']}`;
  if (currentChapter.previous) $('.previous').attr('href', currentChapter.previous);
  if (currentChapter.next) $('.next').attr('href', currentChapter.next);

  // load app styling
  $('head').append(
    `<link href="js/${query}/${currentChapter.style}" rel="stylesheet">`,
  );

  /* Get all script needed to run this chapter */
  let stringBuilder = '';
  currentChapter.scripts.forEach((script) => {
    stringBuilder += `<script type="module" src="js/${query}/${script}"></script>`;
  });

  /* Load all the scripts within the body */
  $('body').append(stringBuilder);

  const main = d3.select('.main');

  // main.append('div').attr('class', 'button-container');

  let sb;

  const width = document.getElementById('main').offsetWidth;
  const height = document.getElementById('main').offsetHeight;

  if (query !== 'home') {
    sb = new SpeechBubble();
    sb.add(width/2, height/2);
  }

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

  if (query === 'tree-width-intro') {
    d3.select('#main')
      .append('div')
      .attr('id', 'box')
      .append('div')
      .attr('id', 'tw-intro');

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
    treeWidthIntro.loadGraph1();
    await readKey();
    await sb.say('Lets take a look at another graph. Now this graph contains many cycles but if we remove some vertices we could also easily turn this into a tree.');
    treeWidthIntro.clearGraph();
    treeWidthIntro.loadGraph2();
    await readKey();
    treeWidthIntro.clearGraph();
    sb.setPosition(sb.xPercentage, sb.yPercentage + 350);
    await sb.say('Hmm.. We cant really tell how easy it is turn a graph into a tree just by looking at it seems.');
    await readKey();
    await sb.say('Why should we care about treewidth then? <br/> <br/> Well we know that many problems which are considered hard to execute on graphs are a lot easier to execute on trees. <br/><br/> Which means if we can turn a given graph into a tree we can essentially compute the same problem on that tree of the graph. We will discuss this further in Chapter 3...');
    await readKey();
    sb.setPosition(sb.xPercentage, sb.yPercentage - 350);
    await sb.say('First let us consider a classic graph problem: <strong>Maximum Indpendent Set</strong>. <br/><br/> Recall that a maximum independent set is the largest possible size of an independent set of a graph.');
    treeWidthIntro.loadRandomGraph();
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

  if (query === 'nice-tree-decomposition') {
    $('.nice-td-content').show();
    $('#right-container').show();
    d3.select('#middle-container').style('flex', '.40');
    d3.select('#right-container').style('flex', '.30');
  }

  if (query === 'algorithms') {
    $('#right-container').show();
    d3.select('#middle-container').style('flex', '.40');
    d3.select('#right-container').style('flex', '.30');
    $('.algorithms-content').show();
    d3.select('#graph-container').style('height', '100%');
    d3.select('#graph-svg').style('height', `${graphHeight}px`);
    d3.select('#graph-svg').style('width', `${graphWidth}px`);
    $('#td-container').hide();
  }

  if (query === 'max-independent-set') {
    $('#right-container').show();
    d3.select('#graph-container').style('height', '100%');
    d3.select('#graph-svg').style('height', `${graphHeight}px`);
    d3.select('#graph-svg').style('width', `${graphWidth}px`);
    d3.select('#middle-container').style('flex', '.40');
    d3.select('#right-container').style('flex', '.30');
    $('#td-container').hide();
    $('.max-independent-set-content').show();
  }

  if (query === 'three-color') {
    $('#right-container').show();
    d3.select('#graph-container').style('height', '100%');
    d3.select('#middle-container').style('flex', '.40');
    d3.select('#right-container').style('flex', '.30');
    $('#td-container').hide();
    $('.three-color-content').show();
  }
}

$(document).ready(() => {
  let query = window.location.search;
  query = query.substr(1);

  const home = 'home';

  if (contentData.hasOwnProperty(query)) {
    loadContent(query);
  } else {
    loadContent(home);
  }
});

/* let isTreeDecompositionComputed = false;
let isNiceTreeeDecompositionComputed = true;

function incrementVerticesCounter() {
  let value = parseInt(document.getElementById('number-of-vertices').innerHTML, 10);
  value = Number.isNaN(value) ? 0 : value;
  value++;
  console.log(value);
  document.getElementById('number-of-vertices').innerHTML = value;
}

function decrementVerticesCounter() {
  let value = parseInt(document.getElementById('number-of-vertices').innerHTML, 10);
  value = Number.isNaN(value) ? 0 : value;
  if (value > 0) {
    value--;
  }
  document.getElementById('number-of-vertices').innerHTML = value;
}

function incrementEdgesCounter() {
  let value = parseInt(document.getElementById('number-of-edges').innerHTML, 10);
  value = Number.isNaN(value) ? 0 : value;
  value++;
  document.getElementById('number-of-edges').innerHTML = value;
}

function decrementEdgesCounter() {
  let value = parseInt(document.getElementById('number-of-edges').innerHTML, 10);
  value = Number.isNaN(value) ? 0 : value;
  if (value > 0) {
    value--;
  }
  document.getElementById('number-of-edges').innerHTML = value;
}

function removeTreeDecomposition() {
  d3.select('#td-svg').selectAll('g').remove();
}

function removeNiceTreeDecomposition() {
  d3.select('#nice-td-svg').selectAll('g').remove();
}


function handleComputeNiceTree() {
  if (!isTreeDecompositionComputed) {
    computeTreeDecomposition();
    $('#nice-tree-error-message').show();
    return;
  }
  isNiceTreeeDecompositionComputed = true;
  d3.select('#nice-td-svg').selectAll('g').remove();
  const niceTreeDecompositionPath = 'nicetd.td';
  readLocalTreeFile(niceTreeDecompositionPath, 'niceTreeDecomposition');
}

function handleStartDraw() {
  d3.selectAll('circle').classed('highlighted-node', false);
  d3.selectAll('line').classed('highlighted-link', false);
  d3.selectAll('g').selectAll('text').classed('highlighted-text', false);
  d3.selectAll('circle').style('stroke', 'black');
  $('#app-content').show();
  d3.select('#nice-td-svg').selectAll('g').remove();
  graph.startDraw();
}

function handleThreeColor() {
  $('#three-color-content').show();
  ntd.threeColor();
}

function handleMis() {
  if (!isNiceTreeeDecompositionComputed) {
    $('#algorithm-error-message').show();
    return;
  }

  $('#mis-content').show();
  $('#control-keys').show();
  ntd.mis();
}

// https://www.w3schools.com/howto/howto_css_modals.asp
// Get the modal
const modal = document.getElementById('myModal');

// Get the button that opens the modal
const btn = document.getElementById('myBtn');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};


const verticesLeftArrow = $('#vertices-decrement');
const verticesRightArrow = $('#vertices-increment');
verticesLeftArrow.click('click', decrementVerticesCounter);
verticesRightArrow.click('click', incrementVerticesCounter);

const edgesLeftArrow = $('#edges-decrement');
const edgesRightArrow = $('#edges-increment');
edgesLeftArrow.click('click', decrementEdgesCounter);
edgesRightArrow.click('click', incrementEdgesCounter);

document
  .getElementById('tree-decomposition-button')
  .addEventListener('click', computeTreeDecomposition);

/* document
  .getElementById('random-graph-button')
  .addEventListener('click', reload); */

/* document
  .getElementById('reset-draw-graph')
  .addEventListener('click', handleStartDraw);

document
  .addEventListener('contextmenu', (event) => event.preventDefault());

document
  .getElementById('nice-tree-decomposition-button')
  .addEventListener('click', handleComputeNiceTree);

document
  .getElementById('max-independent-set-button')
  .addEventListener('click', handleMis);

document
  .getElementById('three-color-button')
  .addEventListener('click', handleThreeColor);
 */
