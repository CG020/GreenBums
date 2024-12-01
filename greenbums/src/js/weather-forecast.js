import { Camera, CameraResultType } from '@capacitor/camera';

class WeatherForecast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.THRESHOLDS = {
      HIGH_TEMP: 95,
      LOW_TEMP: 32,
      HIGH_PRECIP: 0.5
    };
  }

  connectedCallback() {
    this.render();
    this.fetchWeather();
  }

  /**
   *  this is the API's weather forecast fetcher, right now the set up is in a grid format for two
   * weeks - it displays a couple thinsg from the API days like condition and temperature, though temperature is not
   * rendering correctly so I will have to keep debugging that
   * 
   * i put the icons in the days, and the styling is very basic but the component is now rendering and the fetching
   * is working with the request
   */

  async fetchWeather() {
    try {
      const response = await fetch('http://api.weatherapi.com/v1/forecast.json?key=f72a3e77844c49ea81701230241011&q=Tucson&days=14');
      const data = await response.json();
      this.analyzeWeatherData(data);
      this.renderWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      this.shadowRoot.querySelector('.weather-card').innerHTML += `<p>Error fetching data</p>`;
    }
  }

  analyzeWeatherData(data) {
    data.forecast.forecastday.forEach(day => {
      const warnings = [];
      
      if (day.day.maxtemp_f >= this.THRESHOLDS.HIGH_TEMP) {
        warnings.push({
          type: 'INTENSE_SUN',
          title: 'High Temperature Warning',
          description: 'Intense sun and heat - consider reducing watering frequency.',
          icon: '☀️'
        });
      }
      
      if (day.day.mintemp_f <= this.THRESHOLDS.LOW_TEMP) {
        warnings.push({
          type: 'FROST_RISK',
          title: 'Frost Risk Warning',
          description: 'Cold temperatures expected - protect sensitive plants.',
          icon: '❄️'
        });
      }
      
      if (day.day.precip_in >= this.THRESHOLDS.HIGH_PRECIP) {
        warnings.push({
          type: 'HEAVY_RAIN',
          title: 'Heavy Rain Warning',
          description: 'Significant rainfall expected - adjust outdoor watering.',
          icon: '🌧️'
        });
      }

      if (warnings.length > 0) {
        this.dispatchWarnings(warnings, day.date);
      }
    });
  }

  // might want to include precipitation number <p class="temp">Precipitation: ${day.day.precip_in}in</p>	
  renderWeatherData(data) {
    const forecast = data.forecast.forecastday.map(day => `
      <div class="forecast-day">
        <p class="date">${new Date(day.date).toDateString()}</p>
        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="weather-icon">
        <p class="condition">${day.day.condition.text}</p>
        <p class="temp">High: ${day.day.maxtemp_f}°F / Low: ${day.day.mintemp_f}°F</p>
      </div>
    `).join('');

    this.shadowRoot.querySelector('.weather-card').innerHTML = `
      <h2>Weather Forecast (${data.location.name})</h2>
      <div class="forecast-container">
        ${forecast}
      </div>
    `;
  }

  dispatchWarnings(warnings, date) {
    const event = new CustomEvent('weatherWarning', {
      bubbles: true,
      composed: true,
      detail: {
        date: date,
        warnings: warnings
      }
    });
    this.dispatchEvent(event);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .weather-card {
          background-color: #D0FEFF;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          transition: all 0.3s ease;
        }
        .weather-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        h2 {
          text-align: center;
          color: #333;
          font-family: cursive;
        }
        .forecast-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        .forecast-day {
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 10px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .date {
          font-weight: bold;
          font-size: 0.9em;
          color: #333;
        }
        .weather-icon {
          width: 50px;
          height: 50px;
          margin-top: 5px;
        }
        .condition {
          font-weight: bold;
          font-size: 0.9em;
          color: #555;
        }
        .temp {
          font-size: 0.8em;
          color: #777;
          margin-top: 5px;
        }
      </style>

      <div class="weather-card">
        <h2>Weather Forecast</h2>
        <p>Loading forecast...</p>
      </div>
    `;
  }
}

customElements.define('weather-forecast', WeatherForecast);
