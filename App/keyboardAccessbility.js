let markerTabbingActive = false;

function getTabbableMarkers(markers, map) {
    // Get only visible, non-clustered markers in bounds
    return markers.getLayers().filter(marker => {
        return marker._icon &&
               markers.getVisibleParent(marker) === marker &&
               map.getBounds().contains(marker.getLatLng());
    });
}

function updateMarkerTabIndex(markers, map) {
    const clusterEls = document.querySelectorAll('.marker-cluster');
    clusterEls.forEach(el => {
        el.tabIndex = -1;
    });
    const tabbable = getTabbableMarkers(markers, map);
    markers.getLayers().forEach(marker => {
        const el = marker._icon;
        if (!el) return;
        el.tabIndex = (markerTabbingActive && tabbable.includes(marker)) ? 0 : -1;

    });
}

function clearHighlightFunctionCall(map,highlighter){
    map.closePopup();
    highlighter.clear();
    if (typeof globalThis.hsClearAreaHighlight === 'function') {
        globalThis.hsClearAreaHighlight();
    }       
}

export function keyboardAccessbility(map,highlighter,markers){
    map.on('click', clearHighlightFunctionCall);
    document.addEventListener('keydown',function(e){
        if(e.key === "Escape"){
            clearHighlightFunctionCall(map,highlighter);
        }
    }) 
    const container = map.getContainer();
    container.tabIndex = 0;
    container.setAttribute('aria-label', 'Interactive map');
    map.on("zoomend moveend", () => {
        updateMarkerTabIndex(markers, map);
    });
    markers.on("animationend", () => {
        updateMarkerTabIndex(markers, map);
    });
    container.addEventListener('focus', () => {
        markerTabbingActive = true;
        updateMarkerTabIndex(markers, map);
    });
    container.addEventListener('focusin', (e) => {
        if (!markerTabbingActive) return;

        if (e.target?.classList.contains('leaflet-marker-icon')) {
            const marker = e.target._leaflet_id ? map._layers[e.target._leaflet_id] : null;
            if (marker) {
                map.setView(marker.getLatLng(), map.getZoom(), { animate: true });
            }
        }
    });
    container.addEventListener('keydown', function(e){
        const tabbable = getTabbableMarkers(markers, map);
        if (!markerTabbingActive || tabbable.length === 0) return;

        const focused = document.activeElement;
        let index = tabbable.findIndex(m => m._icon === focused);


        if (e.key === "Enter" && focused?.classList.contains('leaflet-marker-icon')) {
                const marker = focused._leaflet_id ? map._layers[focused._leaflet_id] : null;
                if(marker){
                    console.log("Pressed enter")
                    marker.openPopup();
                }
        }
        if (e.key === "Tab") {
            e.preventDefault();
            if (e.shiftKey) {
                index = index <= 0 ? tabbable.length - 1 : index - 1;
            } else {
                index = index === -1 || index >= tabbable.length - 1 ? 0 : index + 1;
            }
            const nextMarker = tabbable[index];
            nextMarker._icon.focus();
            map.panTo(nextMarker.getLatLng(), { animate: true });
        }
        if (e.key === "Escape") {
            if (map._popup?.isOpen()) {
                map.closePopup();
                container.blur();
            } else if (markerTabbingActive) {
                markerTabbingActive = false;
                updateMarkerTabIndex(markers, map);
                container.focus();
            }
        }
        // Now wasd
        const panOffset = 100;
        switch (e.key.toLowerCase()) {
            case 'w': case 'arrowup': map.panBy([0, -panOffset]); e.preventDefault(); break;
            case 's': case 'arrowdown': map.panBy([0, panOffset]); e.preventDefault(); break;
            case 'a': case 'arrowleft': map.panBy([-panOffset, 0]); e.preventDefault(); break;
            case 'd': case 'arrowright': map.panBy([panOffset, 0]); e.preventDefault(); break;
        }

        // Now  - or + zooms in and out
        if (e.key === '+' || e.key === '=' || e.key === '-') {
            e.preventDefault(); 
        }
        if (e.key === '+' || e.key === '=') map.zoomIn();
        if (e.key === '-') map.zoomOut();
    });


}