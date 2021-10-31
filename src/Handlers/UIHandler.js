export default class UIHandler {
  createCenterContainer() {
    this.centerContainer = d3
      .select('#main')
      .append('div')
      .attr('id', 'center-container');
  }

  createVisualContainer() {
    this.visualContainer = d3
      .select('#app-area')
      .append('div')
      .attr('id', 'container');
  }

  createAppAreaContainer() {
    this.appAreaContainer = d3
      .select('#center-container')
      .append('div')
      .attr('id', 'app-area');
  }

  createContentContainer() {
    this.contentContainer = d3
      .select('#center-container')
      .append('div')
      .attr('class', 'content-container');
  }

  createContent() {
    this.content = this.contentContainer.append('div');
  }

  removeContainers() {
    if (this.content) this.content.remove();
    if (this.appAreaContainer) this.appAreaContainer.remove();
    if (this.visualContainer) this.visualContainer.remove();
    if (this.centerContainer) this.centerContainer.remove();
  }

  setupContainers() {
    this.createCenterContainer();
    this.createContentContainer();
    this.createContent();
    this.createAppAreaContainer();
    this.createVisualContainer();
  }
}
