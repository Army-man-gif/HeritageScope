// gives an error in browser console if not correct
console.assert(cars.length === trafficSlider.value / 20, "Car count incorrect");

// check dependencies
trafficSlider.value = 100;
updateTraffic();