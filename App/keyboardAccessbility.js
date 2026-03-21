export function keyboardAccessbility(map,highlighter){
    function clearHighlightFunctionCall(){
        map.closePopup();
        highlighter.clear();
        if (typeof globalThis.hsClearAreaHighlight === 'function') {
            globalThis.hsClearAreaHighlight();
        }       
    }
    map.on('click', clearHighlightFunctionCall);
    document.addEventListener('keydown',function(e){
        if(e.key === "Escape"){
            clearHighlightFunctionCall();
        }
    })
    const container = map.getContainer();
    container.tabIndex = 0;
    container.setAttribute('aria-label', 'Interactive map');
    container.addEventListener('keydown', function(e){
        const focused = document.activeElement;
        if (e.key === "Enter") {
            if(focused?.classList.contains('leaflet-marker-icon')){
                const marker = focused._leaflet_id ? map._layers[focused._leaflet_id] : null;
                if(marker){
                    console.log("Pressed enter")
                    marker.openPopup();
                }
            }
        }
        if(e.key == "Escape"){
            map.closePopup();
            map.blur();
        }
        // Now wasd
        const panOffset = 100;
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                map.panBy([0, -panOffset]);
                e.preventDefault();
                break;
            case 's':
            case 'arrowdown':
                map.panBy([0, panOffset]);
                e.preventDefault();
                break;
            case 'a':
            case 'arrowleft':
                map.panBy([-panOffset, 0]);
                e.preventDefault();
                break;
            case 'd':
            case 'arrowright':
                map.panBy([panOffset, 0]);
                e.preventDefault();
                break;
        }

        // Now  - or + zooms in and out
        if (e.key === '+' || e.key === '=' || e.key === '-') {
            e.preventDefault(); 
        }
        if (e.key === '+' || e.key === '=') map.zoomIn();
        if (e.key === '-') map.zoomOut();
    });


}