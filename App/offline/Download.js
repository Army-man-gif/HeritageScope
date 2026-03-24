export function resetTransforms(map) {
    const panes = document.querySelectorAll('.leaflet-pane, .leaflet-overlay-pane svg');
    const svgs = document.querySelectorAll('.leaflet-overlay-pane svg');

    svgs.forEach(svg => {
        svg.dataset._transform = svg.style.transform;
        svg.style.transform = 'translate(0px, 0px)';
    });
    panes.forEach(el => {
        el.dataset._transform = el.style.transform;
        el.style.transform = 'none';
    });
    const mapPane = document.querySelector('.leaflet-map-pane');

    if (mapPane) {
        mapPane.dataset._left = mapPane.style.left;
        mapPane.dataset._top = mapPane.style.top;

        mapPane.style.left = '0px';
        mapPane.style.top = '0px';
    }
    map.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            layer._origLatLngs = layer.getLatLngs();
            const pixelPoints = layer._map.latLngsToContainerPoints(layer.getLatLngs());
            layer.setLatLngs(pixelPoints.map(p => map.containerPointToLatLng(p)));
        }
    });
}
export function restoreTransforms(map) {
    const panes = document.querySelectorAll('.leaflet-pane, .leaflet-overlay-pane svg');
    const svgs = document.querySelectorAll('.leaflet-overlay-pane svg');

    svgs.forEach(svg => {
        svg.style.transform = svg.dataset._transform || '';
    });
    panes.forEach(el => {
        el.style.transform = el.dataset._transform || '';
    });
    const mapPane = document.querySelector('.leaflet-map-pane');

    if (mapPane) {
        mapPane.style.left = mapPane.dataset._left || '';
        mapPane.style.top = mapPane.dataset._top || '';
    }
    map.eachLayer(layer => {
        if (layer._origLatLngs) {
            layer.setLatLngs(layer._origLatLngs);
            delete layer._origLatLngs;
        }
    });
}
export async function downloadMap(map){
    const mapContainer = map.getContainer();
    map.invalidateSize();
    await new Promise(r => setTimeout(r, 100));
    resetTransforms(map);

    await html2canvas(
        mapContainer,{
        useCORS : true,
        allowTaint: true,

    }).then(clonedPart => {
        // Make a link and force it to click automatically then remove everything
        const link = document.createElement("a");
        link.href = clonedPart.toDataURL("image/png");
        link.download = "snapshot.png";
        link.click();

        link.remove();
    }).catch(error => {
        console.error("Error in download ",error);
    })
    restoreTransforms(map);
}