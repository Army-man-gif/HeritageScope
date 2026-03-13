// Browsers like Chrome, Edge, and Safari support speech synthesis
function speak(text) {
  speechSynthesis.cancel(); // stop previous speech
  const speech = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(speech);
}

// read out accessibility features
function addSpeech(id, text) {
  const element = document.getElementById(id);
  element.addEventListener("click", function () {
    speak(text);
  });
}

// introduce web page
window.onload = function(){
  speak("This is an interactive map.");
};

// hard code as need to describe what they are and button descs are unclear
addSpeech("smallText", "This button sets the smallest text size.");
addSpeech("mediumText", "This button sets the medium text size.");
addSpeech("largeText", "This button sets the largest text size.");
addSpeech("contrast-btn", "This button changes the map contrast.");
addSpeech("status-btn", "This button shows at risk sites.");
addSpeech("lidInput", "This is a text box to search for a location ID.");
addSpeech("areaMarkRun", "This button runs the location search.");
addSpeech("toolbarToggle", "This button opens and closes the toolbar.");