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
    this.location_city = 'Tucson';
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
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
        const cityName = encodeURIComponent(this.location_city);
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=f72a3e77844c49ea81701230241011&q=${cityName}&days=14`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        this.analyzeWeatherData(data);
        this.renderWeatherData(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        const weatherCard = this.shadowRoot.querySelector('.weather-card');
        const forecast = weatherCard.querySelector('.forecast-container');
        if (forecast) forecast.remove();
        
        weatherCard.innerHTML += `
            <p style="color: #ff4444; text-align: center; margin-top: 20px;">
                Unable to fetch weather data for "${this.location_city}". 
                Please check the city name and try again.
            </p>
        `;
    }
}
  
  setupEventListeners() {
    const locationForm = this.shadowRoot.querySelector('.location-form');
    locationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = this.shadowRoot.querySelector('.location-input');
        if (input.value.trim()) {
            this.location_city = input.value.trim();
            await this.fetchWeather();
            input.blur();
        }
    });
}

  analyzeWeatherData(data) {
    data.forecast.forecastday.forEach(day => {
      const warnings = [];
      
      if (day.day.maxtemp_f >= this.THRESHOLDS.HIGH_TEMP) {
        warnings.push({
          type: 'INTENSE_SUN',
          title: 'High Temperature Warning',
          description: 'Intense sun and heat - consider reducing watering volume.',
          icon: '☀️'
        });
      }
      
      if (day.day.mintemp_f <= this.THRESHOLDS.LOW_TEMP) {
        warnings.push({
          type: 'FROST_RISK',
          title: 'Frost Risk Warning',
          description: 'Cold temperatures expected - protect/cover sensitive plants.',
          icon: '❄️'
        });
      }
      
      if (day.day.precip_in >= this.THRESHOLDS.HIGH_PRECIP) {
        warnings.push({
          type: 'HEAVY_RAIN',
          title: 'Heavy Rain Warning',
          description: 'Significant rainfall expected - lessen outdoor watering.',
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
      <form class="location-form">
          <input 
            type="text" 
            class="location-input" 
            placeholder="Enter city name..." 
            aria-label="City name"
            required
          >
          <button type="submit" class="location-submit">Update</button>
      </form>
      <h2>Weather Forecast (${data.location.name})</h2>
      <div class="forecast-container">
        ${forecast}
      </div>
    `;

    this.setupEventListeners();
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
          position: relative;
        }
        
        .weather-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .location-form {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .location-input {
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        .location-input:focus {
          border-color: #65BF65;
        }

        .location-submit {
          background: #65BF65;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        .location-submit:hover {
          background: #4FA04F;
        }

        h2 {
          text-align: center;
          color: #333;
          font-family: cursive;
          margin-top: 40px; /* Make room for the location input */
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

        @media (max-width: 600px) {
          .location-form {
            position: relative;
            top: 0;
            right: 0;
            justify-content: center;
            margin-bottom: 20px;
          }
          
          h2 {
            margin-top: 20px;
          }
        }
      </style>

      <div class="weather-card">
        <form class="location-form">
          <input 
            type="text" 
            class="location-input" 
            placeholder="Enter city name..." 
            aria-label="City name"
            required
          >
          <button type="submit" class="location-submit">Update</button>
        </form>
        <h2>Weather Forecast</h2>
        <p>Loading forecast...</p>
      </div>
    `;
  }
}

customElements.define('weather-forecast', WeatherForecast);
