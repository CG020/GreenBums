import { Camera, CameraResultType } from '@capacitor/camera';


class WeatherForecast extends HTMLElement {
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
        .weather-card {
          background-color: #D0FEFF;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: center;
          max-width: 700px;
          margin: 0 auto;
          height: 200px;
        }
        .weather-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
      </style>

      <div class="weather-card">
        <h2>Weather Forecast</h2>

        <p> daily forecast <p>
      </div>
    `;
  }

}

customElements.define('weather-forecast', WeatherForecast);