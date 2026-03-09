class RescaleText {
  constructor() {
    this.min = 10;
    this.max = 40;
    this.step = 2;
    this.fontSize = 16;
    this.sizeLabelId = "sizeLabel";
  }
  /* f means focus */
  f_increaseFont() {
    this.fontSize = Math.min(this.max, this.fontSize + this.step);
    document.body.style.fontSize = this.fontSize + "px";
    this.updateLabel();
  }

  f_decreaseFont() {
    this.fontSize = Math.max(this.min, this.fontSize - this.step);
    document.body.style.fontSize = this.fontSize + "px";
    this.updateLabel();
  }

  f_resetFont() {
    this.fontSize = 16;
    document.body.style.fontSize = "16px";
    this.updateLabel();
  }

  updateLabel() {
    const sizeLabel = document.getElementById(this.sizeLabelId);
    if (sizeLabel) {
      sizeLabel.textContent = this.fontSize + "px";
    }
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
    this.updateLabel();
  }

  c_increaseFont() {
    this.fontSize = Math.min(this.max, this.fontSize + this.step);
    this.elements.forEach(element => {
      element.style.fontSize = this.fontSize + "px";
    });
    this.updateLabel();
  }

  c_decreaseFont() {
    this.fontSize = Math.max(this.min, this.fontSize - this.step);
    this.elements.forEach(element => {
      element.style.fontSize = this.fontSize + "px";
    });
    this.updateLabel();
  }

  c_resetFont() {
    this.fontSize = 16;
    this.elements.forEach(element => {
      element.style.fontSize = "16px";
    });
    this.updateLabel();
  }



}


