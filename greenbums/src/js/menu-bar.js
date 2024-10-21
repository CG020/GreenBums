class MenuBar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: relative;
            display: block;
            padding: 15px 15px 15px 15px;
            text-align: left;
            background-color: #9EAF9E;
          }
          ::slotted(h1) {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            font-size: 0.9em;
            font-weight: 600;
            color: #fff;
          }
        </style>
        <slot></slot>
      `;
    }
  }
  
  customElements.define('menu-bar', MenuBar);