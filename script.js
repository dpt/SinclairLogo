const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const textInput     = document.getElementById('text');
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

[textInput, strokeWidthSlider, w0Slider, sSlider, h0Slider, h1Slider, tSlider, h2Slider, scaleSlider, roundedToggle, gridToggle, whiteToggle].forEach(el => {
    el.addEventListener('input', draw);
});

function drawS(x, y, i) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawI(x, y, i) {
    ctx.moveTo(x[i], y[0]);
    ctx.lineTo(x[i], y[2]);
    ctx.moveTo(x[i], y[3]);
    ctx.lineTo(x[i], y[3]);
}

function drawN(x, y, i) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[0]);
}

function drawC(x, y, i) {
    ctx.moveTo(x[i+1], y[0]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawL(x, y, i) {
    ctx.moveTo(x[i], y[0]);
    ctx.lineTo(x[i], y[4]);
}

function drawA(x, y, i) {
    ctx.moveTo(x[i+1] - 1/8, y[1]); // slight bodge
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i],   y[2]);
}

function drawR(x, y, i) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

const drawFns = {
    A: { fn: drawA, wide: true },
    C: { fn: drawC, wide: true },
    I: { fn: drawI, wide: false },
    L: { fn: drawL, wide: false },
    N: { fn: drawN, wide: true },
    R: { fn: drawR, wide: true },
    S: { fn: drawS, wide: true },
};

function buildLayout(text, w0, s) {
    const x = [];
    const letters = [];
    let xi = 0;
    let pos = 0;

    for (const ch of text.toUpperCase()) {
        const entry = drawFns[ch];
        if (!entry) continue;

        const i = xi;
        x[i] = pos;

        if (entry.wide) {
            x[i + 1] = pos + w0 - 1;
            xi = i + 2;
            pos = x[i + 1] + 1 + s;
        } else {
            xi = i + 1;
            pos = x[i] + 1 + s;
        }

        letters.push({ fn: entry.fn, i });
    }

    return { x, letters, width: xi > 0 ? x[xi - 1] : 0 };
}

function draw() {
    // Configure
    const text    =     textInput.value;
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
    const { x, letters, width } = buildLayout(text, w0, s);
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
    ctx.translate((canvas.width - width * scale) / 2, (canvas.height + y[4] * scale) / 2);
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

    letters.forEach(({ fn, i }) => fn(x, y, i));

    ctx.stroke();

    ctx.restore();
}

draw();
