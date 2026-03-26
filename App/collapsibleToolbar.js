globalThis.addEventListener('DOMContentLoaded', () => {
    const toolbarContainer = document.querySelector('.toolbarContainer');
    const toolbarToggle = document.getElementById('toolbarToggle');

    if (!toolbarContainer || !toolbarToggle) {
        return;
    }

    toolbarToggle.addEventListener('click', () => {
        const isCollapsed = toolbarContainer.classList.toggle('is-collapsed');
        toolbarToggle.textContent = isCollapsed ? '\u{1F528}' : '\u274E';
        toolbarToggle.setAttribute(
            'aria-label',
            isCollapsed ? 'Open toolbar' : 'Close toolbar'
        );
    });
});
