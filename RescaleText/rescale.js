export class RescaleText {
  constructor() {
    var sizeLabel = "rescaleable";
    var min = 10;
    var max = 40;
    var step = 1;
    var current = 16;
  }

  increaseFont() {
    fontSize += 2;
    document.body.style.fontSize = fontSize + "px";
  }

  decreaseFont() {
    fontSize -= 2;
    document.body.style.fontSize = fontSize + "px";
  }

  resetFont() {
    fontSize = 16;
    document.body.style.fontSize = "16px";
  }

  
}
