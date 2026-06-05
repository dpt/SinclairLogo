# A Sinclair Logo Toy

The classic Sinclair computer logo is formed on a highly regular grid. Each glyph is defined by intersections of just two vertical and three horizontal grid lines. The constraint is analogous to seven-segment LED displays: a fixed set of possible positions forces each letterform to its most essential shape.

This repository provides an [interactive page](https://dpt.github.io/SinclairLogo/) that parameterises that grid - and the path taken around through it - so you can explore and produce variants of the logo in real time.

---

## Examples

Thick, square-capped strokes at default proportions:

![Thick, bold variant](screenshots/1.png)

Outlined, rounded, with wider spacing:

![Outlined rounded variant](screenshots/2.png)

Thin outline, minimal spacing:

![Thin outline variant](screenshots/3.png)

---

## Running locally

No build step. Open `index.html` directly in a browser.

---

## Controls

| Control | Effect |
|---------|--------|
| **Text** | The string to render. A–Z, 0–9, and space; case-insensitive. Unrecognised characters render as a crossed box. |
| **Stroke width** | Thickness of each line segment. |
| **Connect** | Size of the internal offset used where glyphs connect back to themselves, as a fraction of stroke width. Ranges from 0 to 2× stroke width; default is 0.5×. |
| **Diagonal** | Size of the diagonal offset used in V, X, and Z, as a fraction of stroke width. Ranges from 0 to 2× stroke width; default is 0.5×. |
| **Wide character width** | Horizontal span of standard-width glyphs (most letters and digits). |
| **Very wide char width** | Horizontal span of double-wide glyphs (M and W only). |
| **Spacing** | Gap between glyphs. |
| **Bottom height** | Height of the lower zone, from baseline up to the mid-point. |
| **Upper height** | Height of the upper zone, from mid-point up to cap height. |
| **Upper spacing** | Gap between cap height and the ascender zone. |
| **Ascender height** | How far ascenders extend above cap height. Affects B, H, L, T. Set to 0 to disable the ascender zone entirely. |
| **Descender height** | How far descenders extend below the baseline. Affects G, J, P, Q, Y. Set to 0 to disable. |
| **Scale** | Overall size multiplier. |
| **Round corners** | Rounds path corners using quadratic curves; slide to control the degree. |
| **Round strokes** | Toggles between round and square stroke caps and joins. |
| **Manic Mode** | Renders each glyph in a different ZX Spectrum colour (red → yellow → green → cyan → blue → magenta) and shifts glyphs up and down. Overrides the foreground colour. |
| **Grid** | Overlays the constraint grid: red vertical lines mark x-positions, blue horizontal lines mark y-positions. |
| **Colours** | Selects a foreground/background colour scheme from ten ZX Spectrum palette combinations. |
| **Reset** | Restores all controls to their defaults. |

---

## Character support

**Original glyphs** — from the logo:

`A` `C` `I` `L` `N` `R` `S`

**Extended glyphs** — invented to complete the alphabet within the same system:

`B` `D` `E` `F` `H` `O` `T` `U` `V` `Z` `0` `1` `2` `3` `4` `5` `6` `7` `8` `9`

**Descending glyphs** — utilise an additional row of the grid:

`G` `J` `P` `Q` `Y`

**Characters that bend the rules** — :

- `K` — to avoid becoming an H we shift the top right stroke leftwards;
- `M` and `W` — occupy two standard character widths;
- `V` — to distinguish V from U we introduce a diagonal;
- `X` — we again resort to diagonals to create an X;
- `Z` - ditto.

**Special:**

- `` ` `` (Backtick) — renders a special secret logo.

---

## The grid system

Every glyph is drawn using canvas `lineTo` calls that snap to the intersections of a small set of x- and y-coordinates.

**X-axis** — each glyph gets up to three vertical positions:

| Position | Used by                                                    |
|----------|------------------------------------------------------------|
| `x[i]`   | Left edge — all glyphs                                     |
| `x[i+1]` | Right edge — wide glyphs; Centre — double-wide glyphs only |
| `x[i+2]` | Right edge — double-wide glyphs only (M, W)                |

**Y-axis** — six horizontal levels, bottom to top:

| Index | Name | Description |
|-------|------|-------------|
| `y[0]` | Descender bottom | Lowest point; below the baseline |
| `y[1]` | Baseline | Bottom of regular capitals |
| `y[2]` | Mid-lower | Junction between lower and upper zones |
| `y[3]` | Cap height | Top of regular capitals |
| `y[4]` | Ascender gap | Space between cap height and ascender zone |
| `y[5]` | Ascender top | Top of tall letters (B, H, L, T) |

Enabling the **Grid** toggle draws all active x- and y-lines over the canvas, which makes the system immediately visible.

---

## Licence

[Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](LICENSE)
