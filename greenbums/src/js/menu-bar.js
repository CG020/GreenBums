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
          position: sticky;
          top: 0;
          z-index: 1000;
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
        .nav-container {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .nav-links {
          display: flex;
          gap: 15px;
          margin-right: 20px;
        }
        .nav-link {
          color: white;
          text-decoration: none;
          font-size: 0.9em;
          padding: 6px 12px;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.2);
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
      <div class="nav-container">
        <div class="nav-links">
          <a href="#home" class="nav-link" data-section="home">Home</a>
          <a href="#catalog" class="nav-link" data-section="catalog">Catalog</a>
          <a href="#watering" class="nav-link" data-section="watering">Watering</a>
          <a href="#weather" class="nav-link" data-section="weather">Weather</a>
        </div>
        <button class="logout-button">Logout</button>
      </div>
    `;
  }

  async saveExit() {
    try {
      const catalog = document.querySelector('plant-catalog');
      
      if (catalog) {
        console.log('Save catalog entries');
        await catalog.saveEntry();
      }

      console.log('Logging out...');
      sessionStorage.clear();

      document.body.innerHTML = '';
      const loginPage = document.createElement('login-page');
      document.body.appendChild(loginPage);
      
    } catch (error) {
      console.error('Error during logout:', error);
      sessionStorage.clear();
      document.body.innerHTML = '';
      const loginPage = document.createElement('login-page');
      document.body.appendChild(loginPage);
    }
  }

  setupEventListeners() {
    const logoutButton = this.shadowRoot.querySelector('.logout-button');
    logoutButton.addEventListener('click', async () => {
      await this.saveExit();
    });

    const navLinks = this.shadowRoot.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');
        this.dispatchEvent(new CustomEvent('navigationClick', {
          detail: { section },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

customElements.define('menu-bar', MenuBar);