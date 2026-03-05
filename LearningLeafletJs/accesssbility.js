import {lat, long} from './constants.js';

const map = L.map('map').fitWorld();
const streetView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
});

streetView.addTo(map);

const marker = L.marker([50.4501, 30.5234],
  {alt: 'Kyiv'}).addTo(map) // "Kyiv" is the accessible name of this marker
  .bindPopup('Kyiv, Ukraine is the birthplace of Leaflet!');