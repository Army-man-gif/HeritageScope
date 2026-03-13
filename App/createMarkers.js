import { createDefaultIcon } from './AreaHighlighter/AreaHighlighter.js';
import { buildLanguageSpecificPopup } from './createPopup.js';

function convPointToLayer(highlighter) {
    return function(feature,latlng){
        const marker = L.marker(latlng, { icon: createDefaultIcon() });
        marker.on('click', function() {
            highlighter.highlight(marker, latlng);
        });
        return marker;
    }
}

function onEachFeature(currentLanguage){
    return function(feature,layer){
        if(feature.properties){
            layer.bindPopup(buildLanguageSpecificPopup(feature,currentLanguage), {
                maxWidth: 300,
                maxHeight: 200,
                autoPan: true
            });
        }
    }
}

export function convertDatasetToLayers(jsonData,markers,highlighter,currentLanguage){
    L.geoJson(jsonData,{
        pointToLayer: convPointToLayer(highlighter),
        onEachFeature: onEachFeature(currentLanguage)
    }).eachLayer(layer => markers.addLayer(layer));
}