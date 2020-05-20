/* eslint-disable space-infix-ops */
/* eslint-disable no-undef */
/* eslint-disable dot-notation */

/* eslint-disable space-infix-ops */
/* eslint-disable quote-props */

$('#td-content').hide();
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

function loadContent(query) {
  const currentChapter = contentData[query];
  const graphHeight = document.getElementById('graph-container').offsetHeight;
  const graphWidth = document.getElementById('graph-container').offsetWidth;
  document.title = `${currentChapter['content-title']} - Graph Width Visualizer`;
  $('#content-title').html(currentChapter['content-title']);

  const h = $('#left-container').height() - 150;
  $('.theory-content').css('max-height', `${h}px`);

  if (currentChapter.previous) $('.previous').attr('href', currentChapter.previous);
  if (currentChapter.next) $('.next').attr('href', currentChapter.next);

  if (query === 'graph-separator') {
    $('.seperator-content').show();
    d3.select('#graph-container').style('height', '100%');
    $('#td-container').hide();
    $('#right-container').hide();
    $('.graph-controls').hide();
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

  /* Get all script needed to run this chapter */
  let stringBuilder = '';
  currentChapter.scripts.forEach((script) => {
    stringBuilder += `<script type="module" src="js/${query}/${script}"></script>`;
  });

  /* Load all the scripts within the body */
  $('body').append(stringBuilder);
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
