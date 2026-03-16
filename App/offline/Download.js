// Used the format given by the github readme : https://github.com/mapbox/leaflet-image/tree/gh-pages

export function downloadMap(map,filename = "snapshot.png"){
    leafletImage(map, function(err, canvas) {
        if (err) {
            console.error('Error generating map image:', err);
            return;
        }

        // now you have canvas
        // example thing to do with that canvas:
        let img = document.createElement('img');
        let dimensions = map.getSize();
        img.width = dimensions.x;
        img.height = dimensions.y;
        img.src = canvas.toDataURL('image/png');

        // Create temp a tag to setup donwload trigger
        const downloadLink = document.createElement('a');
        downloadLink.href = img.src;
        downloadLink.download = filename;

        // Auto trigger downlaod
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
    });
}

