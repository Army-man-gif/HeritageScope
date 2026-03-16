// tests right amount of images appear

function trafficTest(){
    // cars
    console.log("Traffic Test");
    console.log("Cars: ", carsDiv.children.length);
    console.log("Expected: ", Math.ceil(trafficSlider.value / 20), "\n");
}

function touristTest(){
    // people
    console.log("Tourist Test");
    console.log("People: ", peopleDiv.children.length);
    console.log("Expected: ", Math.ceil(touristSlider.value / 20), "\n");

    // buildings
    if(touristSlider.value > 80){
        console.log("Buildings: ", buildingsDiv.children.length);
        console.log("Expected: ", 1, "\n");
    }
    else{
        console.log("Buildings: ", buildingsDiv.children.length);
        console.log("Expected: ", 0, "\n");
    }
}

function litterTest(){
    // litter
    console.log("Litter Test");
    if(litterSlider.value < 80){
        console.log("Litter: ", litterDiv.children.length);
        console.log("Expected: ", Math.ceil(litterSlider.value / 20), "\n");
    }
    else{
        console.log("Litter: ", litterDiv.children.length);
        console.log("Expected: ", Math.ceil(litterSlider.value / 20) + 3, "\n");
        // trees, with litter
        console.log("Trees with litter: ", treesDiv.children.length);
        console.log("Expected: ", Math.ceil((100 - litterSlider.value)/5 +1), "\n");
    }
}

function rainfallTest(){
    // rainfall
    console.log("Rainfall Test");
    if(rainfallSlider.value > 80){
        console.log("Trees with rainfall: ", treesDiv.children.length);
        console.log("Expected: ", Math.ceil((100 - rainfallSlider.value)/5 +1), "\n");
        // floods
        console.log("Floods: ", floodsDiv.children.length);
        console.log("Expected: ", Math.ceil((rainfallSlider.value - 80)/10), "\n");
    }
    else if(rainfallSlider.value > 20){
        console.log("Trees with rainfall: ", treesDiv.children.length);
        console.log("Expected: ", Math.min(5, Math.floor((rainfallSlider.value - 30) / 10) + 1), "\n");
    }
    else{
        console.log("Rainfall less than 20");
    }
}

function tempTest(){
    //temp
    console.log("Temp Test");
    if(tempSlider.value < 20){
        console.log("Trees with temp: ", treesDiv.children.length);
        console.log("Expected: ", Math.ceil((tempSlider.value)/5), "\n");
    }
    else{
        console.log("Temp over 20.");
    }
}

// test images
trafficSlider.addEventListener("click", function () { trafficTest();});
touristSlider.addEventListener("click", function () { touristTest();});
litterSlider.addEventListener("click", function () { litterTest();});
rainfallSlider.addEventListener("click", function () { rainfallTest();});
tempSlider.addEventListener("click", function () { tempTest();});

// check dependencies
trafficSlider.value = 100;
updateCars();