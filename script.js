const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const textInput = document.getElementById("text");
const strokeWidthSlider = document.getElementById("strokeWidth");
const connectSlider = document.getElementById("connect");
const diagonalSlider = document.getElementById("diagonal");
const w0Slider = document.getElementById("w0");
const w1Slider = document.getElementById("w1");
const sSlider = document.getElementById("s");
const h0Slider = document.getElementById("h0");
const h1Slider = document.getElementById("h1");
const tSlider = document.getElementById("t");
const h2Slider = document.getElementById("h2");
const h3Slider = document.getElementById("h3");
const scaleSlider = document.getElementById("scale");
const roundingSlider = document.getElementById("rounding");
const roundedToggle = document.getElementById("rounded");
const gridToggle = document.getElementById("grid");
const coloursSelect = document.getElementById("colours");
const resetButton = document.getElementById("reset");

const allControls = [
  textInput,
  strokeWidthSlider,
  connectSlider,
  diagonalSlider,
  w0Slider,
  w1Slider,
  sSlider,
  h0Slider,
  h1Slider,
  tSlider,
  h2Slider,
  h3Slider,
  scaleSlider,
  roundingSlider,
  roundedToggle,
  gridToggle,
  coloursSelect,
];

allControls.forEach((el) => {
  el.addEventListener("input", draw);
});

