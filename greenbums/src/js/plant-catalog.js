import { Camera, CameraResultType } from '@capacitor/camera';

class PlantCatalog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
    this.entries = [{
      name: '',
      notes: '',
      photos: []
    }];

    this.apiURL = 'https://job1zh9fxh.execute-api.us-east-2.amazonaws.com/v1/user/catalog';
    this.userEmail = sessionStorage.getItem('userEmail');
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.loadEntries();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .catalog-container {
          position: relative;
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .catalog-container:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }

        .catalog-card {
          background-color: #E5D5B8;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin: 0 auto;
          height: auto;
          min-height: 400px;
        }

        .navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .arrows {
          background: #4A6741;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrows:disabled {
          background: #ccc;
        }

        .entry-counter {
          color: #666;
        }

        .plant-name {
          width: 95%;
          padding: 8px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
          height: 20px;
          }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .photo-container {
          position: relative;
          aspect-ratio: 1;
          background: #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .photo-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .delete-photo {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }

        .add-photo {
          background: #4A6741;
          color: white;
          border: none;
          border-radius: 8px;
          width: 100%;
          height: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .catalog-notes {
          width: 95%;
          min-height: 100px;
          padding: 8px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: vertical;
        }

        .add-entry {
          background: #4A6741;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          width: 100%;
          cursor: pointer;
        }
      </style>

      <div class="catalog-container">
        <div class="catalog-card">
          <div class="navigation">
            <button class="arrows prev-button" disabled>&larr;</button>
            <h1> My Plant Catalog</h1>
            <span class="entry-counter">1 of 1</span>
            <button class="arrows next-button" disabled>&rarr;</button>
          </div>

          <input type="text" class="plant-name" placeholder="Plant Name">

          <div class="photo-grid">
            <div class="photo-container">
              <button class="add-photo">+ Add Photo</button>
            </div>
          </div>

          <textarea class="catalog-notes" placeholder="Add notes about your plant..."></textarea>

          <button class="add-entry">+ Add New Entry</button>
        </div>
      </div>
    `;
  }

  // all interactions listened for here 
  setupEventListeners() {
    const addPhotoBtn = this.shadowRoot.querySelector('.add-photo');
    const addEntryBtn = this.shadowRoot.querySelector('.add-entry');
    const prevButton = this.shadowRoot.querySelector('.prev-button');
    const nextButton = this.shadowRoot.querySelector('.next-button');
    const plantName = this.shadowRoot.querySelector('.plant-name');
    const notes = this.shadowRoot.querySelector('.catalog-notes');

    addPhotoBtn.addEventListener('click', () => this.takePicture());
    addEntryBtn.addEventListener('click', () => this.addNewEntry());
    prevButton.addEventListener('click', () => this.navigate(-1));
    nextButton.addEventListener('click', () => this.navigate(1));
    
    plantName.addEventListener('input', (e) => this.updateEntry('name', e.target.value));
    notes.addEventListener('input', (e) => this.updateEntry('notes', e.target.value));
  }

  /* Entry Handlers -------------------------------------------------------- */

  addNewEntry() {
    this.entries.push({
      name: '',
      notes: '',
      photos: []
    });
    this.currentIndex = this.entries.length - 1;
    this.updateDisplay();
  }


  updateEntry(field, value) {
    this.entries[this.currentIndex][field] = value;
    this.saveEntry();
  }


  async deleteEntry() {
    try {
      const response = await fetch(
        `${this.apiURL}?email=${this.userEmail}`,
        {
          method: 'DELETE'
        }
      );

      if (response.ok) {
        console.log('Entry deleted successfully');
        await this.loadEntries();
      } else {
        console.error('Failed to delete entry:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }

  async saveEntry() {
    // get the index for the entry currently on
    const currentEntry = this.entries[this.currentIndex];

    try {
      alert(`Attempting to save entry for email: ${this.userEmail}`);

      // what is intending to be saved - should update with what the user entered 
      // in the session
      var payload = {
        email: String(this.userEmail),
        name: String(currentEntry.name || ''),
        notes: String(currentEntry.notes || ''),
        // photos: String(currentEntry.photos || [])
      };

      // should appear in an alert so we can see the additions
      alert(`Sending payload: ${JSON.stringify(payload, null, 2)}`);

      // new request
      var request = new Request("https://job1zh9fxh.execute-api.us-east-2.amazonaws.com/v1/user/catalog", {
      // const response = await fetch(this.apiURL, {
        method: "POST",
        // headers: {
        //   'Content-Type': 'application/json'
        // },
        body: JSON.stringify(payload),
      });

      // response success
      // const responseText = await response.text();
      var response = await fetch(request);
      var responseText = await response.text();
      alert(`Save response: Status ${response.status}, Body: ${responseText}`);

      if (response.status === 201) {
        alert('Entry saved successfully');
        return;
      } else {
        throw new Error(`Server returned ${response.status}: ${responseText}`);
      }

    } catch (error) {
      alert(`Error saving entry: ${error.message}`);
      throw error;
    }
}

  // TODO: fix this method up for the new string setup - and clean up the fetch
  async loadEntries() {
    try { // authentication step
      if (!this.userEmail) {
        alert('No user email found in session storage');
        return;
      }

      // using the url for request entries
      const url = `${this.apiURL}?email=${encodeURIComponent(this.userEmail)}&start=0`;
      alert(`Loading entries from: ${url}`);

      // the request to database
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      alert(`Response status: ${response.status}`);
      var responseText = await response.text();
      alert(`Raw response: ${responseText}`);
      
      // if nothing is in the catalog makes it empty
      if (response.status === 404) {
        alert("404: No entries found - initializing empty catalog");
        this.entries = [{
          name: '',
          // photos: [],
          notes: ''
        }];
        this.currentIndex = 0;
        this.updateDisplay();
        return;
      }
      
      // found an entry - has to load in now - cant seem to get this to trigger
      if (response.status === 200) {
        try {
          const data = JSON.parse(responseText);
          alert(`Parsed data: ${JSON.stringify(data, null, 2)}`);
          
          if (data) {
            const entriesArray = Array.isArray(data) ? data : Object.values(data);
            if (entriesArray.length > 0) {
              this.entries = entriesArray.map(entry => ({
                name: entry.name || '',
                notes: entry.notes || '',
                photos: Array.isArray(entry.photos) ? entry.photos : []
              }));
              alert(`Successfully loaded ${this.entries.length} entries`);
            } else {
              this.entries = [{
                name: '',
                // photos: [],
                notes: ''
              }];
            }
          }
          this.currentIndex = 0;
          this.updateDisplay();
        } catch (parseError) {
          alert(`Error parsing JSON: ${parseError.message}`);
        }
      }
    } catch (error) {
      alert(`Error in loadEntries: ${error.message}\nURL attempted: ${url}`);
      console.error('Full error:', error);
    }
}




  /* Interface Helpers ---------------------------------------------------- */


  // Camera is a capacitor api - used to access photo urls 
  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });
      
      if (image.webPath) {
        this.entries[this.currentIndex].photos.push(image.webPath);
        this.updatePhotoGrid();
        await this.saveEntry();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }


  updatePhotoGrid() {
    const photoGrid = this.shadowRoot.querySelector('.photo-grid');
    const currentPhotos = this.entries[this.currentIndex].photos;
    
    // this html will run and add the photo to the grid when one is selected
    let html = currentPhotos.map((photo, index) => `
      <div class="photo-container">
        <img src="${photo}" alt="Plant photo">
        <button class="delete-photo" data-index="${index}">×</button>
      </div>
    `).join('');

    // photo limit - i made it 6 but we can change this
    if (currentPhotos.length < 6) {
      html += `
        <div class="photo-container">
          <button class="add-photo">+ Add Photo</button>
        </div>
      `;
    }

    photoGrid.innerHTML = html;

    const addPhotoBtn = this.shadowRoot.querySelector('.add-photo');
    if (addPhotoBtn) {
      addPhotoBtn.addEventListener('click', () => this.takePicture());
    }

    // for each delete button placed on the photo, remove via index of entry
    const deleteButtons = this.shadowRoot.querySelectorAll('.delete-photo');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.entries[this.currentIndex].photos.splice(index, 1);
        this.updatePhotoGrid();
        this.saveEntry();
      });
    });
  }

  // this is checking if the entries to navigate to are in bounds
  navigate(direction) {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < this.entries.length) {
      this.currentIndex = newIndex;
      this.updateDisplay();
    }
  }

  // idk if theres a more elegant way to do this but to update the screen i essentially have to recall everything
  updateDisplay() {
    const currentEntry = this.entries[this.currentIndex];
    const prevButton = this.shadowRoot.querySelector('.prev-button');
    const nextButton = this.shadowRoot.querySelector('.next-button');
    const counter = this.shadowRoot.querySelector('.entry-counter');
    const nameInput = this.shadowRoot.querySelector('.plant-name');
    const notesInput = this.shadowRoot.querySelector('.catalog-notes');

    prevButton.disabled = this.currentIndex === 0;
    nextButton.disabled = this.currentIndex === this.entries.length - 1;
    counter.textContent = `${this.currentIndex + 1} of ${this.entries.length}`;
    nameInput.value = currentEntry.name;
    notesInput.value = currentEntry.notes;

    this.updatePhotoGrid();
  }
}

customElements.define('plant-catalog', PlantCatalog);