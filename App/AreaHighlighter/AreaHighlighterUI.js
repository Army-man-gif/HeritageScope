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
function run(status){
    const raw = input.value.trim();
    const lid = Number.parseInt(raw, 10);

    if (!Number.isInteger(lid)) {
        status.textContent = 'Current LID: invalid input';
        return;
    }

    areaHighlighter.clearHighlight();
    const result = areaHighlighter.add(lid, {
        color: '#ff4d00',
        fillColor: '#ffcc00',
        fillOpacity: 0.45,
        weight: 3
    });
    if (result.code === 0 || result.code === 1) {
        status.textContent = `Current LID: ${lid}`;
        if (result.data && activeMap) {
            const bounds = result.data.getBounds();
            if (bounds && bounds.isValid()) {
                activeMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
            }
        }
        if (result.data) {
            result.data.bringToFront();
        }
    } else {
        status.textContent = `Current LID: not found (${lid})`;
    }
    return status
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
        const updatedStatus = run(status);
        status = updatedStatus;
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const updatedStatus = run(status);
            status = updatedStatus;
        }
    });
}

async function initAreaHighlight(map) {
    activeMap = map;
    areaHighlighter = new AreaHighlight(map);
    const loadResult = await areaHighlighter.fetchMockingData();
    if (loadResult.code !== 0) {
        console.error('Failed to initialize AreaHighlight:', loadResult.message);
        return;
    }

    bindToolbar();
}

function bootstrap() {
    if (window.hsMap) {
        initAreaHighlight(window.hsMap);
        return;
    }

    window.addEventListener(
        'heritage:map-ready',
        (event) => {
            initAreaHighlight(event.detail.map);
        },
        { once: true }
    );
}

bootstrap();
