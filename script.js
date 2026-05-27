const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const textInput     = document.getElementById('text');
const strokeWidthSlider = document.getElementById('strokeWidth');
const w0Slider  = document.getElementById('w0');
const w1Slider  = document.getElementById('w1');
const sSlider   = document.getElementById('s');
const h0Slider  = document.getElementById('h0');
const h1Slider  = document.getElementById('h1');
const tSlider   = document.getElementById('t');
const h2Slider  = document.getElementById('h2');
const h3Slider  = document.getElementById('h3');
const scaleSlider = document.getElementById('scale');
const roundedToggle = document.getElementById('rounded');
const gridToggle = document.getElementById('grid');
const coloursSelect = document.getElementById('colours');
const resetButton = document.getElementById('reset');

let tx = 0;
let ty = 0;

// Not yet used
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    tx = event.clientX - rect.left;
    ty = event.clientY - rect.top;
});

const allControls = [textInput, strokeWidthSlider, w0Slider, w1Slider, sSlider, h0Slider, h1Slider, tSlider, h2Slider, h3Slider, scaleSlider, roundedToggle, gridToggle, coloursSelect];

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

// y[] layout (bottom to top):
// y[0] = descender bottom
// y[1] = baseline
// y[2] = mid-lower
// y[3] = cap height (top of body)
// y[4] = ascender gap
// y[5] = ascender top

// Official glyphs first
//

function drawS(x, y, i, sw) {
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
}

function drawI(x, y, i, sw) {
    ctx.moveTo(x[i], y[1]);
    ctx.lineTo(x[i], y[3]);
    ctx.moveTo(x[i], y[4]);
    ctx.lineTo(x[i], y[4]);
}

function drawN(x, y, i, sw) {
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i+1], y[1]);
}

function drawC(x, y, i, sw) {
    ctx.moveTo(x[i+1], y[1]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
}

function drawL(x, y, i, sw) {
    ctx.moveTo(x[i], y[1]);
    ctx.lineTo(x[i], y[5]);
}

function drawA(x, y, i, sw) {
    ctx.moveTo(x[i+1] - sw / 2, y[2]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i],   y[3]);
}

function drawR(x, y, i, sw) {
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
}

// Infidel glyphs hence
//

function drawE(x, y, i, sw) {
    ctx.moveTo(x[i] + sw / 2, y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
}

function drawB(x, y, i, sw) {
    ctx.moveTo(x[i],   y[5]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i] + sw / 2, y[3]);
}

// B flipped
function drawD(x, y, i, sw) {
    ctx.moveTo(x[i+1], y[5]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1] - sw / 2, y[3]);
}

function drawF(x, y, i, sw) {
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.moveTo(x[i] + sw / 2, y[2]);
    ctx.lineTo(x[i+1], y[2]);
}

function drawG(x, y, i, sw) {
    ctx.moveTo(x[i+1] - sw / 2, y[1]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i],   y[0]);
}

function drawH(x, y, i, sw) {
    ctx.moveTo(x[i],   y[5]);
    ctx.lineTo(x[i],   y[1]);
    ctx.moveTo(x[i] + sw / 2, y[3]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i+1], y[1]);
}

function drawJ(x, y, i, sw) {
    ctx.moveTo(x[i], y[0]);
    ctx.lineTo(x[i], y[3]);
    ctx.moveTo(x[i], y[4]);
    ctx.lineTo(x[i], y[4]);
}

function drawO(x, y, i, sw) {
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.closePath();
}

// Again needs to descend.
function drawP(x, y, i, sw) {
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i] + sw / 2, y[1]);
}

// Again needs to descend.
function drawQ(x, y, i, sw) {
    ctx.moveTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1] - sw / 2, y[1]);
}

function drawT(x, y, i, sw) {
    ctx.moveTo(x[i],   y[5]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);

    ctx.moveTo(x[i] + sw / 2, y[3]);
    ctx.lineTo(x[i+1], y[3]);
}

