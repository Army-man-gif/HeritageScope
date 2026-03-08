//update functions

function updateTourists() {

  // update slider text value
  touristVal.innerHTML = touristSlider.value;
  
  // add cars depending on input
  buildingsDiv.innerHTML = ""; // remove old buildings and people
  peopleDiv.innerHTML = "";

  for (let i = 0; i < touristSlider.value / 20; i++) {

    let x = Math.trunc(placedTourists[i*2]);
    let y = Math.trunc(placedTourists[i*2 + 1]);

    let person = document.createElement("img");
    person.src = "images/person.png";
    person.style.position = "absolute";
    person.src = "images/person.png";
    person.style.bottom = y + "px";
    person.style.left = x + "px";
    person.style.width = "40px";
    person.style.height = "40px";

    peopleDiv.appendChild(person);
  }

  if(touristSlider.value > 80){
    let building = document.createElement("img");
    building.src = "images/building.png";
    building.style.bottom = "180px";
    building.style.left = "300px";
    building.style.position = "absolute";
    building.style.width = "40px";
    building.style.height = "80px";
    buildingsDiv.appendChild(building);
  }

}

function updateLitter() {

  // update slider text value
  litterVal.innerHTML = litterSlider.value;
  
  // add cars depending on input
  litterDiv.innerHTML = ""; // remove old trash

  for (let i = 0; i < litterSlider.value / 20; i++) {

    let x = Math.trunc(placedTourists[i*2]) + 50;
    let y = Math.trunc(placedTourists[i*2 + 1]);

    let litter = document.createElement("img");
    litter.src = "images/paperball.png";
    litter.style.position = "absolute";
    litter.style.bottom = y + "px";
    litter.style.left = x + "px";
    litter.style.width = "20px";
    litter.style.height = "20px";

    litterDiv.appendChild(litter);
  }

  if(litterSlider.value > 80){

    for(let i=0; i<3; i++){
      let x = Math.trunc(placedLitter[i*2]);
      let y = Math.trunc(placedLitter[i*2 + 1]);

      let litter = document.createElement("img");
      litter.src = "images/paperball.png";
      litter.style.position = "absolute";
      litter.style.bottom = y + "px";
      litter.style.left = x + "px";
      litter.style.width = "20px";
      litter.style.height = "20px";

      litterDiv.appendChild(litter);
    }
  }

}

function updateCars() {

  // update slider text value
  trafficVal.innerHTML = trafficSlider.value;
  
  // add cars depending on input
  carsDiv.innerHTML = ""; // remove old cars

  // max 5 cars
  for (let i = 0; i < trafficSlider.value / 20; i++) {

    let car = document.createElement("img");
    car.src = "images/car.png";
    car.style.position = "absolute";
    car.style.bottom = (30 + i * 80) + "px";
    car.style.left = "460px";
    car.style.width = "80px";

    carsDiv.appendChild(car);
  }
}


function updateRainfall() {

  // update slider text value
  rainfallVal.innerHTML = rainfallSlider.value;
  
  // add cars depending on input
  treesDiv.innerHTML = "";
  floodsDiv.innerHTML = "";

  if(rainfallSlider.value < 30){
    simBackground.src = "images/brown-background.png";
  }
  else{
    simBackground.src = "images/green-background.png";
  }

  if(rainfallSlider.value > 30){

    let treeCount = Math.min(5, Math.floor((rainfallSlider.value - 30) / 10) + 1);

    for (let i = 0; i < treeCount; i++) {

      let x = Math.trunc(placedTrees[i*2]);
      let y = Math.trunc(placedTrees[i*2 + 1]);

      let tree = document.createElement("img");
      tree.src = "images/tree.png";
      tree.style.position = "absolute";
      tree.style.bottom = y + "px";
      tree.style.left = x + "px";
      tree.style.width = "40px";
      tree.style.height = "40px";

      treesDiv.appendChild(tree);
    }

  }
  // > 80 some trees may die, floods
  if(rainfallSlider.value > 80){

  }

  
} 


function updateTemp() {

  // update slider text value
  tempVal.innerHTML = tempSlider.value;
  
  // add cars depending on input
  floodsDiv.innerHTML = "";

  if(tempSlider.value > 80){
    simBackground.src = "images/brown-background.png";
  }
  else{
    simBackground.src = "images/green-background.png";
  }

  // in low temps some trees should die

}

// x,y of tourists
placedTourists = [30, 360, 50, 100, 200, 200, 200, 30, 300, 300];
placedLitter = [310,140, 290, 150, 330, 150];
placedTrees = [50, 210, 200, 360, 360, 180, 30, 30, 400, 30]

var simBackground = document.getElementById("simBackground");

// using sliders and their values
var trafficSlider = document.getElementById("trafficSlider");
// gete element where val will be displayed e.g <span id="trafficVal"></span>
var trafficVal = document.getElementById("trafficVal");
trafficVal.innerHTML = trafficSlider.value; // Display the default slider value
const carsDiv = document.getElementById("cars");
// initialise cars
updateCars();

var touristSlider = document.getElementById("touristSlider");
var touristVal = document.getElementById("touristVal");
touristVal.innerHTML = touristSlider.value; // Display the default slider value
const buildingsDiv = document.getElementById("buildings");
const peopleDiv = document.getElementById("people");
// initialise tourists
updateTourists();

var litterSlider = document.getElementById("litterSlider");
var litterVal = document.getElementById("litterVal");
litterVal.innerHTML = litterSlider.value; // Display the default slider value
const litterDiv = document.getElementById("litter");
updateLitter();

var rainfallSlider = document.getElementById("rainfallSlider");
var rainfallVal = document.getElementById("rainfallVal");
rainfallVal.innerHTML = rainfallSlider.value; // Display the default slider value
const floodsDiv = document.getElementById("floods");
const treesDiv = document.getElementById("trees");
updateRainfall();

var tempSlider = document.getElementById("tempSlider");
var tempVal = document.getElementById("tempVal");
tempVal.innerHTML = tempSlider.value;
updateTemp();
// trees said above

// to dynamically update
trafficSlider.addEventListener("input", updateCars);
touristSlider.addEventListener("input", updateTourists);
litterSlider.addEventListener("input", updateLitter);
rainfallSlider.addEventListener("input", updateRainfall);
tempSlider.addEventListener("input", updateTemp);


