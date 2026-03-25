export function initColourBlindToggle() {
    const toggleBtn = document.getElementById("colourBlindToggle");

    if (!toggleBtn) {
        return;
    }

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("colourblind-mode");
        
    })
}