function drawU(x, y, i, sw) {
    ctx.moveTo(x[i],   y[3]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1], y[1]);
    ctx.lineTo(x[i+1], y[3]);
}

function drawX(x, y, i, sw) {
    ctx.moveTo(x[i], y[1]);
    ctx.lineTo(x[i] + sw/2, y[1]);
    ctx.lineTo(x[i+1] - sw/2, y[3]);
    ctx.lineTo(x[i+1], y[3]);

    ctx.moveTo(x[i+1], y[1]);
    ctx.lineTo(x[i+1] - sw/2, y[1]);
    ctx.lineTo(x[i] + sw/2, y[3]);
    ctx.lineTo(x[i], y[3]);
}

function drawY(x, y, i, sw) {
    ctx.moveTo(x[i],   y[3]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+1] - sw / 2, y[1]);
    ctx.moveTo(x[i],   y[0]);
    ctx.lineTo(x[i+1], y[0]);
    ctx.lineTo(x[i+1], y[3]);
}

function drawSpace(x, y, i, sw) {}

function drawNut(x, y, i, sw) {
    ctx.moveTo(x[i+0] + sw*3.0, y[0]);
    ctx.lineTo(x[i+1] + sw*0.0, y[0]);

    ctx.moveTo(x[i+0] + sw*0.6, y[1]);
    ctx.lineTo(x[i+1] - sw*0.6, y[1]);

    ctx.moveTo(x[i+0] + sw*0.4, y[2]);
    ctx.lineTo(x[i+1] - sw*0.4, y[2]);

    ctx.moveTo(x[i+0] + sw*1.1, y[3]);
    ctx.lineTo(x[i+1] - sw*1.1, y[3]);

    ctx.moveTo(x[i+0] + sw*2.2, y[4]);
    ctx.lineTo(x[i+1] - sw*2.2, y[4]);
}

// Questionable!
function drawK(x, y, i, sw) {
    ctx.moveTo(x[i], y[5]);
    ctx.lineTo(x[i], y[1]);

    ctx.moveTo(x[i+1] - sw, y[3]);
    ctx.lineTo(x[i+1] - sw, y[2] + sw/2);

    ctx.moveTo(x[i] + sw/2, y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[1]);
}

// Double-wide M: x[i]=left, x[i+1]=mid, x[i+2]=right
function drawM(x, y, i, sw) {
    ctx.moveTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[3]);
    ctx.lineTo(x[i+2], y[3]);
    ctx.lineTo(x[i+2], y[1]);
    ctx.moveTo(x[i+1], y[1]);
    ctx.lineTo(x[i+1], y[3] - sw/2);
}

// M flipped
function drawW(x, y, i, sw) {
    ctx.moveTo(x[i],   y[3]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i+2], y[1]);
    ctx.lineTo(x[i+2], y[3]);
    ctx.moveTo(x[i+1], y[3]);
    ctx.lineTo(x[i+1], y[1] + sw/2);
}

function drawV(x, y, i, sw) {
    ctx.moveTo(x[i], y[3]);
    ctx.lineTo(x[i], y[1]);
    ctx.lineTo(x[i] + sw, y[1]); // invents a point!
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[3]);
}

function drawZ(x, y, i, sw) {
    ctx.moveTo(x[i+1], y[1]);
    ctx.lineTo(x[i],   y[1]);
    ctx.lineTo(x[i],   y[2]);
    ctx.lineTo(x[i+1], y[2]);
    ctx.lineTo(x[i+1], y[3]);
    ctx.lineTo(x[i],   y[3]);
}

function drawUnknown(x, y, i, sw) {
    drawO(x, y, i, sw);
    ctx.moveTo(x[i]   + sw / 2, y[1] + sw / 2);
    ctx.lineTo(x[i+1] - sw / 2, y[3] - sw / 2);
    ctx.moveTo(x[i+1] - sw / 2, y[1] + sw / 2);
    ctx.lineTo(x[i]   + sw / 2, y[3] - sw / 2);
}

