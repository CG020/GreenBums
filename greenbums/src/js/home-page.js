import { SplashScreen } from '@capacitor/splash-screen';
import { Camera } from '@capacitor/camera';

window.customElements.define(
  'home-page',
  class extends HTMLElement {
    constructor() {
      super();

      SplashScreen.hide();

      const root = this.attachShadow({ mode: 'open' });

      root.innerHTML = `
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
        font-size: 1.2em
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
        <h1>Navigation Bar - TBD</h1>
      </menu-bar>
      <main>
        <h1>
          GreenBums
        </h1>
        <p class="intro">
          your helpful gardening tool
        </p>

        <br>
        <p>
          here we can add the catalog, a today's plant duties section thing, maybe a hint to weather forecast, etc
        </p>
      </main>
    </div>
    `;
    }
  }
);

window.customElements.define(
  'menu-bar',
  class extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
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
);