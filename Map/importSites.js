// Armaan

import {createMap} from './createMap.js';
import { MarkerHighlight, createDefaultIcon } from './markerHighlight.js';
let currentLanguage = "en";


// Accessiblity metrics: air quality, business
// certain areas highlighted
// Layers toggle on and off
// Write some test scripts
// Load GeoJSON file
// Location text size
// Now I can import whole file stuff. Instead I will try to add specific live sites
try{
    const fetchData = await fetch("dataset.geojson");
    const jsonData = await fetchData.json();
    console.log("Successfully imported file data and json parsed it");
    const map = createMap();
    window.hsMap = map;
    window.dispatchEvent(new CustomEvent('heritage:map-ready', { detail: { map } }));
    const highlighter = new MarkerHighlight(map);
    const initialFeature  = jsonData.features[0];
    const languages = Object.keys(initialFeature.properties)
        .filter(key => key.startsWith("name_"))
        .map(key => key.slice("name_".length));

    const converter = new Intl.DisplayNames(['en'], { type: 'language' });
    const codeValuePairs = languages.map(code => ({
        code,
        label : converter.of(code)
    }));
    // Now I have all the lanauges and their display versions as well

    function dynamicallyBuildLanguageSelection(){
        const languageControlArea = L.DomUtil.create('div','toolbar');
        const optionBox = L.DomUtil.create('div','language-control',languageControlArea);
        const title = L.DomUtil.create('div', 'language-control__title', optionBox);
        title.textContent = 'Language';
        L.DomEvent.disableClickPropagation(optionBox);
        codeValuePairs.forEach(pair => {
            const label = L.DomUtil.create('label','Langlabel',optionBox);
            label.append(`${pair.label }`)
            const select =  L.DomUtil.create('input','selection',label);
            select.type  = "radio";
            select.name = "language";
            select.value = pair.code;

            if(pair.code === currentLanguage){
                select.checked = true;
            }
            select.addEventListener('change',function(){
                updateLanguage(select.value);
            });
            
        })
        return languageControlArea;

    }

    // There's a lot of points so I will use marker cluster to speed things up

    // Initialize marker cluster object
    function convPointToLayer(feature, latlng) {
        const marker = L.marker(latlng, { icon: createDefaultIcon() });
        marker.on('click', function() {
            highlighter.highlight(marker, latlng);
        });
        return marker;
    }
    function updateLanguage(lang){
        currentLanguage = lang;

        markers.eachLayer(layer => {
            if(layer.feature){
                layer.setPopupContent(buildLanguageSpecificPopup(layer.feature));
            }
        });

    }
    function buildLanguageSpecificPopup(feature){
        if(feature.properties){
            const langKey = `name_${currentLanguage}`
            const descriptionKey = `short_description_${currentLanguage}`

            const name = feature.properties[langKey] || "No available name";
            const description = feature.properties[descriptionKey] || "No available description";

            const langDisplay = new Intl.DisplayNames(['en'],{type: "language"}).of(currentLanguage);

            const popupText = `
            <b>${langDisplay} name: ${name}</b><br>
            <b>Short ${langDisplay} description: <br><br> ${description}
            </b><br><br>
            `;
            return popupText;
        }
    }
    function onEachFeature(feature,layer){
        if(feature.properties){
            layer.bindPopup(buildLanguageSpecificPopup(feature), {
                maxWidth: 300,
                maxHeight: 200,
                autoPan: true
            });
        }
    }
    let markers = L.markerClusterGroup();
    L.geoJson(jsonData,{
        pointToLayer: convPointToLayer,
        onEachFeature: onEachFeature
    }).eachLayer(layer => markers.addLayer(layer));

    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
    map.setZoom(2);

    map.setMaxBounds([
    [-90, -200],
    [90, 200]
]);
    // Extend layer control
    const LanguageControl  = L.Control.extend({
        onAdd: function() {
            return dynamicallyBuildLanguageSelection();
        }
    });
    const languageController = new LanguageControl({position : "topright"});
    map.addControl(languageController);

}catch (error){
    console.error("Error loading dataset file", error);
}
