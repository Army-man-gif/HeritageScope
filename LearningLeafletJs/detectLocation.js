import {lat, long} from './constants.js';

const map = L.map('map').fitWorld();
const streetView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
});

streetView.addTo(map);


function onLocationFound(e) {
    const radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}
function onLocationError(e) {
    alert(e.message);
}


// Asks user perms to access location then auto zooms into their location
map.locate({setView: true, maxZoom: 16});

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
