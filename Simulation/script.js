//update functions

// more tourists means more litter and traffic
// more people- buildings
function updateTourists() {

  // update slider text value
  touristVal.innerHTML = touristSlider.value;
  
  // add cars depending on input
  buildingsDiv.innerHTML = ""; // remove old buildings and people
  peopleDiv.innerHTML = "";
  litterText.innerHTML = "";
  trafficText.innerHTML = "";
  peopleText.innerHTML = "";

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

    peopleText.innerHTML = "With more tourits, facilities need to be built for them to use. This will be built on top of green sites and may destroy animal habitats. <br><br>";
    let building = document.createElement("img");
    building.src = "images/building.png";
    building.style.bottom = "180px";
    building.style.left = "300px";
    building.style.position = "absolute";
    building.style.width = "40px";
    building.style.height = "80px";
    buildingsDiv.appendChild(building);
  }

  // update litter based on tourists
  // need litter slider to exist before running
  if(touristSlider.value < 80){
    litterSlider.value = touristSlider.value * 0.8;
    updateLitter();
    litterText.innerHTML += "As more tourists visit, more litter is found.<br><br>";

    trafficSlider.value = touristSlider.value * 0.6;
    updateCars();
    trafficText.innerHTML += "As more tourists visit, this causes more traffic.<br><br>";
  }
  else{
    litterSlider.value = touristSlider.value * 0.82;
    updateLitter();
    litterText.innerHTML += "As more tourists visit, more litter is found.<br><br>";
  }

}

