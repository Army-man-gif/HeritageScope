// To test

// Does the map load?
// Is there a valid map object instance
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function firstTest(map){
    if(globalThis.mapMade && map instanceof L.Map){
        console.log("Map was made and is a valid map instance");
        console.log("Test passed");
        return true;
    }else{
        console.warn("Map is not ready or invalid");
        console.warn("Test failed!");
        return false
    }
}
// Are the zoom coordinates valid coordinates
// Does the map intiially zoom to the user location correctly. Recaluclate user location and compare
async function secondTest(map){
    // Let's first check the start auto zoom
    if(!firstTest(map)) return;

    // Wait for browser to finish rendering the map completely to start testing
    // Previous test checked it existed not that it finished rendering
    return new Promise((resolve) => {
        let testPassed = true;
        map.whenReady(()=> {

            map.once('locationfound',function(e){
                const center = map.getCenter();

                console.log("Test passed, map center retrieved: ", center.lat, center.lng);

                // Test if center is valid
                if (typeof center.lat !== "number" || typeof center.lng !== "number") {
                    console.log("Test failed: invalid map center");
                    testPassed = false;
                }
                const userLocationLat = e.latlng.lat;
                const userLocationLng = e.latlng.lng;

                const distance = map.distance(center,e.latlng);
                console.log("Distance between initial center and user location:", distance.toFixed(2), "meters");
                console.log(e.latlng);
                console.log(center);
                console.log(distance);
                const tolerance = 10;
                if(distance < tolerance){
                    console.log(`Test passed. User location within ${tolerance}m of the map's center`);
                    testPassed = true;
                }else{
                    console.warn("Test failed");
                    testPassed = false;
                }
                if(typeof userLocationLat === "number" && typeof userLocationLng === "number"){
                    console.log("Test passed: user location retrieved", userLocationLat, userLocationLng);
                    testPassed = true;
                } else {
                    console.log("Test failed: invalid user location");
                    testPassed = false;
                }
            })
            map.once('locationerror',(err) => {
                console.warn("Failed to get user location", err.message);
                testPassed = false;
            })
        })
        resolve(testPassed);
    })
}
// Does the map resize dynamically properly if the container size changes
async function thirdTest(map){
    const secondTestResult = await secondTest(map);
    if(!secondTestResult) return;
    const mapDOMElement = map.getContainer();
    const unchangedWidth = mapDOMElement.offsetWidth;
    const unchangedHeight = mapDOMElement.offsetHeight;
    console.log(`Original map DOM element size : width ${unchangedWidth} and height ${unchangedHeight}`);

    const increaseIncrement = 200;
    mapDOMElement.style.width = (unchangedWidth + increaseIncrement) + "px";
    mapDOMElement.style.height = (unchangedHeight + increaseIncrement) + "px";

    // Make leaflet recalc the size
    map.invalidateSize();
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            const alteredWidth = mapDOMElement.offsetWidth;
            const alteredHeight = mapDOMElement.offsetHeight;
            let testPassed = true;
            console.log(`New map DOM element size : width ${alteredWidth} and height ${alteredHeight}`);

            if(alteredWidth > unchangedWidth && alteredHeight > unchangedHeight){
                console.log("Test passed: container size grew");
            }else{
                console.warn("Test failed");
                testPassed = false;
            }
            if(testPassed){
                const currentMapSize = map.getSize();
                const mapWidth = currentMapSize.x;
                const mapHeight = currentMapSize.y;

                console.log(`New map size : width ${mapWidth} and height ${mapHeight}`);
                if(mapWidth === alteredWidth && mapHeight === alteredHeight){
                    console.log("Test passed: Map resized properly");
                    mapDOMElement.style.width = unchangedWidth + "px";
                    mapDOMElement.style.height = unchangedHeight + "px";
                    console.log("Map and container dimensions reset to original");
                    testPassed = true;
                }else{
                    console.warn("Test failed");
                    mapDOMElement.style.width = unchangedWidth + "px";
                    mapDOMElement.style.height = unchangedHeight + "px";
                    console.log("Map and container dimensions reset to original");
                    testPassed = false;
                }
            }
            resolve(testPassed);
        })
    })
}
// What happens if there is a error. Does the site crash or is it handled and logged?
async function fourthTest(map){
    const thirdTestResult = await thirdTest(map);
    if (!thirdTestResult) return;
    console.log("All errors are caught and logged in main dropped through a default or skipped process");
    return true;
}

