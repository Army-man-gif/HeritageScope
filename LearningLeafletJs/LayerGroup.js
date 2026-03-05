import {lat, long} from './constants.js';


const littleton = L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.'),
    denver    = L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.'),
    aurora    = L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.'),
    golden    = L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.');


const cities = L.layerGroup([littleton, denver, aurora, golden]);

const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'});

const map = L.map('map', {
    center: [39.73, -104.99],
    zoom: 10,
    layers: [osm, cities]
});


const baseMaps = {
    "OpenStreetMap": osm,
    "<span style='color: red'>OpenStreetMap.HOT</span>": osmHOT
};

const overlayMaps = {
    "Cities": cities
};


const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

const crownHill = L.marker([39.75, -105.09]).bindPopup('This is Crown Hill Park.'),
    rubyHill = L.marker([39.68, -105.00]).bindPopup('This is Ruby Hill Park.');
    
const parks = L.layerGroup([crownHill, rubyHill]);
const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
});

layerControl.addBaseLayer(openTopoMap, "OpenTopoMap");
layerControl.addOverlay(parks, "Parks");