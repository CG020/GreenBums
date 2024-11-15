// import { Camera, CameraResultType } from '@capacitor/camera';  // Commented out camera import

class PlantCatalog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
    this.entries = [{
      name: '',
      notes: ''
      // photos: [] // removed photos because of saving issues
    }];

    this.apiURL = '/api/user/catalog';
    this.userEmail = sessionStorage.getItem('userEmail');
    this.saveTimeout = null; 
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    setTimeout(() => this.loadEntries(), 100);
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
          font-family: cursive;
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

        .delete-entry {
          background: #b22222;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          width: 100%;
          cursor: pointer;
          margin-top: 10px;
        }

        .sched-entry {
            background: #0066CC;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            width: 100%;
            cursor: pointer;
            margin-top: 10px;
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
          <button class="sched-entry">Schedule Entry</button>
          <button class="delete-entry">Delete Entry</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // const addPhotoBtn = this.shadowRoot.querySelector('.add-photo');  // Commented out photo button
    const addEntryBtn = this.shadowRoot.querySelector('.add-entry');
    const prevButton = this.shadowRoot.querySelector('.prev-button');
    const nextButton = this.shadowRoot.querySelector('.next-button');
    const plantName = this.shadowRoot.querySelector('.plant-name');
    const notes = this.shadowRoot.querySelector('.catalog-notes');
    const deleteButton = this.shadowRoot.querySelector('.delete-entry');
    const schedButton = this.shadowRoot.querySelector('.sched-entry');


    // addPhotoBtn.addEventListener('click', () => this.takePicture());  // Commented out photo listener
    addEntryBtn.addEventListener('click', () => this.addNewEntry());
    schedButton.addEventListener('click', () => this.schedEntry());
    prevButton.addEventListener('click', () => this.navigate(-1));
    nextButton.addEventListener('click', () => this.navigate(1));
    deleteButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this entry?')) {
          this.deleteEntry();
      }
    });
      
      plantName.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
        this.updateEntry('name', e.target.value);
        }
      } );
      notes.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
        this.updateEntry('notes', e.target.value);
      } 
      } );
    }

  // initilize completely empty entry when triggered by button
  addNewEntry() {
    const timestamp = Date.now().toString(); // rather than using indexes, using time

    this.entries.push({
        name: '',
        notes: '',
        timestamp: timestamp // serves as index
    });
    this.currentIndex = this.entries.length - 1;
    //this.currentIndex = this.entries.length - 1; // TODO potential edit to fix posting
    this.updateDisplay();

    const payload = {
        "email": String(this.userEmail),
        "name": "",
        "notes": "",
        "photos": [],// have photos as placement here but no handling
        "timestamp": timestamp 
  };

    fetch(this.apiURL, { // restructured fetch 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.status === 201) {
            console.log('New entry created successfully');
            this.loadEntries();
        } else {
            alert('Failed to create new entry');
        }
    })
    .catch(error => {
        alert(`Error creating new entry: ${error.message}`);
        console.error('Error:', error);
    });
  }


  updateEntry(field, value) {
      this.entries[this.currentIndex][field] = value;
      
      if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
      }
      
      this.saveTimeout = setTimeout(() => {
          this.saveEntry();
      }, 1000);
  }

  async deleteEntry() {
    try {
        if (!this.userEmail) {
            alert('No user email found - cannot delete');
            return;
        }

        const currentEntry = this.entries[this.currentIndex];
        if (!currentEntry || !currentEntry.timestamp) {
            alert('No valid entry to delete');
            return;
        }

        const deleteResponse = await fetch(
            `${this.apiURL}?email=${encodeURIComponent(this.userEmail)}&timestamp=${currentEntry.timestamp}`,
            {
                method: 'DELETE'
            }
        );

        if (deleteResponse.status === 200) {
            alert('Entry deleted successfully');
            this.entries.splice(this.currentIndex, 1);
            
            if (this.entries.length === 0) {
                this.entries = [{
                    name: '',
                    notes: '',
                    timestamp: Date.now().toString()
                }];
            }
            
            this.currentIndex = Math.min(this.currentIndex, this.entries.length - 1);
            this.updateDisplay();
            await this.loadEntries();
        } else {
            throw new Error(`Delete failed with status: ${deleteResponse.status}`);
        }
    } catch (error) {
        alert(`Error deleting entry: ${error.message}`);
        console.error('Error deleting entry:', error);
    }
  }

  // intended to update an existing entry - not quite working as intended
  async saveEntry() {
    const currentEntry = this.entries[this.currentIndex];

    try {
        if (!this.userEmail) {
            alert('No user email found - cannot save');
            return false;
        }

        const payload = {
            "email": String(this.userEmail),
            "name": String(currentEntry.name || ''),
            "notes": String(currentEntry.notes || ''),
            "photos": [], // photos placeholder because requires all entry structure pieces
            "timestamp": currentEntry.timestamp
        };

        const response = await fetch(this.apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 201) {
            console.log('Entry saved successfully');
            await this.loadEntries(); 
            return true;
        } else {
            const responseText = await response.text();
            throw new Error(`Failed to save: ${responseText}`);
        }

    } catch (error) {
        alert(`Error saving entry: ${error.message}`);
        console.error('Full error:', error);
        return false;
    }
  }


  async loadEntries() {
    try {
        if (!this.userEmail) {
            alert('No user email found in session storage');
            return;
        }

        // url edited to get specific email data
        const url = `${this.apiURL}?email=${encodeURIComponent(this.userEmail)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 404) {
            this.entries = [{
                name: '',
                notes: '',
                timestamp: Date.now().toString()
            }];
            this.currentIndex = 0;
            this.updateDisplay();
            return;
        }
        
        if (response.status === 200) {
          const data = await response.json();
          
          const entries = Object.entries(data)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([timestamp, entry]) => ({
                  name: entry.name || '',
                  notes: entry.notes || '',
                  timestamp: timestamp
              }));

          if (entries.length > 0) {
              this.entries = entries;
          } else {
              this.entries = [{
                  name: '',
                  notes: '',
                  timestamp: Date.now().toString()
              }];
          }

          this.currentIndex = Math.min(this.currentIndex, this.entries.length - 1);
          this.updateDisplay();
        }
    } catch (error) {
        console.error('Error in loadEntries:', error);
    }
  }

  // modal creation to get details for recurring event - to be implemented into the watering sched
  schedEntry() {
    var name = this.entries[this.currentIndex]["name"];

    const schedModal = document.createElement('div');
    schedModal.innerHTML = `
      <style>
        .sched-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1001;
          width: 300px;
        }

        .sched-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .sched-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-weight: bold;
        }

        .form-group select, .form-group input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .button-group {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 15px;
        }

        .sched-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .confirm-button {
          background-color: #4A6741;
          color: white;
        }

        .cancel-button {
          background-color: #999;
          color: white;
        }
      </style>
      <div class="sched-backdrop"></div>
      <div class="sched-modal">
        <h3>Schedule Watering for ${name}</h3>
        <form class="sched-form">
          <div class="form-group">
            <label>Start Date:</label>
            <input type="date" id="startDate" required>
          </div>
          <div class="form-group">
            <label>Repeat Every:</label>
            <div style="display: flex; gap: 10px;">
              <input type="number" id="repeatNum" min="1" value="1" style="width: 60px;">
              <select id="repeatUnit">
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Notes:</label>
            <textarea id="schedNotes" rows="3" style="resize: vertical;"></textarea>
          </div>
          <div class="button-group">
            <button type="button" class="sched-button cancel-button">Cancel</button>
            <button type="button" class="sched-button confirm-button">Confirm</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(schedModal);
    const backdrop = schedModal.querySelector('.sched-backdrop');
    const cancelBtn = schedModal.querySelector('.cancel-button');
    const confirmBtn = schedModal.querySelector('.confirm-button');

    const closeModal = () => {
      document.body.removeChild(schedModal);
    };

    backdrop.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    confirmBtn.addEventListener('click', () => {
      const startDate = schedModal.querySelector('#startDate').value;
      const repeatNum = schedModal.querySelector('#repeatNum').value;
      const repeatUnit = schedModal.querySelector('#repeatUnit').value;
      const notes = schedModal.querySelector('#schedNotes').value;

      if (!startDate) {
        alert('Please select a start date');
        return;
      }

      try {
        const scheduleEvent = new CustomEvent('scheduleWatering', {
          detail: {
            plantName: name,
            startDate: startDate,
            repeat: {
              interval: parseInt(repeatNum),
              unit: repeatUnit
            },
            notes: notes
          },
          bubbles: true,
          composed: true
        });

        this.dispatchEvent(scheduleEvent);
      } catch (error) {
        alert('Error creating watering schedule. Please try again.');
      }

      closeModal();
    });
  }


  // arrow button handling
  navigate(direction) {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < this.entries.length) {
        this.currentIndex = newIndex;
        this.updateDisplay();
        console.log(`Navigated to index ${this.currentIndex} of ${this.entries.length} entries`);
    }
  }

  updateDisplay() {
    const currentEntry = this.entries[this.currentIndex];
    const prevButton = this.shadowRoot.querySelector('.prev-button');
    const nextButton = this.shadowRoot.querySelector('.next-button');
    const counter = this.shadowRoot.querySelector('.entry-counter');
    const nameInput = this.shadowRoot.querySelector('.plant-name');
    const notesInput = this.shadowRoot.querySelector('.catalog-notes');

    if (prevButton) prevButton.disabled = this.currentIndex === 0;
    if (nextButton) nextButton.disabled = this.currentIndex === this.entries.length - 1;
    
    if (counter) counter.textContent = `${this.currentIndex + 1} of ${this.entries.length}`;
    if (nameInput) nameInput.value = currentEntry.name || '';
    if (notesInput) notesInput.value = currentEntry.notes || '';

    console.log(`Display updated: Entry ${this.currentIndex + 1} of ${this.entries.length}`);
  }
}

customElements.define('plant-catalog', PlantCatalog);