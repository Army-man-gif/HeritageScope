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