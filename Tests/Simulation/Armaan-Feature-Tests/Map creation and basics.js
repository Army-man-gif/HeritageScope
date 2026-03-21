// To test

// Does the map load?
// Is there a valid map object instance
function firstTest(){
    if(globalThis.mapMade && globalThis.hsMap instanceof L.Map){
        console.log("Map was made and is a valid map instance");
        console.log("Test passsed");
        return true;
    }else{
        console.warn("Map is not ready or invalid");
        console.warn("Test failed!");
        return false
    }
}
// Does it zoom to the right coordinates
if(firstTest()){
    const map = globalThis.hsMap;
    // Let's fisrt check the start auto zoom
}
// Does the map resize dynamically properly if the container size changes


// What happens if there is a error. Does the site crash or is it handled and logged?


// Does the map show the markers

// Are there the right number of markers

// Are they in the right place


// Does clicking on a marker trrigger the popup?


// Does clicking off it close it?


// Does the popup content work and then match the place


// How do the edge cases work when i move to the edge most for exampel


// Can the map be moved around using the keybaord arrows and wasd?


// Do markers have labels and descriptions?


// Can the user leave the map with tab and scroll and down arrow
 