// home-page.js
import { SplashScreen } from '@capacitor/splash-screen';
import { Camera, CameraResultType } from '@capacitor/camera';
import './menu-bar.js'; 
import './plant-catalog.js';

class HomePage extends HTMLElement {
  constructor() {
    super();
    SplashScreen.hide();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @font-face {
          font-family: 'Alexenia';
          src: url('/assets/fonts/Alexenia-d9JwX.ttf') format('truetype');
          font-weight: normal;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        :host {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Alexenia";
          display: block;
          width: 100%;
          height: 100%;
        }
        h1, h2, h3, h4, h5 {
          text-transform: uppercase;
        }
        main {
          padding: 15px;
        }
        main hr { height: 1px; background-color: #eee; border: 0; }
        main h1 {
          color: #65BF65;
          text-align: center;
          font-family: 'Alexenia', cursive, sans-serif;
          font-size: 4.5em;
          letter-spacing: 1px;
          animation: float 3s ease-in-out infinite;
        }
        main p {
          text-align: center;
          font-size: 1.2em;
          color: #FFFFFF;
        }
        .intro {
          font-family: 'Alexenia', cursive, sans-serif;
        }
        main pre {
          white-space: pre-line;
        }
        .catalog-card {
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .catalog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .catalog-photo, .catalog-notes {
          margin-top: 10px;
          padding: 10px;
          border: 1px dashed #ccc;
          border-radius: 8px;
          cursor: pointer;
        }
        .catalog-photo img {
          max-width: 100%;
          height: auto;
        }
      </style>

      <div>
        <menu-bar>
          <h1>Navigation Bar - will jump to different sections </h1>
        </menu-bar>
        <main>
          <h1>GreenBums</h1>
          <p class="intro">your helpful gardening tool</p>
          <br>
          <p>here we can add the catalog, a today's plant duties section thing, maybe a hint to weather forecast, etc</p>
          
          <br>
          <plant-catalog></plant-catalog>
        </main>
      </div>
    `;
  }
}

customElements.define('home-page', HomePage);