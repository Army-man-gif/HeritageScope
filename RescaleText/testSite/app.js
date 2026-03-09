r = new RescaleText();
r.updateLabel();
increaseBtn = document.getElementById("larger");
decreaseBtn = document.getElementById("smaller");
resetBtn = document.getElementById("reset");

increaseBtn.addEventListener("click", () => {
  r.f_increaseFont();
});

decreaseBtn.addEventListener("click", () => {
  r.f_decreaseFont();
}); 
resetBtn.addEventListener("click", () => {
  r.f_resetFont();
});