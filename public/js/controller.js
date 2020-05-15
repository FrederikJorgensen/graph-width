/* eslint-disable space-infix-ops */
/* eslint-disable no-undef */
/* eslint-disable dot-notation */
function loadContent(query) {
  const currentChapter = contentData[query];

  if (query=== 'treewidth') $('#td-content').show();
  if (query=== 'seperator') $('.seperator-content').show();
  if (query=== 'nice-tree-decomposition') {
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
  }

  if (query === 'max-independent-set') {
    $('#right-container').show();
    d3.select('#middle-container').style('flex', '.40');
    d3.select('#right-container').style('flex', '.30');
    $('.max-independent-set-content').show();
  }

  if (query === 'three-color') {
    $('#right-container').show();
    d3.select('#middle-container').style('flex', '.40');
    d3.select('#right-container').style('flex', '.30');
    $('.three-color-content').show();
  }

  document.title = `${currentChapter['content-title']} - Graph Width Visualizer`;
  //   $('#theory-content').html(currentChapter['theory-content']);
  $('#content-title').html(currentChapter['content-title']);

  if (currentChapter.previous) $('.previous').attr('href', currentChapter.previous);
  if (currentChapter.next) $('.next').attr('href', currentChapter.next);
}


$(document).ready(() => {
  let query = window.location.search;
  query = query.substr(1);

  const home = 'treewidth';

  if (contentData.hasOwnProperty(query)) {
    loadContent(query);
  } else {
    loadContent(home);
  }

  katex.render('G(V,E)', one, {
    throwOnError: false,
  });

  katex.render('T(B,E)', treeMath, {
    throwOnError: false,
  });

  katex.render('v \\subseteq V', bags, {
    throwOnError: false,
  });

  katex.render('b', b, {
    throwOnError: false,
  });


  katex.render('v', v, {
    throwOnError: false,
  });

  katex.render('G(V,E)', graph2, {
    throwOnError: false,
  });

  katex.render('T', tree2, {
    throwOnError: false,
  });

  katex.render('e', edge, {
    throwOnError: false,
  });
  katex.render('G', g1, {
    throwOnError: false,
  });

  katex.render('e', edge2, {
    throwOnError: false,
  });


  katex.render('b_1', b1, {
    throwOnError: false,
  });
  katex.render('b_2', b2, {
    throwOnError: false,
  });
  katex.render('b_3', b3, {
    throwOnError: false,
  });

  katex.render('T', t3, {
    throwOnError: false,
  });

  katex.render('b_2', b22, {
    throwOnError: false,
  });

  katex.render('b_1', b12, {
    throwOnError: false,
  });

  katex.render('b_3', b32, {
    throwOnError: false,
  });

  katex.render('b_2', b23, {
    throwOnError: false,
  });

  katex.render('b_1', b13, {
    throwOnError: false,
  });

  katex.render('b_3', b33, {
    throwOnError: false,
  });

  katex.render('G', graph3, {
    throwOnError: false,
  });
});

function removeContent() {
  $('#td-content').hide();
}

$('.next').click(removeContent());
$('.previous').click(removeContent());
