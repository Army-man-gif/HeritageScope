// Browsers like Chrome, Edge, and Safari support speech synthesis

// make accessible to any .js
window.speak = function(text) {
  speechSynthesis.cancel(); // stop previous speech
  const speech = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(speech);
}

// for different languages
window.speakLang = function(text, lang) {
  speechSynthesis.cancel(); // stop previous speech
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = lang;
  speechSynthesis.speak(speech);
}

// read out text for ids
function addSpeech(id, text) {
  const element = document.getElementById(id);
  element.addEventListener("click", function () {
    speak(text);
  });
}

// class version
function classSpeech(className, text) {
  const elements = document.getElementsByClassName(className);
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", function () {
      speak(text);
    });
  }
}

function classElementSpeech(className, text) {
  const elements = document.getElementsByClassName(className);
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", function () {
      speak(elements[i].innerHTML);
    });
  }
}

// for getting element text
function elementSpeech(id) {
  const element = document.getElementById(id);
  element.addEventListener("click", function () {
    speak(element.innerHTML);
  });
}

// introduce web page
window.onload = function(){
  speak("This is an interactive map. Click on buttons to hear what they do or click on text to hear it aloud.");
};

// hard code as need to describe what they are and button descs are unclear

// text size and contrast
addSpeech("smallText", "This button sets the smallest text size.");
addSpeech("mediumText", "This button sets the medium text size.");
addSpeech("largeText", "This button sets the largest text size.");
addSpeech("contrast-btn", "This button changes the map contrast.");

// number info
addSpeech("infoToastClose", "This is a button which closes information on numbering on the map.")
addSpeech("info", "When zooming out in the map the number is the number shown is the number of cultural sites in that area chunk.")

// zooming function

// languages

// navigator part
elementSpeech("navigatorTitle");
addSpeech("walking", "This button turns on walking mode for navigating heritage sites.");
addSpeech("wheelchair", "This button turns on wheelchair mode for navigating heritage sites.");
elementSpeech("destination");
addSpeech("destinationInput", "This is a text box for the destination navigator. For example enter Birmingham Museum.");
classSpeech("routeGhostBtn", "This button routes the area when clicked.");
classSpeech("routePrimaryBtn", "This button goes to the input area when clicked.");

// utility section
elementSpeech("utilityTitle");
classElementSpeech("utilityLabel");
addSpeech("status-btn", "This button shows at risk sites when clicked.");
// gives extra info when it opens
addSpeech("simulationTrigger", "This button opens the simulation when clicked. This is an environmental simulation, click on text, sliders or images to hear them aloud.");
addSpeech("lidInput", "Enter the location id you want to highlight here.");
addSpeech("areaMarkRun", "Click this button to highlight the inputted location ID.");

// panel part
classElementSpeech("splitPanelHeader");
classElementSpeech("splitPlaceholderText");

// extra simulation bits
elementSpeech("simTitle");
addSpeech("closeSimulationDialog", "This button closes the simulation when clicked.");

// these have been removed
//addSpeech("status-btn", "This button shows at risk sites.");
//addSpeech("lidInput", "This is a text box to search for a location ID.");
//addSpeech("areaMarkRun", "This button runs the location search.");
//addSpeech("toolbarToggle", "This button opens and closes the toolbar.");