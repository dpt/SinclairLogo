const canvas	= document.getElementById('myCanvas');
const ctx       = canvas.getContext('2d');
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
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    tx = x;
    ty = y;

    draw();
});

// Add event listeners to sliders
[strokeWidthSlider, w0Slider, sSlider, h0Slider, h1Slider, tSlider, h2Slider, scaleSlider, roundedToggle, gridToggle, whiteToggle].forEach(slider => {
        slider.addEventListener('input', draw);
    });

function draw() {
    // Configure
    sw      = strokeWidthSlider.value; // stroke width
    w0      = 8 * w0Slider.value / 10; // char width
    s       = 1 * sSlider.value  / 10; // spacing
    h0      = 2 * h0Slider.value / 10; // lower height
    h1      = 2 * h1Slider.value / 10; // upper height
    t       = 1 * tSlider.value  / 10; // upper spacing
    h2      = 1 * h2Slider.value / 10; // ascender height
    scale   = scaleSlider.value;       // overall scale
    rounded = roundedToggle.checked; // round joins and caps
    grid    = gridToggle.checked;	 // draw a grid
    white   = whiteToggle.checked;	 // draw in white

    // Calculate points
    x0  = 0;
    x1  = x0  + w0 - 1;
    x2  = x1  + 1 + s;
    x3  = x2  + 1 + s;
    x4  = x3  + w0 - 1;
    x5  = x4  + 1 + s;
    x6  = x5  + w0 - 1;
    x7  = x6  + 1 + s;
    x8  = x7  + 1 + s;
    x9  = x8  + w0 - 1;
    x10 = x9  + 1 + s;
    x11 = x10 + 1 + s;
    x12 = x11 + w0 - 1;
    y0  = 0;
    y1  = y0  + h0;
    y2  = y1  + h1;
    y3  = y2  + t;
    y4  = y3  + h2;

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
        [x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12].forEach(x => {
            ctx.moveTo(x, -1000);
            ctx.lineTo(x, +1000);
        });
        ctx.stroke();
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        [y0,y1,y2,y3,y4].forEach(y => {
            ctx.moveTo(-1000, y);
            ctx.lineTo(+1000, y);
        });
        ctx.stroke();
    }

    ctx.lineWidth = sw / 10;
    if (rounded) {
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';
    } else {
        ctx.lineCap  = 'square';
        ctx.lineJoin = 'square';
    }
    ctx.strokeStyle = white ? 'white' : 'black';
    ctx.beginPath();

    ctx.moveTo(x0, y0); // S
    ctx.lineTo(x1, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x0, y2);
    ctx.lineTo(x1, y2);

    ctx.moveTo(x2, y0); // I
    ctx.lineTo(x2, y2);
    ctx.moveTo(x2, y3);
    ctx.lineTo(x2, y3);

    ctx.moveTo(x3, y0); // N
    ctx.lineTo(x3, y2);
    ctx.lineTo(x4, y2);
    ctx.lineTo(x4, y0);

    ctx.moveTo(x6, y0); // C
    ctx.lineTo(x5, y0);
    ctx.lineTo(x5, y2);
    ctx.lineTo(x6, y2);

    ctx.moveTo(x7, y0); // L
    ctx.lineTo(x7, y4);

    ctx.moveTo(x9 - 1/8, y1); // A (slight bodge)
    ctx.lineTo(x8, y1);
    ctx.lineTo(x8, y0);
    ctx.lineTo(x9, y0);
    ctx.lineTo(x9, y2);
    ctx.lineTo(x8, y2);

    ctx.moveTo(x10, y0); // I
    ctx.lineTo(x10, y2);
    ctx.moveTo(x10, y3);
    ctx.lineTo(x10, y3);

    ctx.moveTo(x11, y0); // R
    ctx.lineTo(x11, y2);
    ctx.lineTo(x12, y2);

    ctx.stroke();

    ctx.restore();
}

// Initial draw
draw();
