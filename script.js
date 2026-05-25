const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const strokeWidthSlider = document.getElementById('strokeWidth');
const w0Slider  = document.getElementById('w0');
const sSlider   = document.getElementById('s');
const h0Slider  = document.getElementById('h0');
const h1Slider  = document.getElementById('h1');
const tSlider   = document.getElementById('t');
const h2Slider  = document.getElementById('h2');
const scaleSlider = document.getElementById('scale');
const roundedToggle = document.getElementById('rounded');
const gridToggle = document.getElementById('grid');
const whiteToggle = document.getElementById('white');

let tx = 0;
let ty = 0;

// Not yet used
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    tx = event.clientX - rect.left;
    ty = event.clientY - rect.top;
    draw();
});

[strokeWidthSlider, w0Slider, sSlider, h0Slider, h1Slider, tSlider, h2Slider, scaleSlider, roundedToggle, gridToggle, whiteToggle].forEach(el => {
    el.addEventListener('input', draw);
});

function draw() {
    // Configure
    const sw      = strokeWidthSlider.value / 10; // stroke width
    const w0      = 8 * w0Slider.value / 10;      // char width
    const s       = sSlider.value  / 10;           // spacing
    const h0      = 2 * h0Slider.value / 10;       // lower height
    const h1      = 2 * h1Slider.value / 10;       // upper height
    const t       = tSlider.value  / 10;           // upper spacing
    const h2      = h2Slider.value / 10;           // ascender height
    const scale   = scaleSlider.value;             // overall scale
    const rounded = roundedToggle.checked;
    const grid    = gridToggle.checked;
    const white   = whiteToggle.checked;

    // Calculate points
    const x0  = 0;
    const x1  = x0  + w0 - 1;
    const x2  = x1  + 1 + s;
    const x3  = x2  + 1 + s;
    const x4  = x3  + w0 - 1;
    const x5  = x4  + 1 + s;
    const x6  = x5  + w0 - 1;
    const x7  = x6  + 1 + s;
    const x8  = x7  + 1 + s;
    const x9  = x8  + w0 - 1;
    const x10 = x9  + 1 + s;
    const x11 = x10 + 1 + s;
    const x12 = x11 + w0 - 1;
    const y0  = 0;
    const y1  = y0  + h0;
    const y2  = y1  + h1;
    const y3  = y2  + t;
    const y4  = y3  + h2;

    // Clear the background
    ctx.fillStyle = white ? 'black' : 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Set overall transform
    ctx.translate((canvas.width - x12 * scale) / 2, (canvas.height + y4 * scale) / 2);
    ctx.scale(scale, -scale);

    if (grid) {
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        [x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12].forEach(x => {
            ctx.moveTo(x, -1000);
            ctx.lineTo(x, +1000);
        });
        ctx.stroke();
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        [y0, y1, y2, y3, y4].forEach(y => {
            ctx.moveTo(-1000, y);
            ctx.lineTo(+1000, y);
        });
        ctx.stroke();
    }

    ctx.lineWidth = sw;
    ctx.lineCap   = rounded ? 'round' : 'square';
    ctx.lineJoin  = rounded ? 'round' : 'miter';
    ctx.strokeStyle = white ? 'white' : 'black';
    ctx.beginPath();

    // S
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x0, y2);
    ctx.lineTo(x1, y2);

    // I
    ctx.moveTo(x2, y0);
    ctx.lineTo(x2, y2);
    ctx.moveTo(x2, y3);
    ctx.lineTo(x2, y3);

    // N
    ctx.moveTo(x3, y0);
    ctx.lineTo(x3, y2);
    ctx.lineTo(x4, y2);
    ctx.lineTo(x4, y0);

    // C
    ctx.moveTo(x6, y0);
    ctx.lineTo(x5, y0);
    ctx.lineTo(x5, y2);
    ctx.lineTo(x6, y2);

    // L
    ctx.moveTo(x7, y0);
    ctx.lineTo(x7, y4);

    // A (slight bodge)
    ctx.moveTo(x9 - 1/8, y1);
    ctx.lineTo(x8, y1);
    ctx.lineTo(x8, y0);
    ctx.lineTo(x9, y0);
    ctx.lineTo(x9, y2);
    ctx.lineTo(x8, y2);

    // I
    ctx.moveTo(x10, y0);
    ctx.lineTo(x10, y2);
    ctx.moveTo(x10, y3);
    ctx.lineTo(x10, y3);

    // R
    ctx.moveTo(x11, y0);
    ctx.lineTo(x11, y2);
    ctx.lineTo(x12, y2);

    ctx.stroke();

    ctx.restore();
}

draw();
