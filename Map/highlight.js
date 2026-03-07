export class Highlight {
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
  lid2poly(lid){
    return void 0;
  }

add(lid){
  if (this.layerTable[lid]) return;

  const poly = this.lid2poly(lid);

  if (poly) {
      this.highlightLayer.addLayer(poly);
      this.layerTable[lid] = poly;
  }
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