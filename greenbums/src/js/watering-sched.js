import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

/**
 * I decided to use an API for the calendar - FullCalendar has a ton of capabilities I think we'll find useful
 * https://fullcalendar.io/docs/initialize-globals - here are the basics for it
 * I combind the FullCalendar object with a modal to handle notes and customization of such
 * 
 * right now this version of calendar can add events - its a little janky and not clearing some dates and times in between modal popups im 
 * trying to fix - in between calendar views the events get a little weird too, otherwise good
 * 
 * for now you can personalize a note by type (rn in the form of emojis) so each note has a selector (i think ill use somthing similar 
 * for timestamps)
 * 
 * My next steps: 
 * down the line we need the weather api to prompt weather events into the calendar 
 * down the line we need event recurrence if it is a watering event - also something i think FC can help with
 * 
 * another cool feature i thought we could add is connecting the catalog to the calendar - assigning events to specific plants in the 
 * catalog could add some personalization
 * 
 */

class WateringSched extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentDate = new Date();
        this.notes = {};
        this.calendar = null;

        // ok this is a prototype because i thought it would be cute and i saw it on another calendar mod
        this.eventTypes = {
          water: { emoji: '💧', label: 'Watering' },
          plant: { emoji: '🌱', label: 'Plant' },
          warning: { emoji: '⚠️', label: 'Warning' },
          other: { emoji: '📝', label: 'Other' }
      };
    }

    connectedCallback() {
        this.render();
        this.setupCalendar();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            /* basic calendar styling for the tile */
            :host {
                display: block;
                font-family: Arial, sans-serif;
                max-width: 700px;
                margin: 0 auto;
            }

            .calendar-container {
                background-color: #f0f0f0;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }

            .calendar-container:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
                font-family: cursive;
            }

            /* fc is the fullcalendar style editor */
            .fc {
                background-color: white;
                border-radius: 5px;
                padding: 10px;
            }

            .fc .fc-toolbar-title {
                font-size: 1.5em;
                color: #333;
            }

            .fc .fc-button {
                background-color: #65BF65;
                border-color: #65BF65;
            }

            .fc .fc-button:hover {
                background-color: #4FA04F;
                border-color: #4FA04F;
            }

            .fc .fc-daygrid-day.fc-day-today {
                background-color: #E8F5E8;
            }

            .fc .fc-daygrid-day-frame {
                padding: 8px;
            }

            /* modal styling for the popup notes */
            .note-modal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                margin-right: 20px;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                width: 300px;
            }

            .modal-backdrop {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
            }

            .note-textarea {
                width: 100%;
                height: 100px;
                margin: 10px 0;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                resize: vertical;
            }

            .modal-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            .modal-button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            .save-button {
                background-color: #65BF65;
                color: white;
            }

            .cancel-button {
                background-color: #999;
                color: white;
            }

            /* the styling for the icons you can personalize the notes with */
            .emoji-selector {
                display: flex;
                gap: 10px;
                margin: 10px 0;
            }

            .emoji-option {
                padding: 8px;
                border: 2px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .emoji-option:hover {
                background-color: #f0f0f0;
            }

            .emoji-option.selected {
                border-color: #65BF65;
                background-color: #E8F5E8;
            }

            .delete-button {
                background-color: #ff4444;
                color: white;
            }

            .delete-button:hover {
                background-color: #cc0000;
            }

            /* time selector styling */
            .event-time-selector {
                margin-bottom: 15px;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 4px;
            }

            .time-inputs {
                margin-top: 10px;
            }

            .time-group {
                margin: 10px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .date-input, .time-input {
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .time-input {
                width: 120px;
            }
        </style>

        <div class="calendar-container">
            <div class="header">
                <h2>Plant Watering Schedule</h2>
            </div>
            <div id="calendar"></div>
        </div>

        <div class="modal-backdrop"></div>
        <div class="note-modal">
            <h3>Add Event</h3>
            <div class="event-time-selector">
                <label>
                    <input type="checkbox" id="allDay" checked>
                    All Day Event
                </label>
                
                <div class="time-inputs" style="display: none;">
                    <div class="time-group">
                        <label>Start:</label>
                        <input type="date" id="startDate" class="date-input">
                        <input type="time" id="startTime" class="time-input">
                    </div>
                    
                    <div class="time-group">
                        <label>End:</label>
                        <input type="date" id="endDate" class="date-input">
                        <input type="time" id="endTime" class="time-input">
                    </div>
                </div>
            </div>
            <div class="emoji-selector">
                ${Object.entries(this.eventTypes).map(([key, value]) => `
                    <div class="emoji-option" data-type="${key}">
                        ${value.emoji} ${value.label}
                    </div>
                `).join('')}
            </div>
            <textarea class="note-textarea" placeholder="Enter your note..."></textarea>
            <div class="modal-buttons">
                <button class="modal-button delete-button" style="display: none;">Delete</button>
                <button class="modal-button cancel-button">Cancel</button>
                <button class="modal-button save-button">Save</button>
            </div>
        </div>
        `;
    }

    setupCalendar() {
        const calendarObject = this.shadowRoot.querySelector('#calendar');
        
        // using this FullCalendar plugin https://fullcalendar.io/docs/initialize-globals
        this.calendar = new Calendar(calendarObject, {
          plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
          initialView: 'dayGridMonth',
          headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
          },

            dateClick: this.handleDateClick.bind(this),
            eventClick: this.handleEventClick.bind(this),
            events: this.getEvents.bind(this),

            // notes will be handled with modal to make a popup 
            eventDidMount: (info) => { // this is an FC feature that is called right after the element has been added to the DOM
              const eventDate = this.formatDate(info.event.start);
              if (this.notes[eventDate]) {
                  const newNote = document.createElement('div');
                  newNote.className = 'note-indicator';
                  newNote.style.backgroundColor = '#65BF65';
                  newNote.style.width = '8px';
                  newNote.style.height = '8px';
                  newNote.style.borderRadius = '50%';
                  newNote.style.margin = '2px auto';
                  info.el.appendChild(newNote);
              }
            }
        });

        this.calendar.render();
    }

    setupEventListeners() {
      const modal = this.shadowRoot.querySelector('.note-modal');
      const backdrop = this.shadowRoot.querySelector('.modal-backdrop');
      const cancelBtn = this.shadowRoot.querySelector('.cancel-button');
      const saveBtn = this.shadowRoot.querySelector('.save-button');
      const deleteBtn = this.shadowRoot.querySelector('.delete-button');
      const emojiOptions = this.shadowRoot.querySelectorAll('.emoji-option');
      const allDayCheckbox = this.shadowRoot.querySelector('#allDay');
      const timeInputs = this.shadowRoot.querySelector('.time-inputs');

      cancelBtn.addEventListener('click', () => this.closeModal());
      saveBtn.addEventListener('click', () => this.saveNote());
      deleteBtn.addEventListener('click', () => this.deleteNote());
      backdrop.addEventListener('click', () => this.closeModal());

      // event listener looking for seleection of note type
      emojiOptions.forEach(option => {
          option.addEventListener('click', () => {
              emojiOptions.forEach(opt => opt.classList.remove('selected'));
              option.classList.add('selected');
          });
      });
      // selector handler for the date and time features 
      allDayCheckbox.addEventListener('change', (e) => {
        timeInputs.style.display = e.target.checked ? 'none' : 'block';
      });
  }

    /* Modal Handlers ---------------------------------------------- */

    handleDateClick(info) {
        this.openModal(info.date);
    }

    handleEventClick(info) {
        this.openModal(info.event.start);
    }

    openModal(date) {
      // css handlers
      const modal = this.shadowRoot.querySelector('.note-modal');
      const backdrop = this.shadowRoot.querySelector('.modal-backdrop');
      const textarea = this.shadowRoot.querySelector('.note-textarea');
      const deleteBtn = this.shadowRoot.querySelector('.delete-button');
      const emojiOptions = this.shadowRoot.querySelectorAll('.emoji-option');
      
      const dateStr = this.formatDate(date);
      modal.dataset.date = dateStr;
      emojiOptions.forEach(opt => opt.classList.remove('selected'));
  
      if (this.notes[dateStr]) { // checks if note exists
          const note = this.notes[dateStr];
          textarea.value = note.text || '';
          if (note.type) { // selection handler for the note type
              const emojiOption = this.shadowRoot.querySelector(`.emoji-option[data-type="${note.type}"]`);
              if (emojiOption) emojiOption.classList.add('selected');
          }
          deleteBtn.style.display = 'block';
      } else { // if there isnt already a note in place user has to select everything
        textarea.value = '';
        deleteBtn.style.display = 'none';
      }
      
      modal.style.display = 'block';
      backdrop.style.display = 'block';
  }

    closeModal() {
      // css handlers
      const modal = this.shadowRoot.querySelector('.note-modal');
      const backdrop = this.shadowRoot.querySelector('.modal-backdrop');
      modal.style.display = 'none';
      backdrop.style.display = 'none';
    }

    saveNote() {
      // css handlers
      const modal = this.shadowRoot.querySelector('.note-modal');
      const textarea = this.shadowRoot.querySelector('.note-textarea');
      const selectedType = this.shadowRoot.querySelector('.emoji-option.selected');
      const date = modal.dataset.date;

      const isAllDay = this.shadowRoot.querySelector('#allDay').checked;
      const startDate = this.shadowRoot.querySelector('#startDate').value;
      const startTime = this.shadowRoot.querySelector('#startTime').value;
      const endDate = this.shadowRoot.querySelector('#endDate').value;
      const endTime = this.shadowRoot.querySelector('#endTime').value;

      const eventData = {
        text: textarea.value,
        type: selectedType ? selectedType.dataset.type : 'other',
        allDay: isAllDay,
        start: isAllDay ? date : `${startDate}T${startTime}`,
        end: isAllDay ? date : `${endDate}T${endTime}`
      };
      
      // the notes are stored in the 'notes' list so when the event is triggered they can be retrieved
      this.notes[date] = eventData;
      localStorage.setItem('calendarNotes', JSON.stringify(this.notes));
      
      this.calendar.refetchEvents();
      this.closeModal();
    }

    deleteNote() {
      // css styling
      const modal = this.shadowRoot.querySelector('.note-modal');
      const date = modal.dataset.date;
      
      // remove the note from the notes list
      delete this.notes[date];
      localStorage.setItem('calendarNotes', JSON.stringify(this.notes));
      
      this.calendar.refetchEvents();
      this.closeModal();
  }

    getEvents(fetchInfo, successCallback) {
      const events = Object.entries(this.notes).map(([date, note]) => ({
        title: this.eventTypes[note.type]?.emoji || '📝',
        start: note.start,
        end: note.end,
        allDay: note.allDay,
        extendedProps: { text: note.text }
      }));
      
      successCallback(events);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    disconnectedCallback() {
        if (this.calendar) {
            this.calendar.destroy();
        }
    }
}

customElements.define('watering-sched', WateringSched);