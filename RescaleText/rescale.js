export class RescaleText {
  constructor() {
    var sizeLabel = "rescaleable";
    var min = 10;
    var max = 40;
    var step = 1;
    var current = 16;
  }
  /* f means focus */
  f_increaseFont() {
    fontSize += 2;
    document.body.style.fontSize = fontSize + "px";
  }

  f_decreaseFont() {
    fontSize -= 2;
    document.body.style.fontSize = fontSize + "px";
  }

  f_resetFont() {
    fontSize = 16;
    document.body.style.fontSize = "16px";
  }


  /* c means by class */

  c_init(className){

    if (!className) {
      if (!this.className) {
        console.error("Class name is required to initialize RescaleText.");
        return;
      }
      this.c_init(this.className);
    }
    this.className = className;
    this.elements = document.querySelectorAll(className);
    this.fontSize = 16;
  }

  c_increaseFont() {
    this.fontSize += 2;
    this.elements.forEach(element => {
      element.style.fontSize = this.fontSize + "px";
    });
  }

  c_decreaseFont() {
    this.fontSize -= 2;
    this.elements.forEach(element => {
      element.style.fontSize = this.fontSize + "px";
    });
  }

  c_resetFont() {
    this.fontSize = 16;
    this.elements.forEach(element => {
      element.style.fontSize = "16px";
    });
  }

  

}
