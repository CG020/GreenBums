import { SplashScreen } from '@capacitor/splash-screen';
import { Camera, CameraResultType } from '@capacitor/camera';
import './menu-bar.js'; 
import './plant-catalog.js';
import './watering-sched.js';
import './weather-forecast.js';
import './plant-model.js';


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

  setupEventListeners() {
    const menuBar = this.shadowRoot.querySelector('menu-bar');
    menuBar.addEventListener('navigationClick', (e) => {
      const sectionId = e.detail.section;
      const section = this.shadowRoot.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  connectComponents() {
    const plantCatalog = this.shadowRoot.querySelector('plant-catalog');
    const wateringSched = this.shadowRoot.querySelector('watering-sched');

    if (plantCatalog && wateringSched) {
      plantCatalog.wateringSchedule = wateringSched;

      plantCatalog.addEventListener('scheduleWatering', (event) => {
        const { plantName, startDate, repeat, notes } = event.detail;
        wateringSched.addWateringSchedule({
          plantName,
          startDate,
          repeat,
          notes
        });
      });
    }
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
          scroll-behavior: smooth;
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
        section {
          scroll-margin-top: 20px; 
          min-width: 80vh;
          padding: 70px 0;
        }
      </style>

      <div>
        <menu-bar>
          <h1>GreenBums</h1>
        </menu-bar>
        <main>
          <section id="home">
            <h1>GreenBums</h1>
            <p class="intro">your helpful gardening tool</p>
          </section>
          
          <section id="catalog">
            <plant-catalog></plant-catalog>
          </section>

          <section id="watering">
            <watering-sched></watering-sched>
          </section>

          <section id="weather">
            <weather-forecast></weather-forecast>
          </section>

          <section id="model">
            <plant-model></plant-model>
          </section>
        </main>
      </div>
    `;
  }
}

customElements.define('home-page', HomePage);