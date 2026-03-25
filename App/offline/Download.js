export async function downloadMap(map, regionOverlay) {
    if (!map) {
        console.error("Map doesn't exist");
        return false;
    }

    const takeSnapshot = async () => {
        const mapContainerElement = map.getContainer();

        // Make sure map is fully ready
        map.invalidateSize();
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            const canvas = await html2canvas(mapContainerElement, {
                useCORS: true,    // load external tiles/images if needed
                allowTaint: true, // allow cross-origin images
                logging: false
            });

            // Create a download link
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "snapshot.png";
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error taking map snapshot:", err);
        }
    };


    await takeSnapshot();
}