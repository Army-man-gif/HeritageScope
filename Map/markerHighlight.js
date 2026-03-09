// Example: Yi

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

export class AreaHighlight {
  constructor(map) {
    this.map = map;
    this.highlightLayer = L.layerGroup().addTo(map);

    /* layerTable = {
    "lid1": polygonObj,
    "lid2": polygonObj
    } */
    this.layerTable = {};
  }

  /* locationID -> polygon */
  async fetchMockingData(path) {
    try {
      const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.m_data = data;
      } catch (error) {
        console.error('Error fetching mocking data:', error);
        this.m_data = null;
      }
    }



/* this only read mocking data for demonstration */
  lid2poly(lid){
    if (!this.m_data) {
      console.warn("Mocking data not loaded. Call fetchMockingData() first.");
      return void 0;
    }
    const polyData = this.m_data[lid];
    if (!polyData) {
      console.warn(`No polygon data found for location ID: ${lid}`);
      return {code: -1, message: `No polygon data for lid: ${lid}`};
    }
    /* const latlngs = polyData.map(coord => [coord.lat, coord.lng]); */
    data = L.polygon(polyData, {
      color: 'yellow',
      fillColor: 'yellow',
      fillOpacity: 0.6,
      weight: 2
    });

    return {code: 0, message: "Polygon created successfully", data: data};
  }

  add(lid){
    data = this.lid2poly(lid);
    if (data.code !== 0) {
      console.warn(`Failed to create polygon for lid: ${lid}. Reason: ${data.message}`);
      return;
    }

    const poly = data.data;
    if (this.layerTable[lid]) {
      console.warn(`Polygon for location ID: ${lid} already exists. Skipping add.`);
      return;
    }
    this.highlightLayer.addLayer(poly);
    this.layerTable[lid] = poly;
  }

  remove(lid){
    const poly = this.layerTable[lid];
    if (poly) {
        this.highlightLayer.removeLayer(poly);
        delete this.layerTable[lid];
    }
  }

  style(lid, style){
    const poly = this.layerTable[lid];
    if (poly) {
        poly.setStyle(style);
    }
    else {
        console.warn(`No polygon found for location ID: ${lid}`);
    }
  }

  clearHighlight(){
    this.highlightLayer.clearLayers();
    this.layerTable = {};
  }
}