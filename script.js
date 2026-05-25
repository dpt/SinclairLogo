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
    const sw      =     strokeWidthSlider.value / 10; // stroke width
    const w0      = 8 * w0Slider.value          / 10; // char width
    const s       =     sSlider.value           / 10; // spacing
    const h0      = 2 * h0Slider.value          / 10; // lower height
    const h1      = 2 * h1Slider.value          / 10; // upper height
    const t       =     tSlider.value           / 10; // upper spacing
    const h2      =     h2Slider.value          / 10; // ascender height
    const scale   =     scaleSlider.value;            // overall scale
    const rounded =     roundedToggle.checked;
    const grid    =     gridToggle.checked;
    const white   =     whiteToggle.checked;

    // Calculate points
    const x = [0];
    x[1]  = x[0]  + w0 - 1;
    x[2]  = x[1]  + 1 + s;
    x[3]  = x[2]  + 1 + s;
    x[4]  = x[3]  + w0 - 1;
    x[5]  = x[4]  + 1 + s;
    x[6]  = x[5]  + w0 - 1;
    x[7]  = x[6]  + 1 + s;
    x[8]  = x[7]  + 1 + s;
    x[9]  = x[8]  + w0 - 1;
    x[10] = x[9]  + 1 + s;
    x[11] = x[10] + 1 + s;
    x[12] = x[11] + w0 - 1;
    const y = [0];
    y[1] = y[0] + h0;
    y[2] = y[1] + h1;
    y[3] = y[2] + t;
    y[4] = y[3] + h2;

    // Clear the background
    ctx.fillStyle = white ? 'black' : 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Set overall transform
    ctx.translate((canvas.width - x[12] * scale) / 2, (canvas.height + y[4] * scale) / 2);
    ctx.scale(scale, -scale);

    if (grid) {
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        x.forEach(xi => {
            ctx.moveTo(xi, -1000);
            ctx.lineTo(xi, +1000);
        });
        ctx.stroke();
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        y.forEach(yi => {
            ctx.moveTo(-1000, yi);
            ctx.lineTo(+1000, yi);
        });
        ctx.stroke();
    }

    ctx.lineWidth = sw;
    ctx.lineCap   = rounded ? 'round' : 'square';
    ctx.lineJoin  = rounded ? 'round' : 'miter';
    ctx.strokeStyle = white ? 'white' : 'black';
    ctx.beginPath();

    // S
    ctx.moveTo(x[0], y[0]);
    ctx.lineTo(x[1], y[0]);
    ctx.lineTo(x[1], y[1]);
    ctx.lineTo(x[0], y[1]);
    ctx.lineTo(x[0], y[2]);
    ctx.lineTo(x[1], y[2]);

    // I
    ctx.moveTo(x[2], y[0]);
    ctx.lineTo(x[2], y[2]);
    ctx.moveTo(x[2], y[3]);
    ctx.lineTo(x[2], y[3]);

    // N
    ctx.moveTo(x[3], y[0]);
    ctx.lineTo(x[3], y[2]);
    ctx.lineTo(x[4], y[2]);
    ctx.lineTo(x[4], y[0]);

    // C
    ctx.moveTo(x[6], y[0]);
    ctx.lineTo(x[5], y[0]);
    ctx.lineTo(x[5], y[2]);
    ctx.lineTo(x[6], y[2]);

    // L
    ctx.moveTo(x[7], y[0]);
    ctx.lineTo(x[7], y[4]);

    // A (slight bodge)
    ctx.moveTo(x[9] - 1/8, y[1]);
    ctx.lineTo(x[8], y[1]);
    ctx.lineTo(x[8], y[0]);
    ctx.lineTo(x[9], y[0]);
    ctx.lineTo(x[9], y[2]);
    ctx.lineTo(x[8], y[2]);

    // I
    ctx.moveTo(x[10], y[0]);
    ctx.lineTo(x[10], y[2]);
    ctx.moveTo(x[10], y[3]);
    ctx.lineTo(x[10], y[3]);

    // R
    ctx.moveTo(x[11], y[0]);
    ctx.lineTo(x[11], y[2]);
    ctx.lineTo(x[12], y[2]);

    ctx.stroke();

    ctx.restore();
}

draw();
