import { deepClone, isMapInArray } from '../Utilities/helpers.js'

const colorArray = ['red', 'green', 'blue']

function createStatesJoinNodeThreeColor (tree) {
  const newStates = []
  const { child } = tree
  const child1States = child.states
  const { child2 } = tree
  const child2States = child2.states

  if (child1States.length < child2States.length) {
    for (const childState of child1States) {
      if (isMapInArray(childState, child2States)) newStates.push(childState)
    }
  } else {
    for (const childState of child2States) {
      if (isMapInArray(childState, child1States)) newStates.push(childState)
    }
  }
  return newStates
}

function createThreeColorTableHtmlString (node) {
  const header = '<thead><tr><td><i>c</i></td></tr></thead>'

  let rowString = ''
  const { states } = node

  for (const state of states) {
    const vertices = [...state.keys()]
    let mapString = ''
    for (const vertex of vertices) {
      const color = state.get(vertex)
      mapString += `${vertex} → <span class="${color}">${color}</span><br/>`
    }
    rowString += `<tr><td>${mapString}</td></tr>`
  }
  return `<table class="hamiltonianTable">${header}${rowString}</table>`
}

function createStatesForForgetNodeThreeColor (childStates, tree) {
  const newStates = []
  const duplicateTracker = []

  for (const childState of childStates) {
    childState.delete(tree.forgottenVertex)
    const stateString = JSON.stringify([...childState])

    if (!duplicateTracker.includes(stateString)) {
      duplicateTracker.push(stateString)
      newStates.push(childState)
    }
  }
  return newStates
}

function createStatesIntroduceNodeAboveLeafThreeColor (tree) {
  const newStates = []
  for (const color of colorArray) {
    const colorMap = new Map()
    colorMap.set(tree.introducedVertex, color)
    newStates.push(colorMap)
  }
  return newStates
}

function createStatesIntroduceNodeThreeColor (childsStates, tree) {
  const newStates = []

  for (const childState of childsStates) {
    for (const color of colorArray) {
      const cs = deepClone(childState)
      cs.set(tree.introducedVertex, color)
      if (!tree.graph.checkIfIntroducedVertex(cs, tree.subTree)) {
        newStates.push(cs)
      }
    }
  }
  return newStates
}

export default function threeColorable (tree) {
  let i = 0
  tree.root.eachAfter((currentNode) => {
    if (tree.currentNodeIndex !== ++i) return
    const node = currentNode.data
    tree.setNodeType(node)
    tree.setSubTree(tree.root, node)
    const inducedSubgraph = tree.graph.createSubgraph(tree.subTree)
    tree.graph.highlightSubGraph(inducedSubgraph)
    tree.dpTable = {}
    tree.graph.resetNodeColors()

    let childStates
    if ('children' in node) {
      tree.setChild(node)
      childStates = tree.child.states
    }

    switch (tree.nodeType) {
      case 'leaf':
        tree.graph.hideTooltip()
        tree.graph.hideArrow()
        tree.graph.hideHull()
        node.states = [[]]
        break
      case 'introduce':
        tree.setIntroducedVertex(node)
        tree.graph.addNodeArrow(tree.introducedVertex, 'Introduced vertex')
        tree.graph.highlightNodeColor(tree.introducedVertex, 'rgb(128, 177, 211)')
        if (tree.child.vertices.length === 0) {
          node.states = createStatesIntroduceNodeAboveLeafThreeColor(tree)
        } else {
          node.states = createStatesIntroduceNodeThreeColor(childStates, tree)
        }
        break
      case 'forget':
        tree.setForgottenVertex(node)
        tree.graph.addNodeArrow(tree.forgottenVertex, 'Forgotten vertex')
        tree.graph.highlightNodeColor(tree.forgottenVertex, 'rgb(251, 128, 114)')
        node.states = createStatesForForgetNodeThreeColor(childStates, tree)
        break
      case 'join':
        tree.setChild(node)
        tree.setChild2(node)
        node.states = createStatesJoinNodeThreeColor(tree)
        break
      default:
        break
    }
    const threeColorTableHtmlString = createThreeColorTableHtmlString(node)
    tree.moveTableArrow(node)
    tree.moveTable(threeColorTableHtmlString)
  })
}
