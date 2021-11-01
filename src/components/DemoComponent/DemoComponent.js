// DemoComponent.js

class DemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
}

customElements.define('demo-component', DemoComponent);