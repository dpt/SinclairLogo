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
const resetButton = document.getElementById('reset');

let tx = 0;
let ty = 0;

// Not yet used
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    tx = event.clientX - rect.left;
    ty = event.clientY - rect.top;
    draw();
});

const allControls = [textInput, strokeWidthSlider, w0Slider, sSlider, h0Slider, h1Slider, tSlider, h2Slider, scaleSlider, roundedToggle, gridToggle, whiteToggle];

allControls.forEach(el => {
    el.addEventListener('input', draw);
});

resetButton.addEventListener('click', () => {
    allControls.forEach(el => {
        if (el.type === 'checkbox') {
            el.checked = el.defaultChecked;
        } else {
            el.value = el.defaultValue;
        }
    });
    draw();
});

// Official glyphs first
//

function drawS(x, y, i, sw) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawI(x, y, i, sw) {
    ctx.moveTo(x[i], y[0]);
    ctx.lineTo(x[i], y[2]);
    ctx.moveTo(x[i], y[3]);
    ctx.lineTo(x[i], y[3]);
}

function drawN(x, y, i, sw) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[0]);
}

function drawC(x, y, i, sw) {
    ctx.moveTo(x[i+1], y[0]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawL(x, y, i, sw) {
    ctx.moveTo(x[i], y[0]);
    ctx.lineTo(x[i], y[4]);
}

function drawA(x, y, i, sw) {
    ctx.moveTo(x[i+1] - sw / 2, y[1]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i],   y[2]);
}

function drawR(x, y, i, sw) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

// Infidel glyphs hence
//

function drawE(x, y, i, sw) {
    ctx.moveTo(x[i] + sw / 2, y[1]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
}

function drawB(x, y, i, sw) {
    ctx.moveTo(x[i],   y[4]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i],   y[2]);
}

// B flipped
function drawD(x, y, i, sw) {
    ctx.moveTo(x[i+1], y[4]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+0], y[0]);
    ctx.lineTo(x[i+0], y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawF(x, y, i, sw) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
}

// E flipped. Could it descend?
function drawG(x, y, i, sw) {
    ctx.moveTo(x[i+1] - sw / 2, y[1]);
    ctx.lineTo(x[i+0], y[1]);
    ctx.lineTo(x[i+0], y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+0], y[0]);
}

function drawH(x, y, i, sw) {
    ctx.moveTo(x[i],   y[4]);
    ctx.lineTo(x[i],   y[0]);
    ctx.moveTo(x[i] + sw / 2, y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[0]);
}

// Again needs to descend.
function drawJ(x, y, i, sw) {
    ctx.moveTo(x[i], y[0] - 1); // hack
    ctx.lineTo(x[i], y[2]);
    ctx.moveTo(x[i], y[3]);
    ctx.lineTo(x[i], y[3]);
}

function drawO(x, y, i, sw) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.closePath();
}

// Again needs to descend.
function drawP(x, y, i, sw) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i],   y[1]);
}

// Again needs to descend.
function drawQ(x, y, i, sw) {
    ctx.moveTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
}

function drawT(x, y, i, sw) {
    ctx.moveTo(x[i],   y[2]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
}

function drawU(x, y, i, sw) {
    ctx.moveTo(x[i],   y[2]);
    ctx.lineTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawY(x, y, i, sw) {
    ctx.moveTo(x[i],   y[2]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawSpace(x, y, i, sw) {}

function drawUnknown(x, y, i, sw) {
    drawO(x, y, i);
    ctx.moveTo(x[i] + sw / 2,   y[0] + sw / 2);
    ctx.lineTo(x[i+1] - sw / 2, y[2] - sw / 2);
    ctx.moveTo(x[i+1] - sw / 2, y[0] + sw / 2);
    ctx.lineTo(x[i] + sw / 2,   y[2] - sw / 2);
}

const drawFns = {
    ' ': { fn: drawSpace, wide: true },
    A: { fn: drawA, wide: true },
    B: { fn: drawB, wide: true },
    C: { fn: drawC, wide: true },
    D: { fn: drawD, wide: true },
    E: { fn: drawE, wide: true },
    F: { fn: drawF, wide: true },
    G: { fn: drawG, wide: true },
    H: { fn: drawH, wide: true },
    I: { fn: drawI, wide: false },
    J: { fn: drawJ, wide: false },
    L: { fn: drawL, wide: false },
    N: { fn: drawN, wide: true },
    O: { fn: drawO, wide: true },
    P: { fn: drawP, wide: true },
    Q: { fn: drawQ, wide: true },
    R: { fn: drawR, wide: true },
    S: { fn: drawS, wide: true },
    T: { fn: drawT, wide: true },
    U: { fn: drawU, wide: true },
    Y: { fn: drawY, wide: true },
};

function buildLayout(text, w0, s) {
    const x = [];
    const letters = [];
    let xi = 0;
    let pos = 0;

    for (const ch of text.toUpperCase()) {
        const entry = drawFns[ch] ?? { fn: drawUnknown, wide: true };

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

    letters.forEach(({ fn, i }) => fn(x, y, i, sw));

    ctx.stroke();

    ctx.restore();
}

draw();
