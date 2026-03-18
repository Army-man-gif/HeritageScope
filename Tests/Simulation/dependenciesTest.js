// check dependencies between sliders

function touristChange(){

    console.log("Tourist change test");
    if(touristSlider.value > 20){
        // changes litter val
        console.log("Litter value: ", litterSlider.value);
        console.log("Expected: ", Math.round(touristSlider.value *0.82));

        // more cars
        console.log("Traffic value: ", trafficSlider.value);
        console.log("Expected: ", Math.round(touristSlider.value *0.65));
    }
    else{
        console.log("Tourist value <=20");
    }
}

// doesn't affect other slider values
/*
function litterChange(){
}*/

function trafficChange(){
    // temp should update

    console.log("Traffic change test");
    if(trafficSlider.value > 30){
        // changes litter val
        console.log("Temp value: ", tempSlider.value);
        console.log("Expected: ", Math.round(trafficSlider.value *0.6));
    }
    else{
        console.log("Traffic value <=30");
    }
}

// doesnt affect other sliders
/*
function rainfallChange(){

}*/

function tempChange(){
    console.log("Temp change test");
    if(tempSlider.value > 30 && tempSlider.value <=80){
        // changes litter val
        console.log("Rainfall value: ", rainfallSlider.value);
        console.log("Expected: ", 100 - tempSlider.value + 15);
    }
    else{
        console.log("Temp value <=30 or >=80");
    }
}

// test dependencies
// rainfall, litter not needed
trafficSlider.addEventListener("click", function () { trafficChange();});
touristSlider.addEventListener("click", function () { touristChange();});
tempSlider.addEventListener("click", function () { tempChange();});

