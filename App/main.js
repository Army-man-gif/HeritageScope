import './riskLevelOverlay.js';
import './collapsibleToolbar.js';
import './utilityDialog.js';
import './AreaHighlighter/AreaHighlighterUI.js';
import { MarkerHighlight } from './AreaHighlighter/AreaHighlighter.js';
import './Accessbility/accessbilityUIButtons.js';
import { createMap } from './createMap.js';
import { loadDataset } from './loadData.js';
import { convertDatasetToLayers } from './createMarkers.js';
import { dynamicallyBuildLanguageSelection } from './languageChangeController.js';



// Add more metrics - poluttion, density etc..
// Legend describing number thing - Complete
// Change styling a lil - Complete
// Snapshot of map // Offline
// Focus in on the "Show at risk sites" - Complete
// Add toggle close to language control - Complete
// Integrate simulation into main app - Complete
// Build it so it works on double click - Complete
// Integrate the init folder into main.js - Complete
let currentLanguage = "en";
let markers = L.markerClusterGroup();
let highlighter;
let codeValuePairs = [];



function setLanguage(lang){
    currentLanguage = lang;
}

async function startMain(){
    let jsonData;
    try {
        jsonData = await loadDataset(); // wait for it to finish
        console.log("Dataset loaded successfully");
    } catch (err) {
        console.error("Error loading dataset", err);
        return;
    }
    const map = createMap();
    globalThis.hsMap = map;
    globalThis.dispatchEvent(
        new CustomEvent('heritage:map-ready', { detail: { map } })
    );

    highlighter = new MarkerHighlight(map);

    /* Yi modified with codex: clicking empty map space clears the yellow marker state and any active area polygon. */
    map.on('click', () => {
        highlighter.clear();
        if (typeof globalThis.hsClearAreaHighlight === 'function') {
            globalThis.hsClearAreaHighlight();
        }
    });

    const initialFeature = jsonData.features[0];

    const languages = Object.keys(initialFeature.properties)
        .filter(key => key.startsWith("name_"))
        .map(key => key.slice("name_".length));

    const converter = new Intl.DisplayNames(['en'], { type: 'language' });

    codeValuePairs = languages.map(code => ({
        code,
        label: converter.of(code)
    }));


    convertDatasetToLayers(jsonData, markers, highlighter,currentLanguage);

    map.addLayer(markers);

    map.fitBounds(markers.getBounds());

    map.setZoom(2);

    map.setMaxBounds([
        [-90, -200],
        [90, 200]
    ]);

    const LanguageControl = L.Control.extend({
        onAdd: function() {
            return dynamicallyBuildLanguageSelection(
                codeValuePairs,
                currentLanguage,
                markers,
                setLanguage
            );
        }
    });

    const languageController = new LanguageControl({ position: "topright" });

    map.addControl(languageController);

    requestAnimationFrame(() => map.invalidateSize());
    globalThis.addEventListener('resize', () => map.invalidateSize());

    // to read out popups (areas clicked on)
    map.on("popupopen", function(e){
        // so things like <br> not included
        const html = e.popup.getContent();

        const temp = document.createElement("div");
        temp.innerHTML = html;

        const text = temp.innerText;

        speakLang(text, currentLanguage);
    });

    // reading out when zooming happens
    let previousZoom = map.getZoom();

    map.on("zoomend", function () {
        const currentZoom = map.getZoom();

        if (currentZoom > previousZoom) {
            speak("This zooms in on the map.");
        } 
        else if (currentZoom < previousZoom) {
            speak("This zooms out on the map.");
        }

        previousZoom = currentZoom;
    });
}

startMain().catch((err) => "Failed to start main");










