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
const tileToggle = document.getElementById("tile");
const gridToggle = document.getElementById("grid");
const coloursSelect = document.getElementById("colours");
const resetButton = document.getElementById("reset");
const randomiseButton = document.getElementById("randomise");
const exportSVGButton = document.getElementById("exportSVG");

const allControls = document.querySelectorAll(
  ".controls input, .controls select, .controls textarea",
);

allControls.forEach((el) => el.addEventListener("input", draw));

resetButton.addEventListener("click", () => {
  allControls.forEach((el) => {
    if (el.type === "checkbox") {
      el.checked = el.defaultChecked;
    } else if (el.tagName === "SELECT") {
      el.selectedIndex = Array.from(el.options).findIndex(
        (o) => o.defaultSelected,
      );
      if (el.selectedIndex === -1) el.selectedIndex = 0;
    } else {
      el.value = el.defaultValue;
    }
  });
  draw();
});

randomiseButton.addEventListener("click", () => {
  allControls.forEach((el) => {
    if (el.tagName === "TEXTAREA") return;
    if (el.id === "grid" || el.id === "scale") return;
    if (el.type === "checkbox") {
      el.checked = Math.random() < 0.3;
    } else if (el.tagName === "SELECT") {
      el.selectedIndex = Math.floor(Math.random() * el.options.length);
    } else if (el.type === "range") {
      const min = +el.min,
        max = +el.max;
      el.value = Math.floor(Math.random() * (max - min + 1)) + min;
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
function drawOpenSubpath(dc, pts, rounding) {
  dc.moveTo(pts[0].px, pts[0].py);
  for (let k = 1; k < pts.length; k++) {
    const corner = pts[k];
    const next = pts[k + 1];
    if (next && rounding > 0) {
      const arc = arcCorner(pts[k - 1], corner, next, rounding);
      if (arc) {
        dc.lineTo(arc.m.px, arc.m.py);
        dc.quadraticCurveTo(corner.px, corner.py, arc.n.px, arc.n.py);
        continue;
      }
    }
    dc.lineTo(corner.px, corner.py);
  }
}

// Closed subpath: round all corners including the wrap-around at the start point.
// Begins the path after the arc at pts[0] so the seam is invisible.
function drawClosedSubpath(dc, pts, rounding) {
  const n = pts.length;
  if (rounding === 0) {
    dc.moveTo(pts[0].px, pts[0].py);
    for (let k = 1; k < n; k++) dc.lineTo(pts[k].px, pts[k].py);
    dc.closePath();
    return;
  }
  const arcs = pts.map((p, idx) =>
    arcCorner(pts[(idx - 1 + n) % n], p, pts[(idx + 1) % n], rounding),
  );
  const a0 = arcs[0];
  dc.moveTo(a0 ? a0.n.px : pts[0].px, a0 ? a0.n.py : pts[0].py);
  for (let k = 1; k < n; k++) {
    const arc = arcs[k];
    if (arc) {
      dc.lineTo(arc.m.px, arc.m.py);
      dc.quadraticCurveTo(pts[k].px, pts[k].py, arc.n.px, arc.n.py);
    } else {
      dc.lineTo(pts[k].px, pts[k].py);
    }
  }
  if (a0) {
    dc.lineTo(a0.m.px, a0.m.py);
    dc.quadraticCurveTo(pts[0].px, pts[0].py, a0.n.px, a0.n.py);
  }
  dc.closePath();
}

function executePath(dc, path, x, y, i, sw, rounding, connect, diagonal) {
  if (!path) return;
  const tokens = path.split(" ");
  let pts = [];
  let j = 0;

  const flush = (closed) => {
    if (pts.length) {
      (closed ? drawClosedSubpath : drawOpenSubpath)(dc, pts, rounding);
      pts = [];
    }
  };

  while (j < tokens.length) {
    const cmd = tokens[j++];
    if (cmd === "Z") {
      flush(true);
      continue;
    }
    if (cmd === "M") flush(false);
    const [xStr, yStr] = tokens[j++].split(",");
    pts.push({
      px: resolveCoord(xStr, x, y, i, sw, connect, diagonal),
      py: resolveCoord(yStr, x, y, i, sw, connect, diagonal),
    });
  }
  flush(false);
}

function makeSvgDc() {
  let d = "";
  return {
    moveTo(x, y) {
      d += ` M ${x} ${y}`;
    },
    lineTo(x, y) {
      d += ` L ${x} ${y}`;
    },
    quadraticCurveTo(cx, cy, x, y) {
      d += ` Q ${cx} ${cy} ${x} ${y}`;
    },
    closePath() {
      d += " Z";
    },
    getPath() {
      return d.trimStart();
    },
  };
}

const SPECTRUM_MANIC = [
  "#FF0000",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#FF00FF",
];
const MANIC_SHIFTS = [0, -1, 0, -2, -1, -2, 0, -1, 0, -2];

const UNKNOWN_PATH =
  "M X0,Y1 L X0,Y3 L X1,Y3 L X1,Y1 Z M X0+B,Y1+B L X1-B,Y3-B M X1-B,Y1+B L X0+B,Y3-B";

const drawFns = {
  " ": { path: "", width: 0 },
  "!": { path: "M X0,Y1 L X0,Y1 M X0,Y2 L X0,Y4", width: 0 },
  0: {
    path: "M X0,Y1 L X0,Y3 L X1,Y3 L X1,Y1 Z M X0+B,Y1+B L X1-B,Y3-B",
    width: 1,
  },
  1: { path: "M X0,Y1 L X0,Y3", width: 0 },
  2: { path: "M X1,Y1 L X0,Y1 L X0,Y2 L X1,Y2 L X1,Y3 L X0,Y3", width: 1 },
  3: { path: "M X0,Y3 L X1,Y3 L X1,Y1 L X0,Y1 M X1-B,Y2 L X0,Y2", width: 1 },
  4: { path: "M X0,Y3 L X0,Y2 L X1-B,Y2 M X1,Y3 L X1,Y1", width: 1 },
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
  "-": { path: "M X0,Y2 L X1,Y2", width: 1 },
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
    } else if (entry.width === 1) {
      x[i + 1] = pos + w0 - 1;
    }
    xi = i + entry.width + 1;
    pos = x[i + entry.width] + 1 + spc;

    letters.push({ path: entry.path, i, width: entry.width });
  }

  return { x, letters, width: pos - 1 - spc };
}

function getParams() {
  const sw = strokeWidthSlider.value / 10;
  const connect = (connectSlider.value / 10) * sw;
  const diagonal = (diagonalSlider.value / 10) * sw;
  const w0 = (8 * w0Slider.value) / 10;
  const w1 = (8 * w1Slider.value) / 10;
  const s = sSlider.value / 10;
  const h0 = (2 * h0Slider.value) / 10;
  const h1 = (2 * h1Slider.value) / 10;
  const t = tSlider.value / 10;
  const h2 = h2Slider.value / 10;
  const h3 = h3Slider.value / 10;
  const scale = scaleSlider.value;
  const rounding = roundingSlider.value / 100;
  const rounded = roundedToggle.checked;
  const tile = tileToggle.checked;
  const grid = gridToggle.checked;
  const [fg, bg] = coloursSelect.value.split("|");
  const manic = fg === "manic";
  const text = textInput.value;
  return {
    text,
    sw,
    connect,
    diagonal,
    w0,
    w1,
    s,
    h0,
    h1,
    t,
    h2,
    h3,
    scale,
    rounding,
    rounded,
    manic,
    tile,
    grid,
    fg,
    bg,
  };
}

function computeLayout({ text, w0, w1, s, h0, h1, t, h2, h3 }) {
  const y = [];
  y[0] = -h3;
  y[1] = 0;
  y[2] = y[1] + h0;
  y[3] = y[2] + h1;
  y[4] = y[3] + t;
  y[5] = y[4] + h2;
  const lineSpacing = y[5] - y[0] + s;
  const lines = text.split("\n");
  const lineLayouts = lines.map((line) => buildLayout(line, w0, w1, s));
  const maxWidth = lineLayouts.reduce((m, l) => Math.max(m, l.width), 0);
  return { y, lineSpacing, lines, lineLayouts, maxWidth };
}

function draw() {
  const p = getParams();
  const { y, lineSpacing, lines, lineLayouts, maxWidth } = computeLayout(p);
  const {
    sw,
    connect,
    diagonal,
    scale,
    rounding,
    rounded,
    manic,
    tile,
    grid,
    fg,
    bg,
  } = p;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  const numLines = lines.length;
  const offsetX = (canvas.width - maxWidth * scale) / 2;
  const offsetY =
    (canvas.height +
      (y[5] + y[0]) * scale -
      (numLines - 1) * lineSpacing * scale) /
    2;
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, -scale);

  ctx.lineWidth = sw;
  ctx.lineCap = rounded ? "round" : "square";
  ctx.lineJoin = rounded ? "round" : "miter";

  if (tile) {
    const xStep = maxWidth + p.s * 2;
    const yStep = numLines * lineSpacing;
    const nx = xStep > 0 ? Math.ceil(canvas.width / (xStep * scale)) + 1 : 0;
    const ny = yStep > 0 ? Math.ceil(canvas.height / (yStep * scale)) + 1 : 0;
    ctx.strokeStyle = fg;
    ctx.globalAlpha = 0.1;
    for (let gy = -ny; gy <= ny; gy++) {
      for (let gx = -nx; gx <= nx; gx++) {
        if (gx === 0 && gy === 0) continue;
        ctx.save();
        ctx.translate(gx * xStep, gy * yStep);
        lineLayouts.forEach(({ x, letters, width }, lineIdx) => {
          ctx.save();
          ctx.translate((maxWidth - width) / 2, -lineIdx * lineSpacing);
          letters.forEach(({ path, i }) => {
            ctx.beginPath();
            executePath(ctx, path, x, y, i, sw, rounding, connect, diagonal);
            ctx.stroke();
          });
          ctx.restore();
        });
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  let glyphIdx = 0;
  lineLayouts.forEach(({ x, letters, width }, lineIdx) => {
    const lineX = (maxWidth - width) / 2;

    ctx.save();
    ctx.translate(lineX, -lineIdx * lineSpacing);

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
      ctx.lineWidth = sw;
    }

    letters.forEach(({ path, i }) => {
      ctx.strokeStyle = manic
        ? SPECTRUM_MANIC[glyphIdx % SPECTRUM_MANIC.length]
        : fg;
      ctx.save();
      if (manic)
        ctx.translate(0, MANIC_SHIFTS[glyphIdx % MANIC_SHIFTS.length] * sw);
      ctx.beginPath();
      executePath(ctx, path, x, y, i, sw, rounding, connect, diagonal);
      ctx.stroke();
      ctx.restore();
      glyphIdx++;
    });

    ctx.restore();
  });

  ctx.restore();
}

function exportSVG() {
  const p = getParams();
  const { y, lineSpacing, lines, lineLayouts, maxWidth } = computeLayout(p);
  const {
    sw,
    connect,
    diagonal,
    scale,
    rounding,
    rounded,
    manic,
    tile,
    fg,
    bg,
  } = p;

  const W = canvas.width;
  const H = canvas.height;
  const numLines = lines.length;
  const offsetX = (W - maxWidth * scale) / 2;
  const offsetY =
    (H + (y[5] + y[0]) * scale - (numLines - 1) * lineSpacing * scale) / 2;

  const lineCap = rounded ? "round" : "square";
  const lineJoin = rounded ? "round" : "miter";

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`,
  );
  parts.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);
  parts.push(
    `<g transform="translate(${offsetX},${offsetY}) scale(${scale},${-scale})"` +
      ` stroke-linecap="${lineCap}" stroke-linejoin="${lineJoin}" fill="none" stroke-width="${sw}">`,
  );

  if (tile) {
    const xStep = maxWidth + p.s * 2;
    const yStep = numLines * lineSpacing;
    const nx = xStep > 0 ? Math.ceil(W / (xStep * scale)) + 1 : 0;
    const ny = yStep > 0 ? Math.ceil(H / (yStep * scale)) + 1 : 0;
    parts.push(`<g stroke="${fg}" opacity="0.1">`);
    for (let gy = -ny; gy <= ny; gy++) {
      for (let gx = -nx; gx <= nx; gx++) {
        if (gx === 0 && gy === 0) continue;
        lineLayouts.forEach(({ x, letters, width }, lineIdx) => {
          const lineX = (maxWidth - width) / 2 + gx * xStep;
          const lineY = -lineIdx * lineSpacing + gy * yStep;
          letters.forEach(({ path, i }) => {
            const dc = makeSvgDc();
            executePath(dc, path, x, y, i, sw, rounding, connect, diagonal);
            const d = dc.getPath();
            if (d)
              parts.push(
                `<path transform="translate(${lineX},${lineY})" d="${d}"/>`,
              );
          });
        });
      }
    }
    parts.push("</g>");
  }

  let glyphIdx = 0;
  lineLayouts.forEach(({ x, letters, width }, lineIdx) => {
    const lineX = (maxWidth - width) / 2;
    letters.forEach(({ path, i }) => {
      const stroke = manic
        ? SPECTRUM_MANIC[glyphIdx % SPECTRUM_MANIC.length]
        : fg;
      const manicTy = manic
        ? MANIC_SHIFTS[glyphIdx % MANIC_SHIFTS.length] * sw
        : 0;
      const dc = makeSvgDc();
      executePath(dc, path, x, y, i, sw, rounding, connect, diagonal);
      const d = dc.getPath();
      if (d) {
        parts.push(
          `<path transform="translate(${lineX},${-lineIdx * lineSpacing + manicTy})"` +
            ` d="${d}" stroke="${stroke}"/>`,
        );
      }
      glyphIdx++;
    });
  });

  parts.push("</g>");
  parts.push("</svg>");

  const blob = new Blob([parts.join("\n")], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sinclair.svg";
  a.click();
  URL.revokeObjectURL(url);
}

exportSVGButton.addEventListener("click", exportSVG);

draw();
