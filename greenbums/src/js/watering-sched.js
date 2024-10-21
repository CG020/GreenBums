/**
 *  will need to implement the watering schedule consistency
 *  where the notes area is the user can add their own knotes and the messages will appear
 */


class WateringSched extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.currentDate = new Date();
      this.notes = {};
    }
  
    connectedCallback() {
      this.render();
      this.setupEventListeners();
    }
  
    render() {
      const days = this.getWeeks();
  
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: 0 auto;
          }
          .calendar {
            background-color: #f0f0f0;
            border-radius: 10px;
            padding: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
            .calendar:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 10px;
          }
          .day {
            background-color: #fff;
            border-radius: 5px;
            padding: 10px;
            text-align: center;
          }
          .day-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .day-date {
            font-size: 1.2em;
            margin-bottom: 5px;
          }
          .current-day {
            background-color: #65BF65;
            color: white;
          }
          .notes {
            margin-top: 5px;
          }
          .notes textarea {
            width: 100%;
            height: 50px;
            resize: vertical;
          }
        </style>
        <div class="calendar">
          <div class="header">
            <h2>Watering Schedule</h2>
          </div>
          <div class="days">
            ${days.map(this.renderDay.bind(this)).join('')}
          </div>
        </div>
      `;
    }
  
    renderDay(day) {
      const isCurrentDay = day.toDateString() === new Date().toDateString();
      const dayId = this.formatDate(day);
      return `
        <div class="day ${isCurrentDay ? 'current-day' : ''}">
          <div class="day-name">${this.getDay(day)}</div>
          <div class="day-date">${day.getDate()}</div>
          <div class="notes">
            <textarea id="notes-${dayId}" placeholder="">${this.notes[dayId] || ''}</textarea>
          </div>
        </div>
      `;
    }
  
    setupEventListeners() {
      this.shadowRoot.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('change', (e) => this.saveNote(e.target));
      });
    }
  
    saveNote(textarea) {
      const dayId = textarea.id.split('-')[1];
      this.notes[dayId] = textarea.value;
      localStorage.setItem('calendarNotes', JSON.stringify(this.notes));
    }
  
    getWeeks() {
      const days = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
  
      for (let i = 0; i < 14; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day);
      }
      return days;
    }
  
    getDay(date) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  
    formatDate(date) {
      return date.toISOString().split('T')[0];
    }
  }
  
  customElements.define('watering-sched', WateringSched);