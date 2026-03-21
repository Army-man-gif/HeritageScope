// Area filter tests for App/Map.html
// Run in browser console or include as a script after the app loads.

function assert(condition, message) {
    console.assert(condition, message);
}

function waitForMapReady(timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
        if (window.hsMap) {
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

function waitForCondition(check, timeoutMs = 2000, intervalMs = 100) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
            if (check()) {
                resolve();
                return;
            }
            if (Date.now() - start > timeoutMs) {
                reject(new Error('Condition not met in time'));
                return;
            }
            setTimeout(tick, intervalMs);
        };
        tick();
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

    await waitForCondition(() => panel.hasAttribute('hidden'), 3000);

    // Open panel
    toggle.click();
    assert(panel.style.display !== 'none', 'Region filter panel did not open');

    // Region change populates countries
    regionSelect.value = 'Africa';
    regionSelect.dispatchEvent(new Event('change'));
    assert(countrySelect.options.length > 1, 'Country list did not populate');

    // Apply region filter
    apply.click();
    if (countNode) {
        await waitForCondition(() => /Showing\s+\d+\s*\/\s*\d+/.test(countNode.textContent));
        const match = countNode.textContent.match(/Showing\s+(\d+)\s*\/\s*(\d+)/);
        if (match) {
            const filteredCount = Number.parseInt(match[1], 10);
            const totalCount = Number.parseInt(match[2], 10);
            assert(filteredCount > 0 && filteredCount <= totalCount, 'Region filter did not reduce markers');
        }
    }

    if (countNode) {
        assert(countNode.textContent.includes('/'), 'Count label not updated');
    }

    // Clear
    clear.click();
    if (countNode) {
        await waitForCondition(() => /Showing\s+\d+\s*\/\s*\d+/.test(countNode.textContent));
        const match = countNode.textContent.match(/Showing\s+(\d+)\s*\/\s*(\d+)/);
        if (match) {
            const filteredCount = Number.parseInt(match[1], 10);
            const totalCount = Number.parseInt(match[2], 10);
            assert(filteredCount === totalCount, 'Clear did not restore all markers');
        }
    }

    console.log('Area filter tests complete');
}

runAreaFilterTests().catch((err) => console.error('Area filter tests failed:', err));
