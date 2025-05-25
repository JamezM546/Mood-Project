// references
const currentDateDisplay = document.getElementById('current-date');
const moodOptions = document.querySelectorAll('.mood-option');
const journalTextarea = document.getElementById('journal-text');
const saveEntryBtn = document.getElementById('save-entry-btn');
const moodEntriesList = document.getElementById('mood-entries-list');

// variable to store the currently selected mood
let selectedMood = null;

// array to store all journal entries which we'll get from the local storage
let journalEntries = [];

//  Helper functions below

//function to format the current date
function getFormattedDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}


function displayCurrentDate() {
    currentDateDisplay.textContent = getFormattedDate();
}

// save entries to localStorage
function saveEntries() {
    localStorage.setItem('moodJournalEntries', JSON.stringify(journalEntries));
}

// function to load entries from localStorage
function loadEntries() {
    const storedEntries = localStorage.getItem('moodJournalEntries');
    if (storedEntries) {
        journalEntries = JSON.parse(storedEntries);
        // sorting by the newest first
        journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderEntries(); //then we render all loaded entries
    }
}

// function to create and add a single journal entry card to the DOM
function createEntryCard(entry) {
    const entryCard = document.createElement('div');
    entryCard.classList.add('journal-entry-card');
    // set data-mood attribute for CSS styling
    entryCard.setAttribute('data-mood', entry.mood);
    // use entry.id to uniquely identify the card for deletion
    entryCard.dataset.id = entry.id;

    entryCard.innerHTML = `
        <div class="entry-header">
            <span class="date">${entry.date}</span>
            <span class="mood-display">${entry.moodEmoji}</span>
        </div>
        <p>${entry.text}</p>
        <button class="delete-entry-btn">✖</button>
    `;

    // adding event listener for the delete button
    const deleteBtn = entryCard.querySelector('.delete-entry-btn');
    deleteBtn.addEventListener('click', () => {
        // locating the index of the entry in our array by its ID
        const index = journalEntries.findIndex(e => e.id === entry.id);
        if (index > -1) {
            journalEntries.splice(index, 1); // Remove from array
            saveEntries(); // updating the localStorage
            entryCard.remove(); // remove it from the DOM
        }
    });

    return entryCard;
}

// function to render all entries from the journalEntries array
function renderEntries() {
    moodEntriesList.innerHTML = ''; // clear existing entries before rendering
    journalEntries.forEach(entry => {
        const card = createEntryCard(entry);
        moodEntriesList.appendChild(card); // append to the list
    });
}

// Event Listeners are below

// event for mood selection 

moodOptions.forEach(option => {
    option.addEventListener('click', () => {
        // remove the 'selected' class from previously selected mood
        if (selectedMood) {
            document.querySelector(`.mood-option[data-mood="${selectedMood}"]`).classList.remove('selected');
        }
        // adding 'selected' class to the clicked mood
        option.classList.add('selected');
        selectedMood = option.dataset.mood; //storing the current mood
    });
});


saveEntryBtn.addEventListener('click', () => {
    const text = journalTextarea.value.trim(); // getting the journal text
    const date = getFormattedDate(); // get current formatted date

    // MOODS!
    const moodEmojis = {
        happy: '😊',
        neutral: '😐',
        sad: '😔',
        angry: '😡',
        anxious: '😟'
    };

    //error checking
    if (!selectedMood) {
        alert('Please select a mood before saving!');
        return;
    }

    if (text === '') {
        alert('Please write something in your journal!');
        return;
    }

    // creating a new entry object
    const newEntry = {
        id: Date.now(), // using timestamp
        date: date,
        mood: selectedMood,
        moodEmoji: moodEmojis[selectedMood], // get the corresponding emoji
        text: text
    };

    journalEntries.push(newEntry); // add to our array
    saveEntries(); // save to the localStorage

    // create and prepend the new entry card (so newest appears at the top)
    const newEntryCard = createEntryCard(newEntry);
    moodEntriesList.prepend(newEntryCard); // use prepend for newest entry at top

  
    journalTextarea.value = ''; //just clearning 
    // deselect the mood
    document.querySelector(`.mood-option[data-mood="${selectedMood}"]`).classList.remove('selected');
    selectedMood = null;
});

//  Initial Load when program starts
// also display current date when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();
    loadEntries(); // load and display existing entries
});