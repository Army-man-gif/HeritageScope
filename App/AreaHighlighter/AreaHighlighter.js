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

/* 
 * Highlight Manager
 *
 * This class manages highlighted regions on a Leaflet map.
 * Each highlighted region is represented by a polygon layer
 * and stored using a location ID (lid).
 *
 * Internal structure:
 *   layerTable = {
 *     lid1: polygonLayer,
 *     lid2: polygonLayer
 *   }
 *
 * Workflow:
 *
 * 1. Create the manager
 *      const highlight = new Highlight(map);
 *
 * 2. Add a highlighted region
 *      highlight.add(lid);
 *   - lid is converted to a polygon via lid2poly()
 *   - polygon is added to highlightLayer
 *   - polygon reference is stored in layerTable
 *
 * 3. Update style of a highlighted region
 *      highlight.style(lid, {
 *        color: "yellow",
 *        fillOpacity: 0.6
 *      });
 *
 * 4. Remove a specific highlighted region
 *      highlight.remove(lid);
 *
 * 5. Clear all highlights
 *      highlight.clearHighlight();
 *
 * Notes:
 * - highlightLayer is a Leaflet LayerGroup used to contain all highlight polygons.
 * - layerTable allows quick lookup of polygons by location ID.
 * - lid2poly(lid) should return a Leaflet polygon for the given location.
 */



/* statusCode:
SUCCESS = 0
ERROR = -1
ALREADY_EXISTS = 1
NOT_FOUND = -1 */
export class AreaHighlight {
    constructor(map, defaultStyle = {}) {
        this.map = map;
        this.highlightLayer = L.layerGroup().addTo(map);
        this.layerTable = {};
        this.m_data = null;
        this.fallbackLayers = {};
        this.defaultStyle = {
            color: '#FFD700',
            fillColor: '#FFD700',
            fillOpacity: 0.35,
            weight: 2,
            ...defaultStyle
        };
    }

    /* locationID -> polygon coords */
    async fetchMockingData() {
        try {
            const response = await fetch("./AreaHighlighter/mocking_HighLightArea.json");
            this.m_data = await response.json();
            return { code: 0, message: "Mocking data loaded successfully" };
        } catch (error) {
            console.error("Error loading mocking data:", error);
            this.m_data = null;
            return { code: -1, message: error.message };
        }
    }

    /* Yi modified with codex: keep a simple lookup so only a limited set of explicit mock polygons is stored on disk. */
    hasMockingData(lid) {
        if (!this.m_data) {
            return false;
        }
        return Array.isArray(this.m_data[String(lid)]);
    }

    /* Yi modified with codex: generate a temporary polygon around any marker without explicit mock data. */
    createFallbackPolygon(latlng, styleOverride = {}) {
        const latitude = latlng.lat;
        const longitude = latlng.lng;
        const latOffset = 0.22;
        const lngScale = Math.max(0.35, Math.abs(Math.cos(latitude * Math.PI / 180)));
        const lngOffset = 0.28 / lngScale;

        const polygon = L.polygon([
            [latitude + latOffset, longitude - lngOffset * 0.9],
            [latitude + latOffset * 0.45, longitude + lngOffset],
            [latitude - latOffset, longitude + lngOffset * 0.75],
            [latitude - latOffset * 0.85, longitude - lngOffset * 0.8]
        ], { ...this.defaultStyle, ...styleOverride });

        return { code: 0, message: 'Fallback polygon created successfully', data: polygon };
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

    /* Yi modified with codex: marker clicks can still show a single highlight even when no explicit mock polygon exists. */
    addFallback(lid, latlng, styleOverride = {}) {
        const key = String(lid);
        const result = this.createFallbackPolygon(latlng, styleOverride);
        if (result.code !== 0) {
            return result;
        }

        this.highlightLayer.addLayer(result.data);
        this.layerTable[key] = result.data;
        this.fallbackLayers[key] = true;
        return { code: 0, message: `Fallback polygon added for lid ${lid}`, data: result.data };
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
        this.fallbackLayers = {};
        return { code: 0, message: 'All area highlights cleared' };
    }
}
