globalThis.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('simulationDialog');
    const openButton = document.getElementById('simulationTrigger');
    const closeButton = document.getElementById('closeSimulationDialog');
    const infoToast = document.getElementById('infoToast');
    const infoToastClose = document.getElementById('infoToastClose');

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
        infoToastClose.addEventListener('click', () => {
            infoToast.hidden = true;
            infoToast.style.display = 'none';
        });
    }
});
