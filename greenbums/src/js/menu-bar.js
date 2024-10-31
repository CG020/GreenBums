class MenuBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #9EAF9E;
        }
        ::slotted(h1) {
          margin: 0;
          font-size: 0.9em;
          font-weight: 600;
          color: #fff;
        }
        .logout-button {
          background-color: #4A6741;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.9em;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .logout-button:hover {
          background-color: #3d563b;
        }
      </style>
      <slot></slot>
      <button class="logout-button">Logout</button>
    `;
  }

  setupEventListeners() {
    const logoutButton = this.shadowRoot.querySelector('.logout-button');
    logoutButton.addEventListener('click', () => {
      sessionStorage.clear();

      document.body.innerHTML = ''; // bott up back to login page
      const loginPage = document.createElement('login-page');
      document.body.appendChild(loginPage); 
    });
  }
}

customElements.define('menu-bar', MenuBar);
