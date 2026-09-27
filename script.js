Script · JS
// Grab all the elements we need from the page
const searchForm = document.getElementById('search-form');
const wordInput = document.getElementById('word-input');
const themeBtn = document.getElementById('theme-btn');
 
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
 
const resultsSection = document.getElementById('results');
const wordTitle = document.getElementById('word-title');
const phoneticText = document.getElementById('phonetic-text');
const audioBtn = document.getElementById('audio-btn');
const audioPlayer = document.getElementById('audio-player');
const saveBtn = document.getElementById('save-btn');
const meaningsContainer = document.getElementById('meanings-container');
 
const savedWordsList = document.getElementById('saved-words-list');
 
// This keeps track of the word that is currently on screen
let currentWord = '';
 
// This array holds all the words the user has saved (in memory only)
let savedWords = [];
 
// Base URL for the Free Dictionary API
const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
 
// Listen for the form being submitted
searchForm.addEventListener('submit', function (event) {
  // Stop the page from refreshing
  event.preventDefault();
 
  const word = wordInput.value.trim();
 
  if (word === '') {
    return;
  }
 
  lookupWord(word);
});
 
// Listen for the dark mode button
themeBtn.addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');
});
 
// Listen for the save button
saveBtn.addEventListener('click', function () {
  if (currentWord === '') {
    return;
  }
  saveWord(currentWord);
});
 
// Listen for the audio play button
audioBtn.addEventListener('click', function () {
  audioPlayer.play();
});
 
// This function fetches the word data from the API
function lookupWord(word) {
  // Reset the screen before we search
  hideError();
  hideResults();
  showLoading();
 
  fetch(API_URL + word)
    .then(function (response) {
      if (!response.ok) {
        // If the API says the word was not found, this will run
        throw new Error('Word not found');
      }
      return response.json();
    })
    .then(function (data) {
      hideLoading();
      displayResults(data, word);
    })
    .catch(function (error) {
      hideLoading();
      showError('Sorry, we could not find "' + word + '". Please check the spelling and try again.');
      console.log(error);
    });
}
 
// This function takes the API data and puts it on the page
function displayResults(data, word) {
  // The API returns an array, we just use the first entry
  const entry = data[0];
 
  currentWord = word;
 
  // Set the title
  wordTitle.textContent = entry.word;
 
  // Find a phonetic text and audio file if they exist
  let phonetic = entry.phonetic || '';
  let audioUrl = '';
 
  if (entry.phonetics && entry.phonetics.length > 0) {
    for (let i = 0; i < entry.phonetics.length; i++) {
      if (!phonetic && entry.phonetics[i].text) {
        phonetic = entry.phonetics[i].text;
      }
      if (!audioUrl && entry.phonetics[i].audio) {
        audioUrl = entry.phonetics[i].audio;
      }
    }
  }
 
  phoneticText.textContent = phonetic;
 
  if (audioUrl) {
    audioPlayer.setAttribute('src', audioUrl);
    audioBtn.classList.remove('hidden');
  } else {
    audioBtn.classList.add('hidden');
  }
 
  // Clear out any old definitions
  meaningsContainer.innerHTML = '';
 
  // Loop through each meaning (noun, verb, etc.)
  entry.meanings.forEach(function (meaning) {
    const meaningBlock = document.createElement('div');
    meaningBlock.classList.add('meaning-block');
 
    const posLabel = document.createElement('p');
    posLabel.classList.add('part-of-speech');
    posLabel.textContent = meaning.partOfSpeech;
    meaningBlock.appendChild(posLabel);
 
    // Show up to 3 definitions so the page doesn't get too long
    const definitionsToShow = meaning.definitions.slice(0, 3);
 
    definitionsToShow.forEach(function (def) {
      const defItem = document.createElement('p');
      defItem.classList.add('definition-item');
      defItem.textContent = '- ' + def.definition;
      meaningBlock.appendChild(defItem);
 
      if (def.example) {
        const exampleItem = document.createElement('p');
        exampleItem.classList.add('example-text');
        exampleItem.textContent = 'Example: "' + def.example + '"';
        meaningBlock.appendChild(exampleItem);
      }
    });
 
    // Show synonyms if there are any
    if (meaning.synonyms && meaning.synonyms.length > 0) {
      const synonymsItem = document.createElement('p');
      synonymsItem.classList.add('synonyms-text');
      synonymsItem.textContent = 'Synonyms: ' + meaning.synonyms.slice(0, 5).join(', ');
      meaningBlock.appendChild(synonymsItem);
    }
 
    meaningsContainer.appendChild(meaningBlock);
  });
 
  // Update save button so it shows if the word is already saved
  updateSaveButton();
 
  showResults();
}
 
// Adds a word to the saved list
function saveWord(word) {
  // Don't add the same word twice
  if (savedWords.indexOf(word) !== -1) {
    return;
  }
 
  savedWords.push(word);
  updateSaveButton();
  renderSavedWords();
}
 
// Updates the look and text of the save button
function updateSaveButton() {
  if (savedWords.indexOf(currentWord) !== -1) {
    saveBtn.textContent = '⭐ Saved!';
    saveBtn.classList.add('saved');
  } else {
    saveBtn.textContent = '⭐ Save Word';
    saveBtn.classList.remove('saved');
  }
}
 
// Redraws the list of saved words on the page
function renderSavedWords() {
  savedWordsList.innerHTML = '';
 
  savedWords.forEach(function (word) {
    const listItem = document.createElement('li');
    listItem.textContent = word;
 
    // Clicking a saved word looks it up again
    listItem.addEventListener('click', function () {
      wordInput.value = word;
      lookupWord(word);
    });
 
    savedWordsList.appendChild(listItem);
  });
}
 
// Helper functions to show/hide sections of the page
 
function showLoading() {
  loadingMessage.classList.remove('hidden');
}
 
function hideLoading() {
  loadingMessage.classList.add('hidden');
}
 
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}
 
function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}
 
function showResults() {
  resultsSection.classList.remove('hidden');
}
 
function hideResults() {
  resultsSection.classList.add('hidden');
}