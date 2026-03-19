import { createDefaultIcon } from './AreaHighlighter/AreaHighlighter.js';
import { buildLanguageSpecificPopup } from './createPopup.js';
import {results} from './metrics/metrics.js';
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
        layer.on('popupopen', () => {
            const currentPopup = layer.getPopup().getElement();
            const partToAddTo = currentPopup?.querySelector("#extraMetrics");
            if(partToAddTo){
                const latlng = layer.getLatLng();
                results(latlng.lat,latlng.lng).then(updated =>{
                    partToAddTo.hidden = false;
                    partToAddTo.innerHTML = 
                    `
                    <br>
                    <b> Population : ${updated.population.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",")} people</b>
                    <br>
                    <b> Population density : ${updated.popDensity} m/s</b>
                    <br>
                    <b> Population as a % of the world's: ${updated.worldPopPrcnt} %</b> 
                    <br>   
                    <b> Average age : ${Math.floor(updated.medianAge)} yrs old</b>
                    <br>
                    <b> Percentage of people living in urban areas : ${updated.urbanPopPcnt} %</b>
                    <br>
                    <b> Fertility rate : ${Math.floor(updated.fertilityRate)}</b>
                    <br>
                    <b> Temperature : ${updated.temp} °C </b>
                    <br>
                    <b> Wind Speed : ${updated.windSpeed} m/s </b>
                    <br>
                    <b> Humidity : ${updated.humidity} </b>
                    <br>                                    
                    <b>Environmental sensitivity score: ${updated.environmentalSensitivity}</b> 
                    <br>
                    `;
                })
                .catch("Error")
            }
        })
    }
}

export function convertDatasetToLayers(jsonData,markers,highlighter,currentLanguage){
    L.geoJson(jsonData,{
        pointToLayer: convPointToLayer(highlighter),
        onEachFeature: onEachFeature(currentLanguage)
    }).eachLayer(layer => markers.addLayer(layer));
}
