/* Harmonograf — Levha VII
   İki dik sarkaç salınımının izi: Lissajous (sönümsüz) ve harmonograf (sönümlü).
   x = sin(fx·t + φ)·e^(−δt),  y = sin(fy·t)·e^(−δt).  Bağımlılık yok. */

const { sin, cos, PI, min, max, exp, abs, round, hypot } = Math;
const TAU = 2 * PI;
const fmt2 = (v) => v.toFixed(2).replace(".", ",");

/* renk gradyanı (çini → mor → pas) */
const STOPS = [[46,111,142],[125,75,181],[181,67,44]];
function grad(u) {
  u = max(0, min(1, u));
  const seg = min(1, u * 2 | 0), f = u * 2 - seg;
  const a = STOPS[seg], b = STOPS[seg + 1] || STOPS[seg];
  return `rgb(${a.map((c,i)=>round(c+(b[i]-c)*f)).join(",")})`;
}

const state = {
  fx: 3, fy: 2, phase: PI / 2, damp: 0, speed: 3, color: true,
  t: 0, pts: [], done: false,
};

/* ---------- kanvas ---------- */
const board = document.getElementById("board");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, DPR = 1, R = 200;
function resize() {
  DPR = window.devicePixelRatio || 1;
  W = board.clientWidth;
  H = max(400, Math.round(window.innerHeight - board.getBoundingClientRect().top - 150));
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  canvas.style.height = H + "px";
  R = min(W, H) * 0.4;
  restart();
}
window.addEventListener("resize", resize);

function point(t) {
  const d = state.damp / 1000;
  const env = exp(-d * t);
  return [
    W / 2 + R * sin(state.fx * t + state.phase) * env,
    H / 2 + R * sin(state.fy * t) * env,
  ];
}

function restart() {
  state.t = 0; state.pts = []; state.done = false;
}

/* ---------- döngü ---------- */
function loop() {
  const steps = state.speed * 3;
  const dt = 0.012;
  if (!state.done) {
    for (let i = 0; i < steps; i++) {
      state.t += dt;
      state.pts.push(point(state.t));
    }
    // sönümlüyse zarf yeterince küçülünce bitir
    if (state.damp > 0) {
      const env = exp(-(state.damp / 1000) * state.t);
      if (env < 0.012) state.done = true;
    } else if (state.pts.length > 20000) {
      // sönümsüz: sabit uzunlukta kayan iz
      state.pts.splice(0, state.pts.length - 20000);
    }
  }
  draw();
  requestAnimationFrame(loop);
}

function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const pts = state.pts;
  if (pts.length < 2) return;
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.lineWidth = 1.4;

  if (state.color) {
    // segment segment renkli (zamana göre)
    const n = pts.length;
    const stepC = max(1, (n / 240) | 0); // renk çözünürlüğü
    for (let i = 1; i < n; i += stepC) {
      ctx.strokeStyle = grad((i / n));
      ctx.beginPath();
      ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
      const end = min(n - 1, i + stepC);
      for (let j = i; j <= end; j++) ctx.lineTo(pts[j][0], pts[j][1]);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = "rgba(34,51,79,0.8)";
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }

  // kalem ucu
  if (!state.done) {
    const [px, py] = pts[pts.length - 1];
    ctx.fillStyle = "#22334f";
    ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU); ctx.fill();
  }
}

/* ---------- oran okuma ---------- */
function gcd(a, b) { a = round(a * 100); b = round(b * 100); while (b) { [a, b] = [b, a % b]; } return a / 100; }
function updateReadout() {
  const ro = document.getElementById("readout");
  const g = gcd(state.fx, state.fy) || 1;
  const p = round(state.fx / g), q = round(state.fy / g);
  const simple = p <= 12 && q <= 12 && abs(p * g - state.fx) < 0.02 && abs(q * g - state.fy) < 0.02;
  ro.innerHTML = simple ? `oran <b>${p}:${q}</b>` : `oran ${(state.fx / state.fy).toFixed(3)} (kapanmaz)`;
}

/* ---------- kontroller ---------- */
function bind(id, valId, key, transform, restartToo = true) {
  const el = document.getElementById(id);
  el.addEventListener("input", () => {
    state[key] = key === "phase" ? +el.value * PI / 180 : +el.value;
    document.getElementById(valId).textContent = transform(+el.value);
    if (restartToo) restart();
    updateReadout();
  });
}
bind("fxSlider", "fxVal", "fx", fmt2);
bind("fySlider", "fyVal", "fy", fmt2);
bind("phSlider", "phVal", "phase", (v) => v + "°");
bind("dmSlider", "dmVal", "damp", (v) => (v / 1000).toFixed(3).replace(".", ","));
document.getElementById("spSlider").addEventListener("input", (e) => {
  state.speed = +e.target.value; document.getElementById("spVal").textContent = "×" + state.speed;
});
document.getElementById("colorChk").addEventListener("change", (e) => (state.color = e.target.checked));
document.getElementById("redrawBtn").addEventListener("click", restart);

function setS(id, valId, key, v, tf) {
  document.getElementById(id).value = v;
  state[key] = key === "phase" ? v * PI / 180 : v;
  document.getElementById(valId).textContent = tf(v);
}
const PRESETS = {
  //        fx,   fy,   phase°, damp
  circle:  [3,    3,    90,    0],
  fifth:   [3,    2,    90,    0],
  third:   [5,    4,    90,    0],
  classic: [2.01, 3.03, 60,    9],
  rose:    [5,    3,    0,     6],
};
document.querySelectorAll("[data-preset]").forEach((b) =>
  b.addEventListener("click", () => {
    const [fx, fy, ph, dm] = PRESETS[b.dataset.preset];
    setS("fxSlider", "fxVal", "fx", fx, fmt2);
    setS("fySlider", "fyVal", "fy", fy, fmt2);
    setS("phSlider", "phVal", "phase", ph, (v) => v + "°");
    setS("dmSlider", "dmVal", "damp", dm, (v) => (v / 1000).toFixed(3).replace(".", ","));
    restart(); updateReadout();
  })
);

/* ---------- sayfa geçişi ---------- */
document.addEventListener("click", (ev) => {
  const a = ev.target.closest("a.page-link");
  if (!a || !a.getAttribute("href") || a.target === "_blank") return;
  ev.preventDefault();
  document.body.classList.add("leaving");
  setTimeout(() => (location.href = a.href), 240);
});

/* ---------- bilgi modalı ---------- */
(() => {
  const m = document.getElementById("infoModal"), b = document.getElementById("infoBtn");
  if (!m || !b) return;
  b.addEventListener("click", () => (m.hidden = false));
  document.getElementById("infoClose").addEventListener("click", () => (m.hidden = true));
  m.addEventListener("click", (ev) => { if (ev.target === m) m.hidden = true; });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") m.hidden = true; });
})();

/* ---------- başlangıç ---------- */
resize();
updateReadout();
loop();
