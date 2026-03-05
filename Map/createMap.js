import {lat, long} from './constants.js';
export function createMap(){
    const map = L.map('map').setView([lat, long], 19);

    const streetView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    });

    streetView.addTo(map);
}

createMap();