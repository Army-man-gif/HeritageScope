// Area filter tests for App/Map.html
// Run in browser console or include as a script after the app loads.

function assert(condition, message) {
    console.assert(condition, message);
}

function waitForMapReady(timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
        if (window.hsMap && window.hsMarkers && window.hsAllMarkers) {
            resolve();
            return;
        }
        const timeout = setTimeout(() => {
            reject(new Error('Map not ready in time'));
        }, timeoutMs);

        window.addEventListener('heritage:map-ready', () => {
            clearTimeout(timeout);
            resolve();
        }, { once: true });
    });
}

async function runAreaFilterTests() {
    await waitForMapReady();

    const toggle = document.getElementById('regionFilterToggle');
    const panel = document.getElementById('regionFilterPanel');
    const regionSelect = document.getElementById('regionSelect');
    const countrySelect = document.getElementById('countrySelect');
    const apply = document.getElementById('regionApply');
    const clear = document.getElementById('regionClear');
    const countNode = document.getElementById('regionCount');

    assert(toggle && panel && regionSelect && countrySelect && apply && clear, 'Region filter UI missing');

    // Open panel
    toggle.click();
    assert(panel.style.display !== 'none', 'Region filter panel did not open');

    // Region change populates countries
    regionSelect.value = 'Africa';
    regionSelect.dispatchEvent(new Event('change'));
    assert(countrySelect.options.length > 1, 'Country list did not populate');

    const allCount = window.hsAllMarkers.length;

    // Apply region filter
    apply.click();
    const filteredCount = window.hsMarkers.getLayers().length;
    assert(filteredCount > 0 && filteredCount <= allCount, 'Region filter did not reduce markers');

    if (countNode) {
        assert(countNode.textContent.includes('/'), 'Count label not updated');
    }

    // Clear
    clear.click();
    const clearedCount = window.hsMarkers.getLayers().length;
    assert(clearedCount === allCount, 'Clear did not restore all markers');

    console.log('Area filter tests complete');
}

runAreaFilterTests().catch((err) => console.error('Area filter tests failed:', err));
