// Armaan
import {lat, long} from './constants.js';
export function createMap(){
    const map = L.map('map')
    map.locate({setView: true, maxZoom: 16});
    const streetView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        minZoom: 2,
        maxZoom: 19,
    });

    streetView.addTo(map);
    return map;
}