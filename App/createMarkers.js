import { createDefaultIcon } from './AreaHighlighter/AreaHighlighter.js';
import { buildLanguageSpecificPopup } from './createPopup.js';

/* Yi modified with codex: marker clicks now zoom to a single area highlight and fall back to a generated mock polygon when needed. */
function convPointToLayer(highlighter) {
    return function(feature,latlng){
        const marker = L.marker(latlng, {
            icon: createDefaultIcon(),
            bubblingMouseEvents: false
        });
        marker.on('click', async function(event) {
            if (event?.originalEvent) {
                L.DomEvent.preventDefault(event.originalEvent);
                L.DomEvent.stopPropagation(event.originalEvent);
            }
            highlighter.highlight(marker, latlng);
            const lid = feature?.properties?.id_no ?? feature?.properties?.id ?? feature?.properties?.locationID;
            if (lid && typeof globalThis.hsFocusAreaHighlight === 'function') {
                await globalThis.hsFocusAreaHighlight(lid, {
                    latlng,
                    notifyFallback: true
                });
            } else if (typeof globalThis.showInfoToast === 'function') {
                globalThis.showInfoToast('This area highlight is mocked for this site.');
            }
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
