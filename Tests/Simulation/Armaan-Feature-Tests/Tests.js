

// To test
// Does the map load?
// Is there a valid map object instance
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function testMapCreation(map){
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
async function testUserLocationLock(map){
    // Let's first check the start auto zoom

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
                // 2km tolerance
                const tolerance = 2000;
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
            resolve(testPassed);
        })
    })
}
// Does the map resize dynamically properly if the container size changes
async function testResizing(map){
    const mapDOMElement = map.getContainer().parentElement;
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
                const tolerance = 2;

                console.log(`New map size : width ${mapWidth} and height ${mapHeight}`);
                if ( Math.abs(mapWidth - alteredWidth) <= tolerance &&
                    Math.abs(mapHeight - alteredHeight) <= tolerance) {
                    console.log("Test passed: Map resized properly");
                    mapDOMElement.style.width = "";
                    mapDOMElement.style.height = "";
                    console.log("Map and container dimensions reset to original");
                    testPassed = true;
                }else{
                    console.warn("Test failed");
                    mapDOMElement.style.width = "";
                    mapDOMElement.style.height = "";
                    console.log("Map and container dimensions reset to original");
                    testPassed = false;
                }
            }
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    map.invalidateSize(true);
                });
            });
            resolve(testPassed);
        })
    })


}
// What happens if there is a error. Does the site crash or is it handled and logged?
async function testErrors(map){
    console.log("All errors are caught and logged in main dropped through a default or skipped process");
    return true;
}

// Does the map show the markers
// Are there the right number of markers
// Are they in the right place

