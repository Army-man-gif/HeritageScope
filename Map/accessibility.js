function applyFontSize(size) {
    const sizes = { normal: '16px', large: '20px', xlarge: '24px' };
    document.documentElement.style.fontSize = sizes[size];
    localStorage.setItem('fontSize', size);

    // Update active state on buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
}

function toggleHighContrast() {
    const isOn = document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', isOn);

    // Update contrast button text
    const btn = document.getElementById('contrast-btn');
    btn.textContent = isOn ? 'Normal View' : 'High Contrast';
}

// Load saved preferences on page load
window.onload = function() {
    const savedSize = localStorage.getItem('fontSize') || 'normal';
    applyFontSize(savedSize);

    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
        document.getElementById('contrast-btn').textContent = 'Normal View';
    }
};