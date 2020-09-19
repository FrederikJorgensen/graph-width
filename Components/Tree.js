import { deepClone } from '../Utilities/helpers.js'
import threeColorable from '../Algorithms/threeColorable.js'
import maxIndependentSet from '../Algorithms/maxIndependentSet.js'
import hamiltonianCycle from '../Algorithms/hamiltonianCycle.js'

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const myColor = d3.scaleOrdinal().domain(data).range(d3.schemeSet3)

function createTableX () {
  d3.select('#main')
    .append('div')
    .attr('class', 'table-wrapper')
    .attr('id', 'tableX')
}

function getLeftOfArrow () {
  return document
    .getElementById('tooltip-arrow')
    .getBoundingClientRect()
}

function getTopOfArrow () {
  return document
    .getElementById('tooltip-arrow')
    .getBoundingClientRect()
}

export default class Tree {
  constructor (container, type, graph) {
    this.container = container
    this.root = null
    this.currentNodeIndex = 0
    this.type = type
    this.graph = graph
    this.height = document.getElementById(container).offsetHeight
    this.width = document.getElementById(container).offsetWidth
  }

  setMisNormalTree () {
    this.isMisNormalTree = true
  }

  setGraph (graph) {
    this.graph = graph
  }

  setIntroducedVertex (node) {
    const { vertices } = node
    const childsVertices = node.children[0].vertices
    const difference = vertices.filter((x) => !childsVertices.includes(x))
    const introducedVertex = difference[0]
    this.introducedVertex = introducedVertex
  }

  setForgottenVertex (node) {
    const childsVertices = node.children[0].vertices
    const forgottenVertex = childsVertices.filter(
      (x) => !node.vertices.includes(x)
    )
    const f = forgottenVertex[0]
    this.forgottenVertex = f
  }

  setNodeType (node) {
    let nodeType = ''
    if ('children' in node === false) nodeType = 'leaf'
    else if (node.children.length === 2) nodeType = 'join'
    else if (node.vertices.length > node.children[0].vertices.length) nodeType = 'introduce'
    else if (node.vertices.length < node.children[0].vertices.length) nodeType = 'forget'
    this.nodeType = nodeType
  }

  setSubTree (rootOfSubtree, currentNode) {
    let subTree
    rootOfSubtree.each((d) => {
      if (d.data.id === currentNode.id) subTree = d.descendants()
    })
    this.subTree = subTree
  }

  setChild (node) {
    const child = node.children[0]
    const childClone = deepClone(child)
    this.child = childClone
  }

  setChild2 (node) {
    const child2 = node.children[1]
    const clone2 = deepClone(child2)
    this.child2 = clone2
  }

  setChildTable (node) {
    const child = node.children[0]
    const childClone = JSON.parse(JSON.stringify(child))
    const childTable = childClone.table
    this.childTable = childTable
  }

  setChildTable2 (node) {
    const child = node.children[1]
    const childClone = JSON.parse(JSON.stringify(child))
    const childTable = childClone.table
    this.childTable2 = childTable
  }

  enableMaximumIndependentSet () {
    this.isMis = true
  }

  enableThreeColor () {
    this.isColor = true
  }

  enableHamiltonianCycle () {
    this.isHamiltonianCycle = true
  }

  getSubTree (node) {
    return node.descendants()
  }

  getRoot () {
    return this.root
  }

  removeSvg () {
    if (this.svg) this.svg.remove()
  }

  moveTable (tableHTMLString) {
    if (!this.table) {
      createTableX()
      this.table = true
    }
    const { top } = getTopOfArrow()
    const { left } = getLeftOfArrow()

    d3.select('#tableX')
      .html(tableHTMLString)
      .style('left', `${left}px`)
      .style('top', `${top}px`)
  }

