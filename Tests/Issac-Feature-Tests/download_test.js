// Download snapshot tests for App/Map.html
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

async function runDownloadTests() {
    await waitForMapReady();

    const button = document.getElementById('downloadTrigger');
    assert(button, 'Download button missing');

    // Intercept download clicks so tests do not save a file
    const originalClick = HTMLAnchorElement.prototype.click;
    let downloadTriggered = false;
    HTMLAnchorElement.prototype.click = function () {
        downloadTriggered = true;
    };

    button.click();

    // Wait for async html2canvas to finish
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Restore original click
    HTMLAnchorElement.prototype.click = originalClick;

    assert(downloadTriggered, 'Download did not trigger');

    console.log('Download tests complete');
}

runDownloadTests().catch((err) => console.error('Download tests failed:', err));
