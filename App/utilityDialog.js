globalThis.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('simulationDialog');
    const openButton = document.getElementById('simulationTrigger');
    const closeButton = document.getElementById('closeSimulationDialog');
    const infoToast = document.getElementById('infoToast');
    const infoToastClose = document.getElementById('infoToastClose');
    const infoText = document.getElementById('info');

    /* Yi modified with codex: reuse the existing toast UI for fallback mock-area notices with the same close animation. */
    function hideInfoToast() {
        if (!infoToast) {
            return;
        }
        infoToast.classList.add('is-hiding');
        globalThis.setTimeout(() => {
            infoToast.hidden = true;
            infoToast.style.display = 'none';
        }, 240);
    }

    globalThis.showInfoToast = (message) => {
        if (!infoToast || !infoText) {
            return;
        }

        infoText.textContent = message;
        infoToast.hidden = false;
        infoToast.style.display = 'flex';
        infoToast.classList.remove('is-hiding');
        infoToast.classList.add('is-entering');

        requestAnimationFrame(() => {
            infoToast.classList.remove('is-entering');
        });
    };

    if (dialog && openButton && closeButton) {
        openButton.addEventListener('click', () => {
            if (typeof dialog.showModal === 'function') {
                dialog.showModal();
            }
        });

        closeButton.addEventListener('click', () => {
            dialog.close();
        });

        dialog.addEventListener('click', (event) => {
            const bounds = dialog.getBoundingClientRect();
            const clickedBackdrop =
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom;

            if (clickedBackdrop) {
                dialog.close();
            }
        });
    }

    if (infoToast && infoToastClose) {
        infoToastClose.addEventListener('click', hideInfoToast);
    }
});
