/* kelly's job */

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

/* Yi's job */
export class AreaHighlight {
    constructor(map, defaultStyle = {}) {
        this.map = map;
        this.highlightLayer = L.layerGroup().addTo(map);
        this.layerTable = {};
        this.m_data = null;
        this.defaultStyle = {
            color: '#FFD700',
            fillColor: '#FFD700',
            fillOpacity: 0.35,
            weight: 2,
            ...defaultStyle
        };
    }

    /* locationID -> polygon coords */
    async fetchMockingData(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data || typeof data !== 'object') {
                throw new Error('Mocking data must be a JSON object');
            }
            this.m_data = data;
            return { code: 0, message: 'Mocking data loaded successfully' };
        } catch (error) {
            console.error('Error fetching mocking data:', error);
            this.m_data = null;
            return { code: -1, message: error.message };
        }
    }

    /* this only reads mocking data for demonstration */
    lid2poly(lid, styleOverride = {}) {
        if (!this.m_data) {
            return { code: -1, message: 'Data not loaded. Call fetchMockingData() first.' };
        }

        const key = String(lid);
        const polyData = this.m_data[key];
        if (!Array.isArray(polyData) || polyData.length < 3) {
            return { code: -1, message: `No valid polygon data for lid: ${lid}` };
        }

        const isValid = polyData.every(
            (coord) => Array.isArray(coord) &&
                coord.length === 2 &&
                Number.isFinite(coord[0]) &&
                Number.isFinite(coord[1])
        );
        if (!isValid) {
            return { code: -1, message: `Invalid coordinate format for lid: ${lid}` };
        }

        const polygon = L.polygon(polyData, { ...this.defaultStyle, ...styleOverride });
        return { code: 0, message: 'Polygon created successfully', data: polygon };
    }

    add(lid, styleOverride = {}) {
        const key = String(lid);
        if (this.layerTable[key]) {
            return { code: 1, message: `Polygon for lid ${lid} already exists`, data: this.layerTable[key] };
        }

        const result = this.lid2poly(key, styleOverride);
        if (result.code !== 0) {
            console.warn(`Failed to create polygon for lid ${lid}. Reason: ${result.message}`);
            return result;
        }

        this.highlightLayer.addLayer(result.data);
        this.layerTable[key] = result.data;
        return { code: 0, message: `Polygon added for lid ${lid}`, data: result.data };
    }

    remove(lid) {
        const key = String(lid);
        const poly = this.layerTable[key];
        if (!poly) {
            return { code: 1, message: `No polygon found for lid: ${lid}` };
        }

        this.highlightLayer.removeLayer(poly);
        delete this.layerTable[key];
        return { code: 0, message: `Polygon removed for lid ${lid}` };
    }

    style(lid, styleOverride) {
        const key = String(lid);
        const poly = this.layerTable[key];
        if (!poly) {
            return { code: -1, message: `No polygon found for lid: ${lid}` };
        }
        if (!styleOverride || typeof styleOverride !== 'object') {
            return { code: -1, message: 'styleOverride must be an object' };
        }

        poly.setStyle(styleOverride);
        return { code: 0, message: `Style updated for lid ${lid}`, data: poly };
    }

    clearHighlight() {
        this.highlightLayer.clearLayers();
        this.layerTable = {};
        return { code: 0, message: 'All area highlights cleared' };
    }
}