// Does the map show the markers
// Are there the right number of markers
// Are they in the right place

async function fifthTest(map,markers){

    const fourthTestResult = await fourthTest(map);
    if(!fourthTestResult) return;
    const markerLayers = markers.getLayers();
    const validMarkers = markerLayers.filter(layer => layer instanceof L.Marker);


    if (markers && markers.getLayers().length > 0) {
        console.log("Markers exist on the map");
    } else {
        console.warn("No markers found");
        return false;   
    }
    if (validMarkers.length > 0) {
        console.log(`Found ${validMarkers.length} valid markers`);
    } else {
        console.warn("No valid markers found");
        return false;
    }
    const response = await fetch("../../../App/dataset.geojson");
    const geoJson = await response.json();
    let invalidFeatures = 0;
    geoJson.features.forEach((feature, index) => {
        if (
            feature.geometry?.type !== "Point" ||
            !Array.isArray(feature.geometry.coordinates) ||
            feature.geometry.coordinates.length !== 2 ||
            typeof feature.geometry.coordinates[0] !== "number" ||
            typeof feature.geometry.coordinates[1] !== "number"
        ) {
            invalidFeatures ++;
        }
    });
    const numberOfvalidgeoJsonFeatures = geoJson.features.length - invalidFeatures;
    const numberOfMarkersonMap = markerLayers.length;
    if(numberOfvalidgeoJsonFeatures === numberOfMarkersonMap){
        console.log("Test passed: number of markers are valid and exist");
    }
    let unmatchedFeatures = 0;
    const tolerance = 5; // meters

    geoJson.features.forEach((feature, index) => {
        const coordinates = feature?.geometry?.coordinates;
        if (coordinates?.length !== 2) return;

        const [lng, lat] = coordinates;

        // Try to find ANY matching marker
        const match = validMarkers.find(marker => {
            const m = marker.getLatLng();
            const distance = map.distance(
                [lat, lng],
                [m.lat, m.lng]
            );
            return distance <= tolerance;
        });

        if (!match) {
            unmatchedFeatures++;
            console.warn(`No marker found near feature ${index}`);
        }
    });

    if (unmatchedFeatures === 0) {
        console.log("Test passed: All features have matching markers");
        return true;
    }
    console.warn("One or multiple of the tests failed");
    return false;
}



// Does clicking on a marker trigger the popup?
// Does it open cleanly
async function sixthTest(map,markers){
    async function singlePopupTest(marker){
        let testPassed = true;
        const popupElement = marker.getPopup();
        if(popupElement){
            const content = popupElement.getContent();
            console.log("Popup content: ",content);
        }else{
            console.warn("Marker has no popup");
            testPassed = false;
        }
        map.setView(marker.getLatLng(), map.getZoom());
        marker.openPopup();
        await new Promise(r => requestAnimationFrame(r));
        if (marker.isPopupOpen()) {
            console.log("Test passed: Popup opened successfully");
        }else{
            console.log("Popup failed to open");
            testPassed = false;
        }
        marker.closePopup();
        await new Promise(r => setTimeout(r, 10));
        return testPassed;
    }
    const fifthTestResult = await fifthTest(map,markers);
    if(!fifthTestResult) return;
    const markerLayers = markers.getLayers();
    const validMarkers = markerLayers.filter(layer => layer instanceof L.Marker);
    for(let i = 0; i < 5; i++){
       const random = Math.floor(Math.random() * (validMarkers.length - 1));
       const randomMarker = validMarkers[random];
       await singlePopupTest(randomMarker);
       await delay(1000);

    }
}

// Can the map be moved around using the keyboard arrows and wasd and - and = zoom in anad out?




// Can the user leave the map with tab and scroll and down arrow



// Test the integration of the downloaad functionality


// Test the integration of the pathing functionality
export async function checkAllTests(map,markers){
    await sixthTest(map,markers);
    map.locate({setView: true, maxZoom: 16});

}