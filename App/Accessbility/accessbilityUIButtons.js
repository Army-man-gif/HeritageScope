import { HighContrast, RescaleText } from "./accessibility.js";

const fontSizeToPreset = {
  16: "normal",
  20: "large",
  24: "xlarge",
};

function initAccessibility() {
  const textScaler = new RescaleText();
  const contrastController = new HighContrast();

  document.querySelectorAll(".font-btn").forEach((button) => {
    button.addEventListener("click", () => {
      textScaler.f_applyFontSize(button.dataset.size);
    });
  });

  const contrastButton = document.getElementById("contrast-btn");
  if (contrastButton) {
    contrastButton.addEventListener("click", () => {
      contrastController.f_toggleHighContrast();
    });
  }

  const savedFontSize = Number.parseInt(localStorage.getItem("fontSize"), 10);
  const preset = fontSizeToPreset[savedFontSize];

  if (preset) {
    textScaler.f_applyFontSize(preset);
  } else {
    textScaler.f_init();
  }
}

window.addEventListener("DOMContentLoaded", initAccessibility);
