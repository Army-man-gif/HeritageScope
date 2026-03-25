import './riskLevelOverlay.js';
import './collapsibleToolbar.js';
import './utilityDialog.js';
import './AreaHighlighter/AreaHighlighterUI.js';
import {initRegionFilter,regionOverlay,clearOverlay} from './regionFilter.js';
import { MarkerHighlight } from './AreaHighlighter/AreaHighlighter.js';
import './Accessibility/accessbilityUIButtons.js';
import { createMap } from './createMap.js';
import { loadDataset } from './loadData.js';
import { convertDatasetToLayers } from './createMarkers.js';
import { dynamicallyBuildLanguageSelection } from './languageChangeController.js';
import { downloadMap } from './offline/Download.js';
import {init} from './pathing/pathroutingInit.js';
import { keyboardAccessbility } from './Accessibility/keyboardAccessbility.js';
import { runTests } from '../Tests/Armaan-Feature-Tests/Tests.js';
import { initUserReports } from './userReports.js';
import { initColourBlindToggle } from './colourBlindMode.js';
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
let firstZoom =true;
let originalMarkers;
function setLanguage(lang){
    currentLanguage = lang;
}

async function startMain(){
    let jsonData;
    try {
        jsonData = await loadDataset();
    } catch (err) {
        console.error("Error loading dataset", err);
        return;
    }
    const map = createMap();

    initUserReports(map);
    initColourBlindToggle();
    
    let resizeTimeout;

    globalThis.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            // wait for layout + tests to settle
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    map.invalidateSize(true);
                });
            });
        }, 150);
    });
    globalThis.hsMap = map;
    globalThis.mapMade = true;
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
    originalMarkers = markers.getLayers().slice();
    map.addLayer(markers);
    keyboardAccessbility(map,highlighter,markers);

    initRegionFilter(markers,originalMarkers, map);
    init(map);
    map.fitBounds(markers.getBounds());

    map.setZoom(2);

    map.setMaxBounds([
        [-90, -200],
        [90, 200]
    ]);

    document.getElementById('downloadTrigger').addEventListener('click',async () => {
        setTimeout(() => downloadMap(map), 50);
    })
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
        if(firstZoom){
            firstZoom = false;
            previousZoom = map.getZoom();
            return;
        }
        const currentZoom = map.getZoom();

        if (currentZoom > previousZoom) {
            speak("This zooms in on the map.");
        } 
        else if (currentZoom < previousZoom) {
            speak("This zooms out on the map.");
        }

        previousZoom = currentZoom;
    });

    //runTests(map, markers);
}

try{
    startMain()
}catch (err) {
    console.error("Failed to start main",err);
};