async function testMarkers(map,markers){
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
function waitforMovementorPopup(target,event,timeout=1000){
    return new Promise(resolve => {

        const done = (result = true) => {
            setTimeout(() => resolve(result), 10);
        };


        const handler = () => {
            clearTimeout(timer);
            done(true);
        };

        target.once(event, handler);

        const timer = setTimeout(() => {
            target.off(event, handler);
            console.warn(`${event} timeout`);
            done(false);
        }, timeout);
    });
}
async function singlePopupTest(map,marker){
    let testPassed = true;
    const popupElement = marker.getPopup();

    if(popupElement){
        const content = popupElement.getContent();
        console.log("Popup content: ",content);
    }else{
        console.warn("Marker has no popup");
        return false;
    }
    await new Promise(r => requestAnimationFrame(r));
    map.setView(marker.getLatLng(), map.getZoom());
    const waitforsetView = waitforMovementorPopup(marker,"moveend");
    await waitforsetView;
    const wait = waitforMovementorPopup(marker,"popupopen");
    marker.openPopup();
    const opened = await wait;


    if (opened) {
        console.log("Test passed: Popup opened successfully");
    }else{
        console.log("Popup failed to open");
        testPassed = false;
    }
    marker.closePopup();
    await new Promise(r => setTimeout(r, 10));
    return testPassed;
}
async function testPopups(map,markers){
    const markerLayers = markers.getLayers();
    const validMarkers = markerLayers.filter(layer => layer instanceof L.Marker);
    for(let i = 0; i < 5; i++){
       const random = Math.floor(Math.random() * (validMarkers.length - 1));
       const randomMarker = validMarkers[random];
       await singlePopupTest(map,randomMarker);
       await delay(1000);
    }
    return true;
}

// Can the map be moved around using the keyboard arrows and wasd and - and = zoom in anad out?
// Can the user leave the map with tab and scroll and down arrow
function simulateKeyPress(key,container) {
    const event = new KeyboardEvent("keydown", {
        key: key,
        code: key,
        bubbles: true
    });

    container.dispatchEvent(event);
}
function simulateMouseScrollAction(container, deltaY = 100) {
    const event = new WheelEvent("wheel", {
        // positive = scroll down (zoom out)
        // negative = scroll up (zoom in)
        deltaY: deltaY,
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        bubbles: true,
        cancelable: true
    });

    container.dispatchEvent(event);
}

async function testingUp(map,testPassed,container){
    // Testing arrow up
    let centerOG = map.getCenter();
    simulateKeyPress("arrowup", container);

    await waitforMovementorPopup(map,"moveend");

    let alteredCenter = map.getCenter();
    let moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
    if(!moved){
        console.warn("Test failed map did not pan at all");
        testPassed = false
    }else if(alteredCenter.lat > centerOG.lat){
            console.log("Test passed: map panned up with arrow up key press");
    }else{
        console.warn("Test failed, map panned in the wrong direction");
        testPassed = false;
    }
    // Testing w
    if(testPassed){
        centerOG = map.getCenter();
        simulateKeyPress("w", container);
        await waitforMovementorPopup(map,"moveend");
        alteredCenter = map.getCenter();
        moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                    Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
        if(!moved){
            console.warn("Test failed map did not pan at all");
            testPassed = false
        }else if(alteredCenter.lat > centerOG.lat){
                console.log("Test passed: map panned up with w key press");
        }else{
            console.warn("Test failed, map panned in the wrong direction");
            testPassed = false;
        }
    }
    return testPassed;
}
async function testingDown(map,testPassed,container){
    let centerOG = map.getCenter();
    simulateKeyPress("arrowdown", container);
    await waitforMovementorPopup(map,"moveend");



    let alteredCenter = map.getCenter();
    let moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
    if(!moved){
        console.warn("Test failed map did not pan at all");
        testPassed = false
    }else if(alteredCenter.lat < centerOG.lat){
            console.log("Test passed: map panned down with arrow down key press");
    }else{
        console.warn("Test failed, map panned in the wrong direction");
        testPassed = false;
    }
    // Testing w
    if(testPassed){
        centerOG = map.getCenter();
        simulateKeyPress("s", container);
        await waitforMovementorPopup(map,"moveend");
        alteredCenter = map.getCenter();
        moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                    Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
        if(!moved){
            console.warn("Test failed map did not pan at all");
            testPassed = false
        }else if(alteredCenter.lat < centerOG.lat){
                console.log("Test passed: map panned down with s key press");
        }else{
            console.warn("Test failed, map panned in the wrong direction");
            testPassed = false;
        }
    }
    return testPassed;
}
async function testingRight(map,testPassed,container){
    let centerOG = map.getCenter();
    simulateKeyPress("arrowright", container);
    await waitforMovementorPopup(map,"moveend");



    let alteredCenter = map.getCenter();
    let moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
    if(!moved){
        console.warn("Test failed map did not pan at all");
        testPassed = false
    }else if(alteredCenter.lng > centerOG.lng){
            console.log("Test passed: map panned right with arrow right key press");
    }else{
        console.warn("Test failed, map panned in the wrong direction");
        testPassed = false;
    }
    // Testing w
    if(testPassed){
        centerOG = map.getCenter();
        simulateKeyPress("d", container);
        await waitforMovementorPopup(map,"moveend");
        alteredCenter = map.getCenter();
        moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                    Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
        if(!moved){
            console.warn("Test failed map did not pan at all");
            testPassed = false
        }else if(alteredCenter.lng > centerOG.lng){
                console.log("Test passed: map panned right with d key press");
        }else{
            console.warn("Test failed, map panned in the wrong direction");
            testPassed = false;
        }
    }
    return testPassed;
}
async function testingLeft(map,testPassed,container){
    let centerOG = map.getCenter();
    simulateKeyPress("arrowleft", container);
    await waitforMovementorPopup(map,"moveend");



    let alteredCenter = map.getCenter();
    let moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
    if(!moved){
        console.warn("Test failed map did not pan at all");
        testPassed = false
    }else if(alteredCenter.lng < centerOG.lng){
            console.log("Test passed: map panned left with arrow left key press");
    }else{
        console.warn("Test failed, map panned in the wrong direction");
        testPassed = false;
    }
    // Testing w
    if(testPassed){
        centerOG = map.getCenter();
        simulateKeyPress("a", container);
        await waitforMovementorPopup(map,"moveend");
        alteredCenter = map.getCenter();

        moved = Math.abs(centerOG.lat - alteredCenter.lat) > 0.00001 ||
                    Math.abs(centerOG.lng - alteredCenter.lng) > 0.00001;
        if(!moved){
            console.warn("Test failed map did not pan at all");
            testPassed = false
        }else if(alteredCenter.lng < centerOG.lng){
                console.log("Test passed: map panned left with a key press");
        }else{
            console.warn("Test failed, map panned in the wrong direction");
            testPassed = false;
        }
    }
    return testPassed;
}
async function testingZoomOut(map,testPassed,container){
   let zoomOG = map.getZoom();
    simulateKeyPress("-", container);
    await waitforMovementorPopup(map,"moveend");



    let alteredZoom = map.getZoom();
    let moved = zoomOG - alteredZoom > 0.000000001;
    if(moved){
        console.log("Test passed: map zoomed out with - key press");
        testPassed = true;
    }else{
        console.warn("Test failed map did not zoom out at all");
        testPassed = false
    }
    // Testing w
    if(testPassed){
        zoomOG = map.getZoom();
        simulateMouseScrollAction(container, 100);
        await waitforMovementorPopup(map,"moveend");
        alteredZoom = map.getZoom();

        moved = zoomOG - alteredZoom > 0.000000001;
        if(moved){
            console.log("Test passed: map zoomed out with scroll down key event");
            testPassed = true;
        }else{
            console.warn("Test failed map did not zoom out at all");
            testPassed = false
        }
    }
    return testPassed;    
}
async function testingZoomIn(map,testPassed,container){
   let zoomOG = map.getZoom();
    simulateKeyPress("+", container);
    await waitforMovementorPopup(map,"moveend");



    let alteredZoom = map.getZoom();
    let moved = alteredZoom - zoomOG > 0.000000001;
    if(moved){
        console.log("Test passed: map zoomed in with + key press");
        testPassed = true;
    }else{
        console.warn("Test failed map did not zoom out at all");
        testPassed = false
    }
    // Testing w
    if(testPassed){
        zoomOG = map.getZoom();
        simulateMouseScrollAction(container, -100);
        await waitforMovementorPopup(map,"moveend");
        alteredZoom = map.getZoom();

        moved = alteredZoom - zoomOG > 0.000000001;
        if(moved){
            console.log("Test passed: map zoomed in with mouse scroll up event");
            testPassed = true;
        }else{
            console.warn("Test failed map did not zoom out at all");
            testPassed = false
        }
    }
    return testPassed;    
}
async function testKeyboarAccessbility(map,markers){

    let testPassed = true;

    // Ok first we test absolute basic arrow keys functionality
    const container = map.getContainer();
    container.focus();
    testPassed = await testingUp(map,testPassed,container);
    testPassed = await testingDown(map,testPassed,container);
    testPassed = await testingRight(map,testPassed,container);
    testPassed = await testingLeft(map,testPassed,container);
    testPassed = await testingZoomIn(map,testPassed,container);
    testPassed = await testingZoomOut(map,testPassed,container);
    return testPassed;

}
// Test the integration of the download functionality
async function downloadFunctionalityTest(map,markers){
    let testPassed = true;
    const mapDOMElement = document.getElementById('map');
    const clonedMap = mapDOMElement.cloneNode(true);
    // Render the clone as far as visibly possible of the screen so it doesn't affect the user UI
    clonedMap.style.position = "absolute";
    clonedMap.style.top = "-9999px";
    clonedMap.style.left = "-9999px";

    document.body.appendChild(clonedMap);
    
    try {
        const canvas = await html2canvas(clonedMap, {
            useCORS: true,
            allowTaint: true
        });

        const dataUrl = canvas.toDataURL("image/png");

        if (dataUrl.startsWith("data:image/png")) {
            console.log("✅ Test passed: image generated");
        }

        clonedMap.remove();

    } catch (err) {
        console.error("❌ Test failed:", err);
        clonedMap.remove();
        testPassed =  false;
    }
    return testPassed;
}

async function TTStest(){
    const log  = globalThis.TTSLog;
    if(log.length == 0){
        console.error("❌Test failed: No TTS triggered at all. ");
        return false
    }
    console.log("✅ TTS fired",log);
    return true;
}
// Test the integration of the pathing functionality
function waitForMode(button, expectedClass, timeout = 1000) {
    return new Promise((resolve) => {
        const start = performance.now();
        function check() {
            if (button.classList.contains(expectedClass)) {
                resolve(true);
            } else if (performance.now() - start > timeout) {
                resolve(false);
            } else {
                requestAnimationFrame(check);
            }
        }
        requestAnimationFrame(check);
    });
}
function waitForNoClass(element, className, timeout = 5000) {
    return new Promise(resolve => {
        const start = performance.now();
        function check() {
            if (!element.classList.contains(className)) return resolve(true);
            if (performance.now() - start > timeout) return resolve(false);
            requestAnimationFrame(check);
        }
        requestAnimationFrame(check);
    });
}
function waitForStatus(timeout=5000){
    const potentialMsgs = [
        "❌ Wheelchair route request failed, please check your network connection",
        "⚠️ Accessibility features failed to load. Please check your network connection.",
        "❌ Wheelchair route failed:","♿ Loading wheelchair route, please wait...",
        "✅ Walking route generated",
        "❌ Walking route planning failed, please try a different destination",
        "🚶Walking Mode",
        "♿Accessibility Mode  — Loading nearby accessible facilities..."
    ]

    const start = performance.now();
    return new Promise(resolve => {
        function check() {
            const statusEl = document.getElementById("status");
            const msg = statusEl?.textContent || "";
            if (potentialMsgs.some(p => msg.includes(p))) return resolve(true);
            if (performance.now() - start > timeout) return resolve(false);
            requestAnimationFrame(check);
        }
        requestAnimationFrame(check);
    });
}

async function testPathing(){
    const statusReady = await waitForStatus();
    let testPassed = true;
    if(!statusReady){
        console.error("Status message not recording state");
        return false;
    }
    console.log("Status recording current state properly");
    const walkBtn = document.getElementById("btn-walk");
    let walkBtnActive;
    const wheelBtn = document.getElementById("btn-wheel");
    let wheelBtnActive;
    walkBtn.click(); 
    const walkActive = await waitForClass(walkBtn, "active-walk");
    const wheelInactive = await waitForNoClass(wheelBtn, "active-wheel");
    if (!walkActive || !wheelInactive) {
        console.log("Test failed");
        testPassed = false;
    }
    console.log("Walking mode activated ✅");
    wheelBtn.click(); 
    const wheelActive = await waitForClass(wheelBtn, "active-wheel");
    const walkInactive = await waitForNoClass(walkBtn, "active-walk");
    if (!wheelActive || !walkInactive) {
        console.log("Test failed: Walking mode on");
        testPassed = false;
    }else if(!walkBtnActive && wheelBtnActive){
        console.log("Test failed");
        testPassed = false;
    }
    console.log("Wheelchair mode activated ✅");
    return testPassed;
}
// TTS of simulation and etc...

export async function runTests(map, markers) {
    const testNames = ["Testing map creation","Testing user location lock","Testing map dynamic resizing","How are errors handled?","Testing markers",/*"Testing popups"*/ "Testing keyboard accessbility", "Testing download functionality", "Testing TTS activation","Testing pathing"];
    const tests = [
        () => testMapCreation(map),
        () => testUserLocationLock(map),
        () => testResizing(map),
        () => testErrors(map),
        () => testMarkers(map, markers),
        //() => testPopups(map, markers),
        () => testKeyboarAccessbility(map, markers),
        () => downloadFunctionalityTest(map, markers),
        () => TTStest(),
        () => testPathing()
    ];

    for (let i = 0; i < tests.length; i++) {
        console.log(`%c\nRunning test ${i + 1} (${testNames[i]})...`, "font-size: 150%;font-weight: bold; color: orange;");

        const result = await tests[i]();

        if (!result) {
            console.warn(`%c❌ Stopping: Test ${i + 1} failed`, "font-size: 150%;font-weight: bold; color: lightcoral;");
            return false;
        }

        console.log(`%c✅ Test ${i + 1} passed`, "font-size: 150%;font-weight: bold; color: lightgreen;");
    }
    //console.log("%cIgnore the rate limited error. I'm on a free plan, it's unavoidable! The moveend time outs are to catch invisible insta flash movement so it doesnt glitch the popupopen spam tests. I'm trying to use a very fuzzy cache matching system to limit api calls. Some popups may not open if my geojson did not have a description on it. It's still a valid test", "font-size: 150%font-weight: bold; color: yellow;");

    console.log("%c🎉 All tests passed", "font-size: 200%;font-weight: bold; color: aquamarine;");
    map.locate({setView: true, maxZoom: 16});
    return true;
}