resetButton.addEventListener("click", () => {
  allControls.forEach((el) => {
    if (el.type === "checkbox") {
      el.checked = el.defaultChecked;
    } else if (el.tagName === "SELECT") {
      el.selectedIndex = Array.from(el.options).findIndex((o) => o.defaultSelected);
      if (el.selectedIndex === -1) el.selectedIndex = 0;
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

// Path notation: X0/X1/X2 = x[i+0]/x[i+1]/x[i+2]; Y0–Y5 = y[0]–y[5]; +Ns/-Ns = ±N*sw offset; +B/-B = ±connect; +D/-D = ±diagonal
function resolveCoord(str, x, y, i, sw, connect, diagonal) {
  const m = str.match(/^([XY])(\d)(([+-]\d+\.?\d*)s|([+-])B|([+-])D)?$/);
  const idx = parseInt(m[2]);
  let off = 0;
  if (m[3]) {
    if (m[5] !== undefined) off = (m[5] === "+" ? 1 : -1) * connect;
    else if (m[6] !== undefined) off = (m[6] === "+" ? 1 : -1) * diagonal;
    else off = parseFloat(m[4]) * sw;
  }
  return (m[1] === "X" ? x[i + idx] : y[idx]) + off;
}

// Returns {m, n} entry/exit points of the rounded arc at corner, or null if degenerate.
function arcCorner(prev, corner, next, rounding) {
  const dab = Math.hypot(corner.px - prev.px, corner.py - prev.py);
  const dbc = Math.hypot(next.px - corner.px, next.py - corner.py);
  if (dab === 0 || dbc === 0) return null;
  const d = Math.min(dab, dbc) * rounding;
  return {
    m: {
      px: corner.px - (d * (corner.px - prev.px)) / dab,
      py: corner.py - (d * (corner.py - prev.py)) / dab,
    },
    n: {
      px: corner.px + (d * (next.px - corner.px)) / dbc,
      py: corner.py + (d * (next.py - corner.py)) / dbc,
    },
  };
}

// Open subpath: round all internal (non-endpoint) corners.
function drawOpenSubpath(pts, rounding) {
  const n = pts.length;
  ctx.moveTo(pts[0].px, pts[0].py);
  let logX = pts[0].px,
    logY = pts[0].py;
  for (let k = 1; k < n; k++) {
    const corner = pts[k];
    const next = pts[k + 1];
    if (next && rounding > 0) {
      const arc = arcCorner({ px: logX, py: logY }, corner, next, rounding);
      if (arc) {
        ctx.lineTo(arc.m.px, arc.m.py);
        ctx.quadraticCurveTo(corner.px, corner.py, arc.n.px, arc.n.py);
        logX = corner.px;
        logY = corner.py;
        continue;
      }
    }
    ctx.lineTo(corner.px, corner.py);
    logX = corner.px;
    logY = corner.py;
  }
}

// Closed subpath: round all corners including the wrap-around at the start point.
// Begins the canvas path after the arc at pts[0] so the seam is invisible.
function drawClosedSubpath(pts, rounding) {
  const n = pts.length;
  if (rounding === 0) {
    ctx.moveTo(pts[0].px, pts[0].py);
    for (let k = 1; k < n; k++) ctx.lineTo(pts[k].px, pts[k].py);
    ctx.closePath();
    return;
  }
  const arcs = pts.map((p, idx) =>
    arcCorner(pts[(idx - 1 + n) % n], p, pts[(idx + 1) % n], rounding),
  );
  const a0 = arcs[0];
  ctx.moveTo(a0 ? a0.n.px : pts[0].px, a0 ? a0.n.py : pts[0].py);
  for (let k = 1; k < n; k++) {
    const arc = arcs[k];
    if (arc) {
      ctx.lineTo(arc.m.px, arc.m.py);
      ctx.quadraticCurveTo(pts[k].px, pts[k].py, arc.n.px, arc.n.py);
    } else {
      ctx.lineTo(pts[k].px, pts[k].py);
    }
  }
  if (a0) {
    ctx.lineTo(a0.m.px, a0.m.py);
    ctx.quadraticCurveTo(pts[0].px, pts[0].py, a0.n.px, a0.n.py);
  }
  ctx.closePath();
}

function executePath(path, x, y, i, sw, rounding, connect, diagonal) {
  if (!path) return;

  const tokens = path.split(" ");
  const raw = [];
  let j = 0;
  while (j < tokens.length) {
    const cmd = tokens[j++];
    if (cmd === "Z") {
      raw.push({ cmd: "Z" });
      continue;
    }
    const [xStr, yStr] = tokens[j++].split(",");
    raw.push({
      cmd,
      px: resolveCoord(xStr, x, y, i, sw, connect, diagonal),
      py: resolveCoord(yStr, x, y, i, sw, connect, diagonal),
    });
  }

  let k = 0;
  while (k < raw.length) {
    if (raw[k].cmd !== "M") {
      k++;
      continue;
    }
    const { px: sx, py: sy } = raw[k++];
    const pts = [{ px: sx, py: sy }];
    let closed = false;
    while (k < raw.length && raw[k].cmd !== "M") {
      if (raw[k].cmd === "Z") {
        closed = true;
        k++;
        break;
      }
      pts.push({ px: raw[k].px, py: raw[k].py });
      k++;
    }
    if (closed) drawClosedSubpath(pts, rounding);
    else drawOpenSubpath(pts, rounding);
  }
}

const UNKNOWN_PATH =
  "M X0,Y1 L X0,Y3 L X1,Y3 L X1,Y1 Z M X0+B,Y1+B L X1-B,Y3-B M X1-B,Y1+B L X0+B,Y3-B";

const drawFns = {
  " ": { path: "", width: 0 },
  0: {
    path: "M X0,Y1 L X0,Y3 L X1,Y3 L X1,Y1 Z M X0+B,Y1+B L X1-B,Y3-B",
    width: 1,
  },
  1: { path: "M X0,Y1 L X0,Y3", width: 0 },
  2: { path: "M X1,Y1 L X0,Y1 L X0,Y2 L X1,Y2 L X1,Y3 L X0,Y3", width: 1 },
  3: { path: "M X0,Y3 L X1,Y3 L X1,Y1 L X0,Y1 M X1-B,Y2 L X0,Y2", width: 1 },
  4: { path: "M X0,Y3 L X0,Y2 L X1,Y2 M X1,Y3 L X1,Y1", width: 1 },
  5: { path: "M X0,Y1 L X1,Y1 L X1,Y2 L X0,Y2 L X0,Y3 L X1,Y3", width: 1 },
  6: { path: "M X1,Y3 L X0,Y3 L X0,Y1 L X1,Y1 L X1,Y2 L X0+B,Y2", width: 1 },
  7: { path: "M X0,Y3 L X1,Y3 L X1,Y1", width: 1 },
  8: {
    path: "M X0,Y3 L X1,Y3 L X1,Y1 L X0,Y1 Z M X0+B,Y2 L X1-B,Y2",
    width: 1,
  },
  9: { path: "M X0,Y1 L X1,Y1 L X1,Y3 L X0,Y3 L X0,Y2 L X1-B,Y2", width: 1 },
  A: { path: "M X1-B,Y2 L X0,Y2 L X0,Y1 L X1,Y1 L X1,Y3 L X0,Y3", width: 1 },
  B: { path: "M X0,Y5 L X0,Y1 L X1,Y1 L X1,Y3 L X0+B,Y3", width: 1 },
  C: { path: "M X1,Y1 L X0,Y1 L X0,Y3 L X1,Y3", width: 1 },
  D: { path: "M X1,Y5 L X1,Y1 L X0,Y1 L X0,Y3 L X1-B,Y3", width: 1 },
  E: { path: "M X0+B,Y2 L X1,Y2 L X1,Y3 L X0,Y3 L X0,Y1 L X1,Y1", width: 1 },
  F: { path: "M X0,Y1 L X0,Y3 L X1,Y3 M X0+B,Y2 L X1,Y2", width: 1 },
  G: { path: "M X1-B,Y1 L X0,Y1 L X0,Y3 L X1,Y3 L X1,Y0 L X0,Y0", width: 1 },
  H: { path: "M X0,Y5 L X0,Y1 M X0+B,Y3 L X1,Y3 L X1,Y1", width: 1 },
  I: { path: "M X0,Y1 L X0,Y3 M X0,Y4 L X0,Y4", width: 0 },
  J: { path: "M X0,Y0 L X0,Y3 M X0,Y4 L X0,Y4", width: 0 },
  K: {
    path: "M X0,Y5 L X0,Y1 M X1-1.0s,Y3 L X1-1.0s,Y2+B M X0+B,Y2 L X1,Y2 L X1,Y1",
    width: 1,
  },
  L: { path: "M X0,Y1 L X0,Y5", width: 0 },
  M: { path: "M X0,Y1 L X0,Y3 L X2,Y3 L X2,Y1 M X1,Y1 L X1,Y3-B", width: 2 },
  N: { path: "M X0,Y1 L X0,Y3 L X1,Y3 L X1,Y1", width: 1 },
  O: { path: "M X0,Y1 L X0,Y3 L X1,Y3 L X1,Y1 Z", width: 1 },
  P: { path: "M X0,Y0 L X0,Y3 L X1,Y3 L X1,Y1 L X0+B,Y1", width: 1 },
  Q: { path: "M X1,Y0 L X1,Y3 L X0,Y3 L X0,Y1 L X1-B,Y1", width: 1 },
  R: { path: "M X0,Y1 L X0,Y3 L X1,Y3", width: 1 },
  S: { path: "M X0,Y1 L X1,Y1 L X1,Y2 L X0,Y2 L X0,Y3 L X1,Y3", width: 1 },
  T: { path: "M X0,Y5 L X0,Y1 L X1,Y1 M X0+B,Y3 L X1,Y3", width: 1 },
  U: { path: "M X0,Y3 L X0,Y1 L X1,Y1 L X1,Y3", width: 1 },
  V: { path: "M X0,Y3 L X0,Y1 L X0+D,Y1 L X1,Y3-D L X1,Y3", width: 1 },
  W: { path: "M X0,Y3 L X0,Y1 L X2,Y1 L X2,Y3 M X1,Y3 L X1,Y1+B", width: 2 },
  X: {
    path: "M X0,Y1 L X0+D,Y1 L X1-D,Y3 L X1,Y3 M X1,Y1 L X1-D,Y1 L X0+D,Y3 L X0,Y3",
    width: 1,
  },
  Y: { path: "M X0,Y3 L X0,Y1 L X1-B,Y1 M X0,Y0 L X1,Y0 L X1,Y3", width: 1 },
  Z: {
    path: "M X1,Y1 L X0,Y1 L X0,Y1+D L X1,Y3-D L X1,Y3 L X0,Y3",
    width: 1,
  },
  "`": {
    path: "M X0+3.0s,Y0 L X1,Y0 M X0+0.6s,Y1 L X1-0.6s,Y1 M X0+0.4s,Y2 L X1-0.4s,Y2 M X0+1.1s,Y3 L X1-1.1s,Y3 M X0+2.2s,Y4 L X1-2.2s,Y4",
    width: 1,
  },
};

function buildLayout(text, w0, w1, spc) {
  const x = [];
  const letters = [];
  let xi = 0;
  let pos = 0;

  for (const ch of text.toUpperCase()) {
    const entry = drawFns[ch] ?? { path: UNKNOWN_PATH, width: 1 };

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

    letters.push({ path: entry.path, i, width: entry.width });
  }

  return { x, letters, width: pos - 1 - spc };
}

function draw() {
  // Configure
  const text = textInput.value;
  const sw = strokeWidthSlider.value / 10; // stroke width
  const connect = (connectSlider.value / 10) * sw; // connect offset (0–2*sw)
  const diagonal = (diagonalSlider.value / 10) * sw; // diagonal offset (0–2*sw)
  const w0 = (8 * w0Slider.value) / 10; // char width
  const w1 = (8 * w1Slider.value) / 10; // very wide char width
  const s = sSlider.value / 10; // spacing
  const h0 = (2 * h0Slider.value) / 10; // lower height
  const h1 = (2 * h1Slider.value) / 10; // upper height
  const t = tSlider.value / 10; // upper spacing
  const h2 = h2Slider.value / 10; // ascender height
  const h3 = h3Slider.value / 10; // descender height
  const scale = scaleSlider.value; // overall scale
  const rounding = roundingSlider.value / 100; // corner rounding factor (0–0.5)
  const rounded = roundedToggle.checked;
  const grid = gridToggle.checked;
  const [fg, bg] = coloursSelect.value.split("|");

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
  const offsetX = (canvas.width - width * scale) / 2;
  const offsetY = (canvas.height + (y[5] + y[0]) * scale) / 2;
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, -scale);

  if (grid) {
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    x.forEach((xi) => {
      ctx.moveTo(xi, -1000);
      ctx.lineTo(xi, +1000);
    });
    ctx.stroke();
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    y.forEach((yi) => {
      ctx.moveTo(-1000, yi);
      ctx.lineTo(+1000, yi);
    });
    ctx.stroke();
  }

  ctx.lineWidth = sw;
  ctx.lineCap = rounded ? "round" : "square";
  ctx.lineJoin = rounded ? "round" : "miter";
  ctx.strokeStyle = fg;

  letters.forEach(({ path, i }) => {
    ctx.beginPath();
    executePath(path, x, y, i, sw, rounding, connect, diagonal);
    ctx.stroke();
  });

  ctx.restore();
}

draw();
