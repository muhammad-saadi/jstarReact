class DeeCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Constants
    this.nDeePts = 60;
    this.SPACE = 0;
    this.Rmin = 5;
    this.Rmax = 11;
    this.Kmax = 1.8;
    this.num_lines = 5;

    // Dee parameters
    this.ro = 0.5 * (this.Rmax + this.Rmin);
    this.zo = 0.5 * (this.Rmax - this.Rmin);
    this.a = 3;
    this.k = 1.1;
    this.d = 0;
    this.xmin = this.ro - this.a;
    this.xmax = this.ro + this.a;
    this.ymin = this.zo - this.k * this.a;
    this.ymax = this.zo + this.k * this.a;

    // Additional Dee parameters
    this.k_o = this.k;
    this.a_o = this.a;
    this.r_o = this.ro;
    this.z_o = this.zo;
    this.d_o = this.d;

    // Magnet positions
    this.greenM = 20;
    this.redM = 20;
    this.blueM = 0;
    this.yellowM = 0;

    // Other properties
    this.limitIt = false;
    this.graphColor = 0;
    this.printOn = true;
    this.colorIndex = 0;

    // Arrays for Dee points
    this.iRDee = new Array(this.nDeePts);
    this.iZDee = new Array(this.nDeePts);
    this.iRDee1 = new Array(this.nDeePts);
    this.iZDee1 = new Array(this.nDeePts);

    this.maxBoundary = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      xmin: this.Rmin,
      xmax: this.Rmax,
      ymin: -this.Kmax * (this.Rmax - this.Rmin) / 2,
      ymax: this.Kmax * (this.Rmax - this.Rmin) / 2
    };
    
    this.scale = 0;

    // Initialize color array
    this.c1 = this.createColorArray();

    // Bind methods
    this.draw = this.draw.bind(this);

    // Set initial size
    this.setSize(300, 400);

    // Initial draw
    this.draw();
  }

  updateMaxBoundary(width, height) {
    const r1 = {
      x: this.SPACE + 7,
      y: this.SPACE + 15,
      width: width - 1 - 2 * this.SPACE - 14,
      height: height - 1 - 2 * this.SPACE - 30
    };

    // Calculate scale based on maximum limits
    this.scale = Math.max(
      (this.maxBoundary.xmax - this.maxBoundary.xmin) / r1.width,
      (this.maxBoundary.ymax - this.maxBoundary.ymin) / r1.height
    ) + 0.012;

    // Update boundary dimensions based on max limits
    this.maxBoundary = {
      ...this.maxBoundary,
      width: Math.round((this.maxBoundary.xmax - this.maxBoundary.xmin) / this.scale),
      height: Math.round((this.maxBoundary.ymax - this.maxBoundary.ymin) / this.scale),
      x: Math.floor((width - 1 - Math.round((this.maxBoundary.xmax - this.maxBoundary.xmin) / this.scale)) / 2),
      y: Math.floor((height - 1 - Math.round((this.maxBoundary.ymax - this.maxBoundary.ymin) / this.scale)) / 2)
    };
  }

  createColorArray() {
    const colors = [];
    for (let i = 0; i < 21; i++) {
      const hue = 0; // Red hue
      const saturation = i / 20;
      const brightness = 1;
      colors.push(`hsl(${hue}, ${saturation * 100}%, ${brightness * 100}%)`);
    }
    return colors;
  }

  setSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // Accessor methods
  getRo() { return this.ro; }
  getZo() { return this.zo; }
  getA() { return this.a; }
  getK() { return this.k; }
  getD() { return this.d; }
  getPrintOn() { return this.printOn; }
  getLimitIt() { return this.limitIt; }
  getColorIndex() { return this.colorIndex; }

  // Setter methods
  setRo(ro) {
    if (this.ro !== ro) {
      this.ro = ro;
      this.draw();
    }
  }

  setZo(zo) {
    if (this.zo !== zo) {
      this.zo = zo;
      this.draw();
    }
  }

  setA(a) {
    if (this.a !== a) {
      this.a = a;
      this.draw();
    }
  }

  setK(k) {
    if (this.k !== k) {
      this.k = k;
      this.draw();
    }
  }

  setD(d) {
    if (this.d !== d) {
      this.d = d;
      this.draw();
    }
  }

  setGreen(x) {
    if (this.greenM !== x) {
      this.greenM = x;
      this.draw();
    }
  }

  setRed(x) {
    if (this.redM !== x) {
      this.redM = x;
      this.draw();
    }
  }

  setBlue(x) {
    if (this.blueM !== x) {
      this.blueM = x;
      this.draw();
    }
  }

  setYellow(x) {
    if (this.yellowM !== x) {
      this.yellowM = x;
      this.draw();
    }
  }

  changeGraphColor(x) {
    this.graphColor = x;
    this.draw();
  }

  setPrintOn(printOn) {
    if (this.printOn !== printOn) {
      this.printOn = printOn;
      this.draw();
    }
  }

  setLimitIt(limitIt) {
    if (this.limitIt !== limitIt) {
      this.limitIt = limitIt;
      this.draw();
    }
  }

  setColorIndex(colorIndex) {
    if (this.colorIndex !== colorIndex) {
      this.colorIndex = Math.max(0, Math.min(this.c1.length - 1, colorIndex));
      this.draw();
    }
  }

  setAll(ro, zo, a, k, d) {
    this.ro = ro;
    this.zo = zo;
    this.a = a;
    this.k = k;
    this.d = d;
    this.k_o = k;
    this.draw();
  }


  setMinMax(ro, zo, a, k, d) {
    this.xmin = ro - a;
    this.xmax = ro + a;
    this.ymin = zo - k * a;
    this.ymax = zo + k * a;
    this.draw();
  }

  setKo(k_o, a_o, r_o, z_o, d_o) {
    this.k_o = k_o;
    this.a_o = a_o;
    this.r_o = r_o;
    this.z_o = z_o;
    this.d_o = d_o;
    this.draw();
  }

  limitMinMax() {
    // Limit values to maximum boundary
    this.ro = Math.max(Math.min(this.maxBoundary.xmax, this.ro), this.maxBoundary.xmin);
    this.zo = Math.max(Math.min(this.maxBoundary.ymax, this.zo), this.maxBoundary.ymin);
    this.a = Math.min(Math.min(this.a, this.ro - this.maxBoundary.xmin), this.maxBoundary.xmax - this.ro);
    this.k = Math.min(Math.min(this.k, (this.zo - this.maxBoundary.ymin) / this.a), (this.maxBoundary.ymax - this.zo) / this.a);
  }


  draw() {
    if (this.limitIt) {this.limitMinMax()};

    const width = this.canvas.width;
    const height = this.canvas.height;

     // Update max boundary for current canvas size
     this.updateMaxBoundary(width, height);


    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = 'lightgray';
    this.ctx.fillRect(0, 0, width, height);

    // Draw 3D effect
    this.ctx.strokeStyle = 'white';
    this.ctx.strokeRect(0, 0, width - 1, height - 1);

    const r1 = {
      x: this.SPACE + 7,
      y: this.SPACE + 15,
      width: width - 1 - 2 * this.SPACE - 14,
      height: height - 1 - 2 * this.SPACE - 30
    };

    const scale = Math.max((this.xmax - this.xmin) / r1.width, (this.ymax - this.ymin) / r1.height) + 0.012;

    const d2 = {
      width: Math.round((this.xmax - this.xmin) / scale),
      height: Math.round((this.ymax - this.ymin) / scale)
    };

    const p2 = {
      x: Math.floor((width - 1 - d2.width) / 2),
      y: Math.floor((height - 1 - d2.height) / 2)
    };

    // Draw the black boundary rectangle using max limits
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      this.maxBoundary.x,
      this.maxBoundary.y,
      this.maxBoundary.width,
      this.maxBoundary.height
    );

    // Calculate Dee points using stored scale but relative to max boundary
    for (let j = 0; j < this.nDeePts; j++) {
      const theta = j * (2.0 * Math.PI / this.nDeePts);
      const rDee = this.ro + this.a * Math.cos(theta + this.d * Math.sin(theta));
      const zDee = this.a * this.k * Math.sin(theta);
      this.iRDee[j] = this.maxBoundary.x + Math.round((rDee - this.maxBoundary.xmin) / this.scale) - 1;
      this.iZDee[j] = this.maxBoundary.y + Math.round((zDee - this.maxBoundary.ymin) / this.scale);
    }

    // Draw Dee
    this.ctx.fillStyle = this.c1[this.colorIndex];
    this.ctx.beginPath();
    this.ctx.moveTo(this.iRDee[0], this.iZDee[0]);
    for (let i = 1; i < this.nDeePts; i++) {
      this.ctx.lineTo(this.iRDee[i], this.iZDee[i]);
    }
    this.ctx.closePath();
    this.ctx.fill();


    // Draw original shape
    const xmin1 = this.r_o - this.a_o;
    const xmax1 = this.r_o + this.a_o;
    const ymin1 = this.z_o - this.k_o * this.a_o;
    const ymax1 = this.z_o + this.k_o * this.a_o;

    const scale1 = Math.max((xmax1 - xmin1) / r1.width, (ymax1 - ymin1) / r1.height) + 0.012;

    let min_x = 1000, min_y = 1000;
    if ([13, 21, 15, 23].includes(p2.x)) min_x = p2.x - 1;
    if ([34, 24, 38, 28].includes(p2.y)) min_y = p2.y;

    let max_x = 0, max_y = 0;
    for (let j = 0; j < this.nDeePts; j++) {
      const theta = j * (2.0 * Math.PI / this.nDeePts);
      const rDee1 = this.r_o + this.a_o * Math.cos(theta);
      const zDee1 = this.a_o * this.k_o * Math.sin(theta);
      this.iRDee1[j] = min_x + Math.round((rDee1 - xmin1) / scale1) - 1;
      this.iZDee1[j] = min_y + Math.round((zDee1 - ymin1) / scale1);
      max_x = Math.max(max_x, this.iRDee1[j]);
      max_y = Math.max(max_y, this.iZDee1[j]);
    }

    const len_x = max_x - min_x;
    const len_y = max_y - min_y;

    this.ctx.strokeStyle = this.graphColor === 1 ? 'gray' : 'red';
    if (min_x < 20) {
      this.ctx.strokeRect(min_x - 1, min_y - 1, len_x + 3, len_y + 1);
    } else {
      this.ctx.strokeRect(min_x - 8, min_y - 23, len_x + 17, len_y + 46);
    }

    this.ctx.strokeStyle = this.graphColor === 1 ? 'red' : 'gray';
    this.ctx.beginPath();
    this.ctx.moveTo(this.iRDee[0], this.iZDee[0]);
    for (let i = 1; i < this.nDeePts; i++) {
      this.ctx.lineTo(this.iRDee[i], this.iZDee[i]);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Draw magnet boxes
    this.drawMagnetBoxes(width, height);

    // Print output dee parameters
    if (this.printOn) {
      this.printDeeParameters(width, height);
    }
  }


  drawMagnetBoxes(width, height) {
    // Blue boxes
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(0, 1, 35, 35);
    this.ctx.fillRect(0, height - 36, 35, 35);

    // Yellow boxes
    this.ctx.fillStyle = 'yellow';
    this.ctx.fillRect(265, 1, 35, 35);
    this.ctx.fillRect(265, height - 36, 35, 35);

    // Red box
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(0, 160, 7, 80);

    // Green boxes
    this.ctx.fillStyle = 'lightgreen';
    this.ctx.fillRect(285, 130, 7, 50);
    this.ctx.fillRect(285, 220, 7, 50);

    // Print magnet values
    this.ctx.fillStyle = 'black';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(String(this.greenM), 275, 152);
    this.ctx.fillStyle = 'red';
    this.ctx.fillText(String(this.redM), 0, 152);
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(String(this.blueM), 5, 25);
    this.ctx.fillText(String(this.blueM), 5, height - 9);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(String(this.yellowM), 268, 25);
    this.ctx.fillText(String(this.yellowM), 268, height - 9);

  }

  printDeeParameters(width, height) {
    const lines = [
      `Ro= ${this.ro.toFixed(2)}`,
      `Zo= ${this.zo.toFixed(2)}`,
      `a= ${this.a.toFixed(2)}`,
      `k= ${this.k.toFixed(2)}`,
      `d= ${this.d.toFixed(3)}`
    ];

    this.ctx.fillStyle = 'black';
    this.ctx.font = '24px Arial';
    const lineHeight = 25;
    const startY = height / 2 - (lines.length * lineHeight) / 2;

    let maxWidth = 0;
    for (const line of lines) {
      maxWidth = Math.max(maxWidth, this.ctx.measureText(line).width);
    }

    const startX = (width - maxWidth) / 2;

    lines.forEach((line, index) => {
      this.ctx.fillText(line, startX, startY + index * lineHeight);
    });
  }
}

export default DeeCanvas;