  moveTableArrow (node) {
    if (!this.arrow) this.addArrow()
    const nodeSvg = d3.select(`#treeNode-${node.id}`)
    const x = parseInt(nodeSvg.attr('x'), 10)
    let y = parseInt(nodeSvg.attr('y'), 10)
    const w = parseInt(nodeSvg.attr('width'), 10)

    const el = document.getElementById(`treeNode-${node.id}`)

    function getPos (ele) {
      const rect = ele.getBoundingClientRect()
      return rect.top
    }

    const ny = getPos(el)
    const maxHeight = this.height - ny
    d3.select('#tableX').style('max-height', `${maxHeight}px`)
    y += 12.5

    d3.select('#tooltip-arrow')
      .style('opacity', '1')
      .attr('x1', x - 45)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y)
      .attr('transform', `translate(${0}, ${30})`)
  }

  addArrow () {
    if (this.arrow) this.arrow.remove()
    this.arrow = this.svg
      .append('line')
      .attr('id', 'tooltip-arrow')
      .attr('x1', 200)
      .attr('y1', 100)
      .attr('x2', 300)
      .attr('y2', 100)
      .attr('marker-end', 'url(#Triangle)')
      .style('opacity', 0)
  }

  nextDPStep () {
    const numberOfNodes = this.root.descendants().length
    this.currentNodeIndex++
    if (this.currentNodeIndex !== numberOfNodes) this.currentNodeIndex %= numberOfNodes
    if (this.isMisNormalTree) this.misiterative(this)
    if (this.isMis) maxIndependentSet(this)
    if (this.isColor) threeColorable(this)
    if (this.isHamiltonianCycle) hamiltonianCycle(this)
  }

  previousDPStep () {
    if (this.currentNodeIndex === 0) return
    const N = this.root.descendants().length
    --this.currentNodeIndex
    this.currentNodeIndex %= N
    if (this.isMisNormalTree) this.misiterative(this)
    if (this.isMis) maxIndependentSet(this)
    if (this.isColor) threeColorable(this)
    if (this.isHamiltonianCycle) hamiltonianCycle(this)
  }

  createTreeLinks () {
    this.svg
      .selectAll('line')
      .data(this.root.links())
      .enter()
      .append('line')
      .attr('class', 'tree-link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .lower()
      .attr('transform', `translate(${0}, ${30})`)
  }

  createArrowMarker () {
    this.svg
      .append('marker')
      .attr('id', 'triangle')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 10)
      .attr('refY', 5)
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .style('fill', 'rgb(51, 51, 51)')
  }

  load (treeData) {
    if (this.svg) this.removeSvg()

    if (this.type === 'normal-tree') {
      this.width /= 2
      this.height /= 3
    }

    this.createSvg()
    const root = d3.hierarchy(treeData)
    this.root = root
    const treeLayout = d3.tree()
    treeLayout.size([this.width, this.height - 180])
    treeLayout(root)
    this.createArrowMarker()
    this.createTreeLinks()

    if (this.type === 'normal-tree') {
      this.createNormalNodesAndLinks()
    } else {
      this.createNodesAndLinks()
    }

    this.createLabels()
  }

  createLabels () {
    this.svg
      .selectAll('text')
      .data(this.root.descendants())
      .enter()
      .append('text')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('dy', () => {
        if (this.type === 'normal-tree') return '5px'
        return '17px'
      })
      .attr('class', () => {
        if (this.type === 'normal-tree') return 'label'
        return 'graph-label'
      })
      .text((d) => {
        if (this.type === 'normal-tree') return d.data.label
        if ('children' in d.data === false || d.data.children.length === 0) return
        if (d.data.children.length === 2) return `${d.data.label}`
        if (d.data.vertices.length > d.data.children[0].vertices.length) return `${d.data.label}`
        if (d.data.vertices.length < d.data.children[0].vertices.length) return `${d.data.label}`
        return d.data.label
      })
      .attr('transform', `translate(${0}, ${30})`)
  }

  createNodesAndLinks () {
    this.svg
      .selectAll('rect')
      .data(this.root.descendants())
      .enter()
      .append('rect')
      .attr('id', (d) => `treeNode-${d.data.id}`)
      .attr('width', (d) => {
        const splitted = d.data.label.split(',')
        return splitted.length * 18
      })
      .attr('height', 25)
      .attr('x', (d) => d.x - (d.data.label.split(',').length * 18) / 2)
      .attr('y', (d) => d.y)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('transform', `translate(${0}, ${30})`)
      .attr('class', 'tree-node')
      .style('fill', (d) => {
        if ('children' in d.data === false || d.data.children.length === 0) return myColor(9)
        if (d.data.children.length === 2) return myColor(6)
        if (d.data.vertices.length > d.data.children[0].vertices.length) return myColor(5)
        if (d.data.vertices.length < d.data.children[0].vertices.length) return myColor(4)
      })
  }

  createNormalNodesAndLinks () {
    this.svg
      .selectAll('circle')
      .data(this.root.descendants())
      .enter()
      .append('circle')
      .attr('id', (d) => `treeNode-${d.data.id}`)
      .attr('r', 18)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('class', 'normal-tree-node')
      .attr('transform', `translate(${0}, ${30})`)

    this.svg.selectAll('line').style('stroke', 'rgb(51, 51, 51)')
  }

  createSvg () {
    this.svg = d3
      .select(`#${this.container}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', '100%')
  }

  setAllNodes () {
    this.root.eachAfter((node) => {
      node.largestSet = 0
    })
  }

  createCustomAlgorithmHtmlTableString (table) {
    const keys = [...Object.keys(table)]

    let tableBody = ''

    for (const key of keys) {
      const value = table[key]
      tableBody += `
        <tr>
          <td>${key}</td>
          <td>${value}</td>
        </tr>`
    }

    const tableHeader = `
    <thead>
      <tr>
        <td>#1</td>
        <td>#2</td>
      </tr>
    </thead>`

    const tableHtmlString = `
      <table class="hamiltonianTable">
        ${tableHeader}
        ${tableBody}
      </table>`

    return tableHtmlString
  }
}
