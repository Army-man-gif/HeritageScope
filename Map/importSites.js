import {lat, long} from './constants.js';
import {createMap} from './createMap.js';

// Load GeoJSON file
// Now I can import whole file stuff. Instead I will try to add specific live sites
try{
    const fetchData = await fetch("dataset.geojson");
    const jsonData = await fetchData.json();
    console.log("Successfully imported file data and json parsed it");
    const map = createMap();

    // There's a lot of points so I will use marker cluster to speed things up

    // Initialize marker cluster object
    function convPointToLayer(feature,latlng){
        return L.marker(latlng);
    }

    function onEachFeature(feature,layer){
        const languageFullNames = ["English","French","Spanish",""]
        if(feature.properties){
            let popupText = '';
            const languages = Object.keys(feature.properties)
                .filter(key => key.startsWith('name_'));
            const descriptions = Object.keys(feature.properties)
                .filter(key => key.startsWith('short_description_'))
            languages.forEach(langKey => {
                // Start at index 5 where the acc language code starts
                const langCode = langKey.slice("name_".length);
                const langDisplay = new Intl.DisplayNames(['en'], { type: "language" }).of(langCode);
                popupText += `<b>${langDisplay} name: ${feature.properties[langKey]}</b><br>`;
            });
            popupText += "<br>"
            descriptions.forEach(descriptionKey => {
                // Start at index 5 where the acc language code starts
                const descriptionCode = descriptionKey.slice('short_description_'.length);
                const descriptionDisplay = new Intl.DisplayNames(['en'], { type: "language" }).of(descriptionCode);
                let description = feature.properties[descriptionKey];
                if(!description){
                    description = "No available description";
                }
                popupText += `<b>Short ${descriptionDisplay} description: <br><br> ${description}</b><br><br>`;
            });
            // Attach text to a popup event
            layer.bindPopup(popupText,{
                maxWidth: 300,
                maxHeight: 200,
                autoPan: true
            });
        }

        // Customise how the popup acitvation works
        layer.on('click',function(e){
            if(this.isOpenPopup()){
                this.closePopup();
            }else{
                this.openPopup();
            }
        })

    }
    let markers = L.markerClusterGroup();
    L.geoJson(jsonData,{
        pointToLayer: convPointToLayer,
        onEachFeature: onEachFeature
    }).eachLayer(layer => markers.addLayer(layer));

    map.addLayer(markers);
    map.fitBounds(markers.getBounds());



}catch (error){
    console.error("Error loading dataset file", error);
}
