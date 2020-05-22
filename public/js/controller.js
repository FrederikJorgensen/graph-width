/* eslint-disable import/prefer-default-export */
/* eslint-disable space-infix-ops */
/* eslint-disable no-undef */
/* eslint-disable dot-notation */

/* eslint-disable space-infix-ops */
/* eslint-disable quote-props */

import SpeechBubble from './SpeechBubble.js';
import * as separator from './graph-separator/graph.js';

/* $('#td-content').hide();
$('.algorithms-content').hide();
$('#right-container').hide();
$('.seperator-content').hide();
$('.nice-td-content').hide();
$('.max-independent-set-content').hide();
$('.three-color-content').hide();
$('.exercise-1-content').hide();
$('.exercise-2-content').hide();
$('.exercise-3-content').hide();
$('#exercise-2-hint-content').hide();
$('#exercise-3-hint-content').hide();
$('.tree-width-container').hide();
$('#tw-content').hide();
$('#tree-decomposition-content').hide();
$('#graph-container').hide();
$('#td-container').hide();
$('.center-container').hide(); */

/* Enable first exercise */

// seperator.toggleExercise1();

const sb = new SpeechBubble();
sb.add();
sb.setPosition(100, 100);


function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitSpaceBarClicked() {
  return new Promise();
}

function readKey() {
  return new Promise((resolve) => {
    window.addEventListener('keypress', resolve, { once: true });
  });
}

export async function goNextExercise(currentExercise) {
  let i = 0;
  i++;


  let query = window.location.search;
  query = query.substr(1);

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
  // const graphHeight = document.getElementById('flex-container').offsetHeight;
  // const graphWidth = document.getElementById('flex-container').offsetWidth;
  document.title = `${currentChapter['content-title']} - Graph Width Visualizer`;
  $('#content-title').html(currentChapter['content-title']);

  const h = $('#left-container').height() - 150;
  $('.theory-content').css('max-height', `${h}px`);

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
    main.append('div').attr('class', 'button-container');

    d3.select('.button-container').append('div').attr('class', 'buttons');
    d3.select('.buttons').append('a').attr('href', '/').append('div')
      .attr('class', 'btn')
      .text('Back');
    d3.select('.buttons').append('a').attr('href', currentChapter.next).append('div')
      .attr('class', 'btn')
      .text('Next');

    separator.toggleExercise1();
    await sb.say('Before we explore treewidth there is one concept that we must familiarize ourselves with. That is the concept of graph separators.');
    separator.main();
    await timeout(2000);
    await sb.say('We say that a set S is a <strong>graph separator</strong> if the removal of that set from the graph leaves the graph into multiple connected components. <br/><br/>Can you find one or multiple vertices that would separate the graph into different components? <br/> <br/> Click on a vertex to include it into the separator set.');
  }


  if (query === 'tree-width') {
    $('.graph-controls').hide();
    $('#td-container').hide();
    $('#td-content').show();
    d3.select('#graph-container').style('height', '100%');
  }

  if (query === 'tree-decomposition') {
    $('#tree-decomposition-content').show();
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

function computeTreeDecomposition() {
  removeTreeDecomposition();
  removeNiceTreeDecomposition();

  let json = JSON.stringify(graph.getAllEdges());
  json += `-${graph.getLargestNode()}`;

  $.ajax({
    url: '/compute',
    type: 'POST',
    data: json,
    processData: false,
    dataType: 'json',
    // data: JSON.stringify(edges),
    success() {
      // console.log(data);
    },
    complete() {
      isTreeDecompositionComputed = true;


      const treeDecompositionPath = 'td.td';
      readLocalTreeFile(treeDecompositionPath, 'treeDecomposition');
      handleComputeNiceTree();
    },
  });
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
