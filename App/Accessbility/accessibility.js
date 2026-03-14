/* Yi creates */
export class RescaleText {
  constructor(className) {
    this.min = 10;
    this.max = 40;
    this.step = 2;
    this.sizeLabelId = "sizeLabel";

    if (localStorage.getItem('fontSize')) {
      const savedSize = parseInt(localStorage.getItem('fontSize'), 10);
      this.fontSize = savedSize;
    }
    else {      
      this.fontSize = 16;
    }
    this.updateLabel();

    if (className === undefined) {
      this.f_init();
    }
    else{
      this.c_init(className);
    }
  }

  storageFontSize(size) {
    localStorage.setItem('fontSize', size);
  }

  /* f means focus */
  f_increaseFont() {
    this.fontSize = Math.min(this.max, this.fontSize + this.step);
    document.body.style.fontSize = this.fontSize + "px";
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

  f_decreaseFont() {
    this.fontSize = Math.max(this.min, this.fontSize - this.step);
    document.body.style.fontSize = this.fontSize + "px";
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

  f_resetFont() {
    this.fontSize = 16;
    document.body.style.fontSize = "16px";
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

  f_init() {
    document.body.style.fontSize = this.fontSize + "px";
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

  /* Kelly writes this function */
  f_applyFontSize(size) {
    const sizes = { normal: '16px', large: '20px', xlarge: '24px' };
    if (!sizes[size]) {
      console.error(`Unsupported font size: ${size}`);
      return;
    }
    document.documentElement.style.fontSize = sizes[size];
    document.body.style.fontSize = sizes[size];

    // Update active state on buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
    this.fontSize = parseInt(sizes[size], 10);
    this.updateLabel();
    this.storageFontSize(this.fontSize);
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
      return;
    }
    this.className = className;
    this.elements = document.querySelectorAll(className);
    this.elements.forEach(element => {
      element.style.fontSize = this.fontSize + "px";
    });
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

  c_increaseFont() {
    this.fontSize = Math.min(this.max, this.fontSize + this.step);
    this.elements.forEach(element => {
      element.style.fontSize = this.fontSize + "px";
    });
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

  c_decreaseFont() {
    this.fontSize = Math.max(this.min, this.fontSize - this.step);
    this.elements.forEach(element => {
      element.style.fontSize = this.fontSize + "px";
    });
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

  c_resetFont() {
    this.fontSize = 16;
    this.elements.forEach(element => {
      element.style.fontSize = "16px";
    });
    this.updateLabel();
    this.storageFontSize(this.fontSize);
  }

}
/* kelly writes, Yi modifies */
export class HighContrast {
  constructor(className) {
    this.HighContrast = false;
    if (localStorage.getItem('highContrast') === 'true') {
      this.HighContrast = true;
    }
    if (className) {
      this.c_init(className);
    } else {  
      this.f_init();
    }
  }

  storageContrast(isOn) {
    localStorage.setItem('highContrast', isOn);
  }

  f_toggleHighContrast() {
    const isOn = document.body.classList.toggle('high-contrast');
    this.storageContrast(isOn);
    this.HighContrast = isOn;
    this.updateLabel();
  }

  f_init() {
    document.body.classList.toggle('high-contrast', this.HighContrast);
    this.updateLabel();
  }

  c_init(className){
    if (!className) {
      if (!this.className) {
        console.error("Class name is required to initialize HighContrast.");
        return;
      }
      this.c_init(this.className);
      return;
    }
    this.className = className;
    this.elements = document.querySelectorAll(className);
    if (this.HighContrast) {
      this.elements.forEach(element => {
        element.classList.add('high-contrast');
      });
    } else {
      this.elements.forEach(element => {
        element.classList.remove('high-contrast');
      });
    }
    this.updateLabel();
  }

  updateLabel() {
    const btn = document.getElementById('contrast-btn');
    if (btn) {
      btn.textContent = this.HighContrast ? 'Normal View' : 'High Contrast';
    }
  }
}

