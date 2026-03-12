// Browsers like Chrome, Edge, and Safari support speech synthesis
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(speech);
}

function speakText() {
  let text = document.getElementById("simulationText").innerText;
  let speech = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(speech);
}