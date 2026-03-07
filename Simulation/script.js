
// using sliders and their values
var trafficSlider = document.getElementById("trafficSlider");
// gete element where val will be displayed e.g <span id="trafficVal"></span>
var trafficVal = document.getElementById("trafficVal");
trafficVal.innerHTML = trafficSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
trafficSlider.oninput = function() {
  trafficVal.innerHTML = this.value;
}

var touristSlider = document.getElementById("touristSlider");
var touristVal = document.getElementById("touristVal");
touristVal.innerHTML = touristSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
touristSlider.oninput = function() {
  touristVal.innerHTML = this.value;
}

var litterSlider = document.getElementById("litterSlider");
var litterVal = document.getElementById("litterVal");
litterVal.innerHTML = litterSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
litterSlider.oninput = function() {
  litterVal.innerHTML = this.value;
}

var rainfallSlider = document.getElementById("rainfallSlider");
var rainfallVal = document.getElementById("rainfallVal");
rainfallVal.innerHTML = rainfallSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
rainfallSlider.oninput = function() {
  rainfallVal.innerHTML = this.value;
}

var tempSlider = document.getElementById("tempSlider");
var tempVal = document.getElementById("tempVal");
tempVal.innerHTML = tempSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
tempSlider.oninput = function() {
  tempVal.innerHTML = this.value;
}