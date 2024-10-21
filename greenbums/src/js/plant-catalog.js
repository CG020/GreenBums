import { Camera, CameraResultType } from '@capacitor/camera';


/**
 * will need to implement a way to save the photos, remove photos,
 * scrolling feature or a way for the catalog to be collapsable
 */


class PlantCatalog extends HTMLElement {
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
        .catalog-card {
          background-color: #E5D5B8;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: center;
          max-width: 50%;
          margin-left: 50px;
          height: 200px;
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

      <div class="catalog-card">
        <h2>My Plant Catalog</h2>
        <div class="catalog-photo">Click to add photo</div>
        <div class="catalog-notes" contenteditable>Click to add notes about your plants...</div>
      </div>
    `;
  }

  setupEventListeners() {
    const photoDiv = this.shadowRoot.querySelector('.catalog-photo');
    photoDiv.addEventListener('click', () => this.takePicture());
  }

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });
      
      if (image.webPath) {
        const photoDiv = this.shadowRoot.querySelector('.catalog-photo');
        photoDiv.innerHTML = `<img src="${image.webPath}" alt="Plant photo">`;
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }
}

customElements.define('plant-catalog', PlantCatalog);