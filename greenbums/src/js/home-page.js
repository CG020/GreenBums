// home-page.js
import { SplashScreen } from '@capacitor/splash-screen';
import { Camera, CameraResultType } from '@capacitor/camera';
import './menu-bar.js'; 
import './plant-catalog.js';
import './watering-sched.js';

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
      </style>

      <div>
        <menu-bar>
          <h1>Navigation Bar - will jump to different sections </h1>
        </menu-bar>
        <main>
          <h1>GreenBums</h1>
          <p class="intro">your helpful gardening tool</p>
          <br>
          <p>home page will contain catalog, calendar + watering schedule tasks and weekly view,
           weather forecast and tips, image identifier option
          </p>
          
          <br>
          <plant-catalog></plant-catalog>
          <br> <br> 
          <watering-sched></watering-sched>
          <br> <br> 
          <p> weather forecasting component here <p>
          <weather-forecast></weather-forecast>

        </main>
      </div>
    `;
  }
}

customElements.define('home-page', HomePage);