# GraphWidth.com

![](readmeimg.png)

> In graph theory, the treewidth of an undirected graph is a number associated with the graph. Treewidth may be defined in several equivalent ways: from the size of the largest vertex set in a tree decomposition of the graph, from the size of the largest clique in a chordal completion of the graph - Wikipedia

[GraphWidth.com](http://www.graphwidth.com/) is a full-stack application aimed at anyone with an interest in graph width measures and their applications. The teaching is done through short & precise interactive lectures. Along with a 
'sandbox mode' for those who wish to explore the concepts without guidance.

## Chapters

- [x] Chapter 1 - Graph Separators
- [x] Chapter 2 - Treewidth & Tree Decompositions
- [x] Chapter 3 - Nice Tree Decompositions
- [x] Chapter 4 - Algorithms on Tree Decompositions
- [ ] Chapter x - Clique-width

## Build your own chapter

You can build your own chapter and make use of [GraphWidth.com](http://www.graphwidth.com/)'s library to visualize your content.

To do so:
- First follow the installation to get the app installed and running
- Open `public/Chapters/content.txt`
- Enter your content and the functionality you want and rerun the application
- You can now see your custom content under chapter 5 'Misc'

### Commands
```
#p This is a paragraph. It may include math notation X^2 X_i etc...
```

## Attributions
- [D3.js](https://d3js.org/)
- [KaTeX](https://katex.org/)
- [Icons8](https://icons8.com/)
- [Force In A Box](https://github.com/john-guerra/forceInABox)
- [Material Icons](https://material.io/resources/icons/?style=baseline)


## Requirements
- Java 8 or later
- Node 10 or later

## Install

Clone the repository:  
```bash
git clone https://github.com/FrederikJorgensen/graph-width-visualizer.git
```  
Change directory into the repository:  
```bash
cd graph-width-visualizer
```
Install the development tools:  
```bash
npm install
```    
Run the application:  
```bash
npm run dev
```

The app is then running at: 
[http://localhost:3000/index.html](http://localhost:3000/index.html)