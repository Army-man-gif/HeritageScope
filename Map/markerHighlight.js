// Custom highlighted marker icon (yellow)
export function createHighlightIcon() {
    return L.divIcon({
        className: '',
        html: `<div style="
            width: 20px;
            height: 20px;
            background: #FFD700;
            border: 2px solid #FF8C00;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(255,215,0,0.8);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

// Default marker icon
export function createDefaultIcon() {
    return L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
}

// Highlight manager: tracks currently highlighted marker + circle
export class MarkerHighlight {
    constructor(map) {
        this.map = map;
        this.currentMarker = null;
        this.currentCircle = null;
    }

    highlight(marker, latlng) {
        // Reset previous highlight
        if (this.currentMarker) {
            this.currentMarker.setIcon(createDefaultIcon());
        }
        if (this.currentCircle) {
            this.map.removeLayer(this.currentCircle);
        }

        // Apply new highlight
        marker.setIcon(createHighlightIcon());
        this.currentCircle = L.circle(latlng, {
            radius: 200,
            color: '#FFD700',
            fillColor: '#FFD700',
            fillOpacity: 0.2,
            weight: 2
        }).addTo(this.map);

        this.currentMarker = marker;
    }

    clear() {
        if (this.currentMarker) {
            this.currentMarker.setIcon(createDefaultIcon());
            this.currentMarker = null;
        }
        if (this.currentCircle) {
            this.map.removeLayer(this.currentCircle);
            this.currentCircle = null;
        }
    }
}