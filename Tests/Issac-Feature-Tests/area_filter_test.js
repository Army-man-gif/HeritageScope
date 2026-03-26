// Area filter tests for App/Map.html

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
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

function parseCount(text) {
    const match = text.match(/Showing\s+(\d+)\s*\/\s*(\d+)/);
    if (!match) return null;
    return {
        filtered: Number.parseInt(match[1], 10),
        total: Number.parseInt(match[2], 10)
    };
}

export async function runAreaFilterTests() {
    console.log("Running test (Testing area filter)...");
    await waitForMapReady();

    const toggle = document.getElementById('regionFilterToggle');
    const panel = document.getElementById('regionFilterPanel');
    const regionSelect = document.getElementById('regionSelect');
    const countrySelect = document.getElementById('countrySelect');
    const apply = document.getElementById('regionApply');
    const clear = document.getElementById('regionClear');
    const countNode = document.getElementById('regionCount');

    assert(toggle && panel && regionSelect && countrySelect && apply && clear && countNode, 'Region filter UI missing');
    console.log("Region filter UI found");

    await waitForCondition(() => panel.hasAttribute('hidden') || panel.style.display === 'none', 3000);
    assert(panel.hasAttribute('hidden') || panel.style.display === 'none', 'Region filter panel not hidden by default');
    console.log("Panel hidden by default");

    // Open panel
    toggle.click();
    await waitForCondition(() => !panel.hasAttribute('hidden') && panel.style.display !== 'none', 2000);
    assert(!panel.hasAttribute('hidden'), 'Region filter panel did not open');
    console.log("Panel opened");

    const regionValues = Array.from(regionSelect.options)
        .map((opt) => opt.value)
        .filter((value) => value && value !== 'ALL');

    assert(regionValues.length > 0, 'No region options found');
    console.log("Regions available:", regionValues.slice(0, 10).join(", "));

    let reduced = false;
    const attempts = Math.min(regionValues.length, 10);
    for (let i = 0; i < attempts; i += 1) {
        const region = regionValues[i];

        console.log(`Testing region: ${region}`);
        regionSelect.value = region;
        regionSelect.dispatchEvent(new Event('change'));

        const countryValues = Array.from(countrySelect.options)
            .map((opt) => opt.value)
            .filter((value) => value && value !== 'ALL');

        const chosenCountry = countryValues[0] ?? 'ALL';
        countrySelect.value = chosenCountry;
        console.log(`Selected country: ${chosenCountry}`);
        apply.click();

        await waitForCondition(() => /Showing\s+\d+\s*\/\s*\d+/.test(countNode.textContent), 3000);
        const counts = parseCount(countNode.textContent);
        assert(counts, 'Count label not updated');
        console.log(`Count label: ${countNode.textContent}`);
        assert(counts.total > 0, 'Total marker count should be greater than 0');
        assert(counts.filtered <= counts.total, 'Filtered count should not exceed total');

        if (counts.filtered < counts.total) {
            console.log("Filter reduced marker count ✅");
            reduced = true;
            break;
        }
        console.log("Filter did not reduce count, trying next region...");
    }

    if (regionValues.length > 1) {
        assert(reduced, 'No region selection reduced the marker count');
    }

    // Clear
    clear.click();
    await waitForCondition(() => /Showing\s+\d+\s*\/\s*\d+/.test(countNode.textContent), 3000);
    const clearCounts = parseCount(countNode.textContent);
    assert(clearCounts, 'Count label not updated after clear');
    console.log(`After clear: ${countNode.textContent}`);
    assert(clearCounts.filtered === clearCounts.total, 'Clear did not restore all markers');
    assert(regionSelect.value === 'ALL', 'Region did not reset to ALL');
    assert(countrySelect.value === 'ALL', 'Country did not reset to ALL');
    console.log("Clear reset to ALL ✅");

    console.log('Area filter tests complete');
    return true;
}