const drawFns = {
    ' ': { fn: drawSpace, width: 0 },
    A: { fn: drawA, width: 1 },
    B: { fn: drawB, width: 1 },
    C: { fn: drawC, width: 1 },
    D: { fn: drawD, width: 1 },
    E: { fn: drawE, width: 1 },
    F: { fn: drawF, width: 1 },
    G: { fn: drawG, width: 1 },
    H: { fn: drawH, width: 1 },
    I: { fn: drawI, width: 0 },
    J: { fn: drawJ, width: 0 },
    L: { fn: drawL, width: 0 },
    K: { fn: drawK, width: 1 },
    M: { fn: drawM, width: 2 },
    V: { fn: drawV, width: 1 },
    W: { fn: drawW, width: 2 },
    N: { fn: drawN, width: 1 },
    O: { fn: drawO, width: 1 },
    P: { fn: drawP, width: 1 },
    Q: { fn: drawQ, width: 1 },
    R: { fn: drawR, width: 1 },
    S: { fn: drawS, width: 1 },
    T: { fn: drawT, width: 1 },
    U: { fn: drawU, width: 1 },
    X: { fn: drawX, width: 1 },
    Y: { fn: drawY, width: 1 },
    Z: { fn: drawZ, width: 1 },
    '`': { fn: drawNut, width: 1 },
};

function buildLayout(text, w0, w1, spc) {
    const x = [];
    const letters = [];
    let xi = 0;
    let pos = 0;

    for (const ch of text.toUpperCase()) {
        const entry = drawFns[ch] ?? { fn: drawUnknown, width: 1 };

        const i = xi;
        x[i] = pos;

        if (entry.width === 2) {
            x[i + 1] = pos + w1 - 1;
            x[i + 2] = pos + 2 * w1 - 2;
            xi = i + 3;
            pos = x[i + 2] + 1 + spc;
        } else if (entry.width === 1) {
            x[i + 1] = pos + w0 - 1;
            xi = i + 2;
            pos = x[i + 1] + 1 + spc;
        } else {
            xi = i + 1;
            pos = x[i] + 1 + spc;
        }

        letters.push({ fn: entry.fn, i });
    }

    return { x, letters, width: pos - 1 - spc };
}

function draw() {
    // Configure
    const text    =     textInput.value;
    const sw      =     strokeWidthSlider.value / 10; // stroke width
    const w0      = 8 * w0Slider.value          / 10; // char width
    const w1      = 8 * w1Slider.value          / 10; // very wide char width
    const s       =     sSlider.value           / 10; // spacing
    const h0      = 2 * h0Slider.value          / 10; // lower height
    const h1      = 2 * h1Slider.value          / 10; // upper height
    const t       =     tSlider.value           / 10; // upper spacing
    const h2      =     h2Slider.value          / 10; // ascender height
    const h3      =     h3Slider.value          / 10; // descender height
    const scale   =     scaleSlider.value;            // overall scale
    const rounded =     roundedToggle.checked;
    const grid    =     gridToggle.checked;
    const [fg, bg] = coloursSelect.value.split('|');

    // Calculate points
    const { x, letters, width } = buildLayout(text, w0, w1, s);
    const y = [];
    y[0] = -h3;
    y[1] = 0;
    y[2] = y[1] + h0;
    y[3] = y[2] + h1;
    y[4] = y[3] + t;
    y[5] = y[4] + h2;

    // Clear the background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Set overall transform
    ctx.translate((canvas.width - width * scale) / 2, (canvas.height + (y[5] + y[0]) * scale) / 2);
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
    ctx.strokeStyle = fg;
    ctx.beginPath();

    letters.forEach(({ fn, i }) => fn(x, y, i, sw));

    ctx.stroke();

    ctx.restore();
}

draw();
