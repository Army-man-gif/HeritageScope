
export function downloadMap(){
    const mapDOMElement = document.getElementById('map');
    if(!mapDOMElement){
        console.error("Map not found");
    }
    const clonedMap = mapDOMElement.cloneNode(true);
    // Render the clone as far as visibly possible of the screen so it doesn't affect the user UI
    clonedMap.style.position = "absolute";
    clonedMap.style.top = "-9999px";
    clonedMap.style.left = "-9999px";

    document.body.appendChild(clonedMap);
    
    html2canvas(
        clonedMap,{
        useCORS : true,
        allowTaint: true,

    }).then(clonedPart => {
        // Make a link and force it to click automatically then remove everything
        const link = document.createElement("a");
        link.href = clonedPart.toDataURL("image/png");
        link.download = "snapshot.png";
        link.click();

        // Remove clone from DOM
        clonedMap.remove();
        // Remove link element
        link.remove();
    }).catch(error => {
        console.error("Error in download ",error);
        clonedMap.remove();
    })
}