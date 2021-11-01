// DemoComponent.js

class DemoComponent extends HTMLElement {
  constructor() {
    super();
    // this.markupStr = `<!-- DemoComponent.html -->

    // <div class="wrapper">
    //   <header>
    //     <h2>{title}</h2>
    //   </header>
    //   <p>{body}</p>
    // </div>`;
    // this.styleStr = `/* DemoComponent.css */

    // * {
    //   font-family: sans-serif;
    // }
    
    // .wrapper {
    //   background-color: gray;
    //   border-radius: 5px;
    //   height: 300px;
    //   width: 500px;
    // }`;
    this.attachShadow({mode: 'open'});
    // this.shadowRoot.innerHTML += `<style>${this.styleStr}</style>`;
  }

  // set props(props) {
  //   const propNames = Object.keys(props);
  //   propNames.forEach(propName => {
  //     while (this.markupStr.search(`{${propName}}`) != -1) {
  //       this.markupStr = this.markupStr.replace(`{${propName}}`, props[propName]);
  //     }
  //   });
  //   this.shadowRoot.innerHTML += this.markupStr;
  // }
}

customElements.define('demo-component', DemoComponent);