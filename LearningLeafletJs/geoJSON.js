import {lat, long} from './constants.js';

const map = L.map('map').fitWorld();
const streetView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
});

streetView.addTo(map);

map.setView([39.75621, -104.99404], 13);

const geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};


const myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];



const myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

const linesInit = L.geoJSON(myLines, {
    style: myStyle
})

linesInit.addTo(map);

const states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

function styleFunction(feature){
    switch (feature.properties.party) {
        case 'Republican': return {color: "#ff0000"};
        case 'Democrat':   return {color: "#0000ff"};
    }
}

const statesInit = L.geoJSON(states, { style: styleFunction});
statesInit.addTo(map);


const geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

const geojsonMarkerOptions2 = {
    radius: 8,
    fillColor: "#00ff1a",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

function pointToLayerFunc(feature, latlng) {
    return L.circleMarker(latlng, geojsonMarkerOptions);
}
function pointToLayerFunc2(feature, latlng) {
    return L.circleMarker(latlng, geojsonMarkerOptions2);
}

const pointToLayer = L.geoJSON(geojsonFeature, {
    pointToLayer: pointToLayerFunc,
    onEachFeature: onEachFeature
})

pointToLayer.addTo(map);


const someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

function someFunction(feature){
    return feature.properties.show_on_map;
}

L.geoJSON(someFeatures, {
    pointToLayer: pointToLayerFunc2,
    filter: someFunction
}).addTo(map);