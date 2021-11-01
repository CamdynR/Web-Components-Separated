// script.js

window.addEventListener('DOMContentLoaded', init);

function init() {
  const root = document.querySelector('#root');
  for (let i = 0; i < 3; i++) {
    const dc = document.createElement('demo-component');
    dc.props = {
      title: 'Demo Component',
      body: 'This is the demo body'
    };
    root.appendChild(dc);
  }
}