import { createMap } from './createMap.js';
import { MarkerHighlight } from './highlight.js';

import { loadDataset } from './loadData.js';
import { convertDatasetToLayers } from './createMarkers.js';
import { dynamicallyBuildLanguageSelection } from './languageChangeController.js';



// Ad more metrics - poluttion, ddensity etc..
// Legend
// Change styling a lil
// Snapshot of map
// Build it so it works on double click
let currentLanguage = "en";
let markers = L.markerClusterGroup();
let highlighter;
let codeValuePairs = [];

try {


    function setLanguage(lang){
        currentLanguage = lang;
    }
    console.log("Successfully imported dataset");

    const map = createMap();
    globalThis.hsMap = map;

    globalThis.dispatchEvent(
        new CustomEvent('heritage:map-ready', { detail: { map } })
    );

    highlighter = new MarkerHighlight(map);
    const jsonData = await loadDataset();
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


} catch (error) {

    console.error("Error loading dataset file", error);

}







