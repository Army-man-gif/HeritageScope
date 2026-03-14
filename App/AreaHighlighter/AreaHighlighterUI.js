/* Yi's job */
import { AreaHighlight } from './AreaHighlighter.js';

let areaHighlighter = null;
let activeMap = null;

function ensureStatusNode() {
    const toolbar = document.getElementById('areaHighlightToolbar');
    if (!toolbar) return null;

    let status = document.getElementById('lidCurrent');
    if (!status) {
        status = document.createElement('span');
        status.id = 'lidCurrent';
        status.style.marginLeft = '10px';
        status.textContent = 'Current LID: none';
        toolbar.appendChild(status);
    }
    return status;
}

/* Yi modified with codex: centralize polygon focus so toolbar input and marker clicks share the same highlight behavior. */
function focusAreaHighlight(lid, options = {}) {
    if (!areaHighlighter || !activeMap) {
        return { code: -1, message: 'Area highlighter is not ready.' };
    }

    const {
        latlng = null,
        status = null,
        notifyFallback = false
    } = options;

    areaHighlighter.clearHighlight();

    const styleOverride = {
        color: '#ff4d00',
        fillColor: '#ffcc00',
        fillOpacity: 0.45,
        weight: 3
    };

    const hasExplicitMock = areaHighlighter.hasMockingData(lid);
    const result = hasExplicitMock
        ? areaHighlighter.add(lid, styleOverride)
        : latlng
            ? areaHighlighter.addFallback(lid, latlng, styleOverride)
            : { code: -1, message: `No valid polygon data for lid: ${lid}` };

    if (result.code !== 0 && result.code !== 1) {
        if (status) {
            status.textContent = `Current LID: not found (${lid})`;
        }
        return result;
    }

    if (status) {
        status.textContent = `Current LID: ${lid}`;
    }

    if (result.data) {
        const bounds = result.data.getBounds();
        if (bounds && bounds.isValid()) {
            activeMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
        }
        result.data.bringToFront();
    }

    if (!hasExplicitMock && notifyFallback && typeof globalThis.showInfoToast === 'function') {
        globalThis.showInfoToast('This area highlight is mocked for this site.');
    }

    return result;
}

function run(input,status){
    const raw = input.value.trim();
    const lid = Number.parseInt(raw, 10);

    if (!Number.isInteger(lid)) {
        status.textContent = 'Current LID: invalid input';
        return;
    }

    focusAreaHighlight(lid, { status });
    return status;
}

function bindToolbar() {
    const input = document.getElementById('lidInput');
    const runButton = document.getElementById('areaMarkRun');
    let status = ensureStatusNode();

    if (!input || !runButton || !status) {
        console.warn('Area highlight toolbar components are missing.');
        return;
    }
    


    runButton.addEventListener('click', () => {
        const updatedStatus = run(input,status);
        status = updatedStatus;
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const updatedStatus = run(input,status);
            status = updatedStatus;
        }
    });
}

async function initAreaHighlight(map) {
    activeMap = map;
    areaHighlighter = new AreaHighlight(map);
    globalThis.hsAreaHighlighter = areaHighlighter;
    globalThis.hsFocusAreaHighlight = focusAreaHighlight;
    globalThis.hsClearAreaHighlight = () => areaHighlighter.clearHighlight();
    const loadResult = await areaHighlighter.fetchMockingData();
    if (loadResult.code !== 0) {
        console.error('Failed to initialize AreaHighlight:', loadResult.message);
        return;
    }

    bindToolbar();
}

function bootstrap() {
    if (globalThis.hsMap) {
        initAreaHighlight(globalThis.hsMap);
        return;
    }

    globalThis.addEventListener(
        'heritage:map-ready',
        (event) => {
            initAreaHighlight(event.detail.map);
        },
        { once: true }
    );
}

bootstrap();
