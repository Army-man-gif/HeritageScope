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



/* this file is outdated, pls see AreaHighlight in markerHighlight.js */