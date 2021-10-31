//@ts-ignore
import Graph from '../Components/Graph.js';

interface Node {
  id: number;
}

interface Link {
  source: number;
  target: number;
}

interface Section {
  title: string;
  content: string;
  graph: {
    nodes: Node[];
    links: Link[];
  };
}

export default class NewSectionHandler {
  sections: Section[];
  currentSectionNumber: number;
  currentSection?: Section;
  content?: string;

  constructor() {
    this.sections = [];
    this.currentSectionNumber = 0;
    // window.sectionHandler = this;
  }

  async getData() {
    await fetch('../src/data.json')
      .then((response) => response.json())
      .then((json) => {
        console.log(json.sections);
        this.sections = json.sections;
      });
  }

  setContent(text: string) {
    this.content = text;
  }

  async createSection() {
    // this.currentSectionNumber = this.sections.indexOf(this.currentSection) + 1;
    // this.removeContainers();
    // this.setupContainers();
    // this.setContent(this.currentSection.content);
    // this.currentSection.isActive = true;
    // const section = this.sections[this.currentSectionNumber];
    const graph = new Graph('container');
    graph.load(this.currentSection?.graph);
    // await this.currentSection.create();
  }

  async goPreviousSection() {
    // if (this.currentSectionNumber - 1 === 0) return;
    // this.currentSectionNumber--;
    // this.currentSection = this.sections[this.currentSectionNumber - 1];
    await this.createSection();
  }

  async goNextSection() {
    if (this.currentSectionNumber - 1 === this.sections.length - 1) return;
    this.currentSectionNumber++;
    this.currentSection = this.sections[this.currentSectionNumber - 1];
    await this.createSection();
  }

  goToSection(sectionNumber: number) {
    this.currentSection = this.sections[sectionNumber];
    this.createSection();
  }
}