// with more litter animals can die, plants can die too
function updateLitter() {

  // update slider text value
  litterVal.innerHTML = litterSlider.value;
  
  // add cars depending on input
  litterDiv.innerHTML = ""; // remove old trash

  litterText.innerHTML = "";

  // add trash near tourists
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

  // above 80 add litter by building
  // reduce trees- animals can die with lots of litter
  if(litterSlider.value > 80){

    treesDiv.innerHTML = "";

    litterText.innerHTML = "With lots of litter, the area becomes dirty. Animals may eat it and die. Without these animals some plants may die.<br><br>";

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
  
    treesDiv.innerHTML = "";

    // decrease trees as rubbish is too high
    for(let i = 0; i < (100 - litterSlider.value)/5 +1; i++){
      // decrease trees

      x = Math.trunc(placedTrees[i*2]);
      y = Math.trunc(placedTrees[i*2 + 1]);

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

}

// more traffic- higher temperature
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

  if(trafficSlider.value > 30){
    
    tempSlider.value = trafficSlider.value * 0.6;
    updateTemp();
    trafficText.innerHTML = "As traffic increases, it causes more heat in an area. It also adds air pollution which contributes to global warming.<br><br>";
  }
}

// floods- some vegetation die
// could be caused by global warming
function updateRainfall() {

  // update slider text value
  rainfallVal.innerHTML = rainfallSlider.value;
  
  // add cars depending on input
  treesDiv.innerHTML = "";
  floodsDiv.innerHTML = "";
  rainfallText.innerHTML = "";

  if(rainfallSlider.value < 20){
    simBackground.src = "images/brown-background.png";
    rainfallText.innerHTML += "With low rainfall, plants die and the ground dries up. <br><br>";
  }
  else{
    simBackground.src = "images/green-background.png";
  }

  if(rainfallSlider.value > 80){

    treesDiv.innerHTML = "";
    rainfallText.innerHTML += "Too much rainfall can cause plants to die from rotting and lack of oxygen. Floods may also occur. Climate change can cause unusual weather like long periods of heavy rain.<br><br> ";

    for(let i=0; i < (rainfallSlider.value - 80)/10; i++)
    {
      let x = Math.trunc(placedFloods[i*2]);
      let y = Math.trunc(placedFloods[i*2 + 1]);

      let flood = document.createElement("img");
      flood.src = "images/puddle.png";
      flood.style.position = "absolute";
      flood.style.bottom = y + "px";
      flood.style.left = x + "px";
      flood.style.width = "140px";
      flood.style.height = "140px";

      floodsDiv.appendChild(flood);
    }

    // decrease trees as rainfall is too high
    for(let i = 0; i < (100 - rainfallSlider.value)/5 +1; i++){
      // decrease trees

      x = Math.trunc(placedTrees[i*2]);
      y = Math.trunc(placedTrees[i*2 + 1]);

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
  else if(rainfallSlider.value > 20){

    rainfallText.innerHTML += "With more rainfall, plants grow more. <br><br>";

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

  
} 

// higher temp- some trees die, less rainfall
// could be normal or caused by traffic, or global warming
function updateTemp() {

  // update slider text value
  tempVal.innerHTML = tempSlider.value;

  tempText.innerHTML = "";

  // update rainfall with temp
  // low temp shouldn't affect rainfall

  if(tempSlider.value > 30){
    rainfallSlider.value = 100 - tempSlider.value + 15;
    updateRainfall();

    tempText.innerHTML += "As temperature increases, rainfall usually decreases.<br><br>";
  }

  if(tempSlider.value > 80){
    simBackground.src = "images/brown-background.png";

    tempText.innerHTML += "When the temperature is high the ground dries out and plants die. Climate change can cause long unusual heatwaves.<br><br>";
  }
  else{
    simBackground.src = "images/green-background.png";
  }

  // decrease trees if too cold
  if(tempSlider.value < 20){

    treesDiv.innerHTML = "";

    for(let i = 0; i < (tempSlider.value)/5; i++){
      // decrease trees

      x = Math.trunc(placedTrees[i*2]);
      y = Math.trunc(placedTrees[i*2 + 1]);

      let tree = document.createElement("img");
      tree.src = "images/tree.png";
      tree.style.position = "absolute";
      tree.style.bottom = y + "px";
      tree.style.left = x + "px";
      tree.style.width = "40px";
      tree.style.height = "40px";

      treesDiv.appendChild(tree);
    }

    tempText.innerHTML += "When the temperature is too low plants can die. With climate change the world is warming as a whole but it can also cause unusual weather patterns like cold spikes.<br><br>";

  }

}

// x,y of tourists
placedTourists = [30, 360, 50, 100, 200, 200, 200, 30, 300, 300];
placedLitter = [310,140, 290, 150, 330, 150];
placedTrees = [50, 210, 200, 360, 360, 180, 30, 30, 400, 30];
placedFloods = [140, 50, 100, 240];

var simBackground = document.getElementById("simBackground");

// using sliders and their values
var trafficSlider = document.getElementById("trafficSlider");
// gete element where val will be displayed e.g <span id="trafficVal"></span>
var trafficVal = document.getElementById("trafficVal");
trafficVal.innerHTML = trafficSlider.value; // Display the default slider value
const carsDiv = document.getElementById("cars");
const trafficText = document.getElementById("trafficText");

var touristSlider = document.getElementById("touristSlider");
var touristVal = document.getElementById("touristVal");
touristVal.innerHTML = touristSlider.value; // Display the default slider value
const buildingsDiv = document.getElementById("buildings");
const peopleDiv = document.getElementById("people");
const peopleText = document.getElementById("peopleText");

var litterSlider = document.getElementById("litterSlider");
var litterVal = document.getElementById("litterVal");
litterVal.innerHTML = litterSlider.value; // Display the default slider value
const litterDiv = document.getElementById("litter");
const litterText = document.getElementById("litterText");

var rainfallSlider = document.getElementById("rainfallSlider");
var rainfallVal = document.getElementById("rainfallVal");
rainfallVal.innerHTML = rainfallSlider.value; // Display the default slider value
const floodsDiv = document.getElementById("floods");
const treesDiv = document.getElementById("trees");
const rainfallText = document.getElementById("rainfallText");

var tempSlider = document.getElementById("tempSlider");
var tempVal = document.getElementById("tempVal");
tempVal.innerHTML = tempSlider.value;
const tempText = document.getElementById("tempText");
// trees said above

// initialise sliders
updateCars();
updateLitter();
updateTourists();
updateRainfall();
updateTemp();

// to dynamically update
trafficSlider.addEventListener("input", updateCars);
touristSlider.addEventListener("input", updateTourists);
litterSlider.addEventListener("input", updateLitter);
rainfallSlider.addEventListener("input", updateRainfall);
tempSlider.addEventListener("input", updateTemp);


