// Generates images/logo.svg: a faceted gold star between two raised eagle wings.
// Run: node marketing/logo-gen.js
const fs = require("fs");
const path = require("path");

const W = 1400;

const STAR = { cx: 700, cy: 540, R: 215, r: 90 };
// Left wing leading edge: a quadratic curve from the shoulder (behind the star) up and out to the wing tip.
const EDGE = { s: [612, 560], c: [470, 225], t: [300, 215] };
const INK = "#6E4504";

const rad = (deg) => (deg * Math.PI) / 180;
const f = (n) => n.toFixed(1);
const lerp = (a, b, t) => a + (b - a) * t;
const edgeAt = (t) => {
  const { s, c, t: e } = EDGE;
  const u = 1 - t;
  return [u * u * s[0] + 2 * u * t * c[0] + t * t * e[0], u * u * s[1] + 2 * u * t * c[1] + t * t * e[1]];
};

const feather = ([bx, by], angleDeg, len, width) => {
  const dx = Math.cos(rad(angleDeg));
  const dy = Math.sin(rad(angleDeg));
  const nx = -dy;
  const ny = dx;
  const at = (t, side) => [bx + dx * len * t + nx * side, by + dy * len * t + ny * side];
  const tip = at(1, 0);
  const a1 = at(0.2, width);
  const a2 = at(0.78, width * 0.8);
  const b2 = at(0.82, -width * 0.55);
  const b1 = at(0.25, -width * 0.75);
  return `M${f(bx)} ${f(by)} C${f(a1[0])} ${f(a1[1])} ${f(a2[0])} ${f(a2[1])} ${f(tip[0])} ${f(tip[1])} C${f(b2[0])} ${f(b2[1])} ${f(b1[0])} ${f(b1[1])} ${f(bx)} ${f(by)}Z`;
};

// Feathers hang from the leading edge; drawn tip-first so inner feathers overlap outer ones.
const row = ({ count, tFrom, tTo, angleFrom, angleTo, lenFrom, lenTo, width, drop, fill }) => {
  const paths = [];
  for (let i = count - 1; i >= 0; i--) {
    const k = i / (count - 1);
    const t = lerp(tFrom, tTo, k);
    const [x, y] = edgeAt(t);
    const len = lerp(lenFrom, lenTo, Math.pow(k, 1.15));
    paths.push(`<path d="${feather([x, y + drop], lerp(angleFrom, angleTo, k), len, width)}" fill="${fill}"/>`);
  }
  return paths.join("\n      ");
};

const edgePath = (() => {
  const { s, c, t } = EDGE;
  return `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${t[0]} ${t[1]}`;
})();

const leftWing = `
      ${row({ count: 12, tFrom: 0.08, tTo: 1, angleFrom: 100, angleTo: 152, lenFrom: 150, lenTo: 330, width: 27, drop: 6, fill: "url(#featherDeep)" })}
      ${row({ count: 10, tFrom: 0.06, tTo: 0.93, angleFrom: 98, angleTo: 148, lenFrom: 95, lenTo: 185, width: 30, drop: 4, fill: "url(#featherMid)" })}
      ${row({ count: 9, tFrom: 0.05, tTo: 0.86, angleFrom: 95, angleTo: 140, lenFrom: 60, lenTo: 100, width: 30, drop: 2, fill: "url(#featherLight)" })}
      <path d="${edgePath}" fill="none" stroke="${INK}" stroke-width="48" stroke-linecap="round"/>
      <path d="${edgePath}" fill="none" stroke="url(#edge)" stroke-width="36" stroke-linecap="round"/>`;

const starPoints = () => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = rad(-90 + i * 36);
    const r = i % 2 === 0 ? STAR.R : STAR.r;
    pts.push([STAR.cx + Math.cos(a) * r, STAR.cy + Math.sin(a) * r]);
  }
  return pts;
};

const facets = () => {
  const pts = starPoints();
  return pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const fill = i % 2 === 0 ? "url(#facetLight)" : "url(#facetDark)";
    return `<path d="M${STAR.cx} ${STAR.cy} L${f(p[0])} ${f(p[1])} L${f(q[0])} ${f(q[1])}Z" fill="${fill}"/>`;
  }).join("\n  ");
};

const outline = starPoints().map((p, i) => `${i ? "L" : "M"}${f(p[0])} ${f(p[1])}`).join(" ") + "Z";

const VIEW = { y: 165, h: 580 };
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${VIEW.y} ${W} ${VIEW.h}" width="${W}" height="${VIEW.h}">
  <defs>
    <linearGradient id="featherDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4A62A"/><stop offset="1" stop-color="#9E6A0C"/></linearGradient>
    <linearGradient id="featherMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7CF5C"/><stop offset="1" stop-color="#CF931C"/></linearGradient>
    <linearGradient id="featherLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A6"/><stop offset="1" stop-color="#EBB63A"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF0BC"/><stop offset="1" stop-color="#E7AE2E"/></linearGradient>
    <linearGradient id="facetLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF2C0"/><stop offset="1" stop-color="#F3C34B"/></linearGradient>
    <linearGradient id="facetDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2A622"/><stop offset="1" stop-color="#A06A0A"/></linearGradient>
  </defs>
  <g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    <g>${leftWing}
    </g>
    <g transform="translate(${W} 0) scale(-1 1)">${leftWing}
    </g>
  </g>
  <path d="${outline}" fill="none" stroke="${INK}" stroke-width="24" stroke-linejoin="round"/>
  ${facets()}
  <path d="${outline}" fill="none" stroke="#FFF6D6" stroke-width="4" stroke-linejoin="round" opacity=".85"/>
</svg>
`;

const out = path.join(__dirname, "..", "images", "logo.svg");
fs.writeFileSync(out, svg);
console.log("wrote", out);
