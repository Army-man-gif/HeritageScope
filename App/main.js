import './riskLevelOverlay.js';
import './collapsibleToolbar.js';
import './AreaHighlighter/AreaHighlighterUI.js';
import { MarkerHighlight } from './AreaHighlighter/AreaHighlighter.js';
import './Accessbility/accessbilityUIButtons.js';
import { createMap } from './createMap.js';
import { loadDataset } from './loadData.js';
import { convertDatasetToLayers } from './createMarkers.js';
import { dynamicallyBuildLanguageSelection } from './languageChangeController.js';



// Ad more metrics - poluttion, density etc..
// Legend
// Change styling a lil
// Snapshot of map // Offline
// Add toggle close to language control
// Integreate simulation into main app - Complete
// Build it so it works on double click - Complete
// Integrate the init folder into main.js - Complete
let currentLanguage = "en";
let markers = L.markerClusterGroup();
let highlighter;
let codeValuePairs = [];



function setLanguage(lang){
    currentLanguage = lang;
}

function startMain(){
    let jsonData;
    try {
        jsonData = loadDataset(); // wait for it to finish
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
}

startMain();










