// ── AudioContext ──────────────────────────────────────
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function makeNoise(ctx, dur = 0.5) {
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// ── ドラム音源 ─────────────────────────────────────────

function playKick(ctx, t) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.45);
  g.gain.setValueAtTime(1.0, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  osc.connect(g).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.5);
}

function playSnare(ctx, t) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoise(ctx, 0.25);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass'; filter.frequency.value = 3000; filter.Q.value = 0.5;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  noise.connect(filter).connect(g).connect(ctx.destination);
  noise.start(t); noise.stop(t + 0.25);

  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = 'triangle'; osc.frequency.value = 180;
  og.gain.setValueAtTime(0.6, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(og).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.1);
}

function playHihatClosed(ctx, t) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoise(ctx, 0.1);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 8000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  noise.connect(filter).connect(g).connect(ctx.destination);
  noise.start(t); noise.stop(t + 0.1);
}

function playHihatOpen(ctx, t) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoise(ctx, 0.5);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.4, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  noise.connect(filter).connect(g).connect(ctx.destination);
  noise.start(t); noise.stop(t + 0.5);
}

function playTom(ctx, t, freq) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.2);
  g.gain.setValueAtTime(0.8, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(g).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.35);
}

function playCrash(ctx, t) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoise(ctx, 1.5);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 4000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  noise.connect(filter).connect(g).connect(ctx.destination);
  noise.start(t); noise.stop(t + 1.5);
}

function playRide(ctx, t) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoise(ctx, 0.8);
  const nf = ctx.createBiquadFilter();
  nf.type = 'bandpass'; nf.frequency.value = 5000; nf.Q.value = 2;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.28, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  noise.connect(nf).connect(ng).connect(ctx.destination);
  noise.start(t); noise.stop(t + 0.8);

  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.frequency.value = 5800; osc.type = 'sine';
  og.gain.setValueAtTime(0.1, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(og).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.6);
}

function playClap(ctx, t) {
  for (let i = 0; i < 3; i++) {
    const ti = t + i * 0.012;
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoise(ctx, 0.06);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 1200; filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, ti);
    g.gain.exponentialRampToValueAtTime(0.001, ti + 0.05);
    noise.connect(filter).connect(g).connect(ctx.destination);
    noise.start(ti); noise.stop(ti + 0.06);
  }
}

// ── ドラムマップ ───────────────────────────────────────
const DRUMS = {
  kick:  (ctx, t) => playKick(ctx, t),
  snare: (ctx, t) => playSnare(ctx, t),
  ch:    (ctx, t) => playHihatClosed(ctx, t),
  oh:    (ctx, t) => playHihatOpen(ctx, t),
  htom:  (ctx, t) => playTom(ctx, t, 350),
  mtom:  (ctx, t) => playTom(ctx, t, 250),
  crash: (ctx, t) => playCrash(ctx, t),
  ride:  (ctx, t) => playRide(ctx, t),
  clap:  (ctx, t) => playClap(ctx, t),
};

function triggerDrum(drumId, time) {
  const ctx = getCtx();
  const fn = DRUMS[drumId];
  if (fn) fn(ctx, time ?? ctx.currentTime);
}

// ── ビジュアライザー ───────────────────────────────────
const visBarsEl = document.getElementById('vis-bars');
for (let i = 0; i < 28; i++) {
  const b = document.createElement('div');
  b.className = 'vis-bar';
  visBarsEl.appendChild(b);
}
const visBars = [...visBarsEl.querySelectorAll('.vis-bar')];

let visFrame = 0;
let visDecay = 0;
let visHot = false;

function flashVis(drumId) {
  visHot = ['kick', 'crash', 'clap'].includes(drumId);
  visDecay = drumId === 'crash' ? 55 : drumId === 'oh' ? 30 : 15;
}

(function animateVis() {
  requestAnimationFrame(animateVis);
  visBars.forEach((bar, i) => {
    if (visDecay > 0) {
      const v = (visDecay / 55) * Math.abs(Math.sin(visFrame * 0.35 + i * 0.52));
      bar.style.height = Math.round(3 + v * 27) + 'px';
      bar.classList.add('lit');
      bar.classList.toggle('hot', visHot);
    } else {
      bar.style.height = '3px';
      bar.classList.remove('lit', 'hot');
    }
  });
  if (visDecay > 0) visDecay--;
  visFrame++;
})();

// ── パッド UI ──────────────────────────────────────────
function flashPad(drumId) {
  const pad = document.querySelector(`.pad[data-drum="${drumId}"]`);
  if (!pad) return;
  pad.classList.add('active');
  setTimeout(() => pad.classList.remove('active'), 110);
}

document.querySelectorAll('.pad').forEach(pad => {
  const drum = pad.dataset.drum;

  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.target.releasePointerCapture(e.pointerId);
    triggerDrum(drum);
    flashPad(drum);
    flashVis(drum);
  });
});

// ── キーボード対応 ─────────────────────────────────────
const KEY_MAP = {
  q: 'oh', w: 'ch', e: 'crash', r: 'ride',
  a: 'htom', s: 'mtom', d: 'snare', f: 'clap',
  ' ': 'kick',
};

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const drum = KEY_MAP[e.key.toLowerCase()];
  if (!drum) return;
  e.preventDefault();
  triggerDrum(drum);
  flashPad(drum);
  flashVis(drum);
});

// ── パターン定義（16ステップ） ────────────────────────
// 1=on, 0=off  / 1ステップ = 16分音符
const PATTERNS = {
  beat4: {
    hh:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
  },
  beat8: {
    hh:    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
  },
};

// ── ステップ表示 ───────────────────────────────────────
const STEP_COUNT = 16;
const rowIds = { hh: 'steps-hh', kick: 'steps-kick', snare: 'steps-snare' };
const stepCells = { hh: [], kick: [], snare: [] };

function buildStepDisplay(patternKey) {
  const p = PATTERNS[patternKey];
  Object.entries(rowIds).forEach(([key, elId]) => {
    const el = document.getElementById(elId);
    el.innerHTML = '';
    stepCells[key] = [];
    for (let i = 0; i < STEP_COUNT; i++) {
      const cell = document.createElement('div');
      cell.className = 'step-cell' + (p[key][i] ? ' on' : '');
      el.appendChild(cell);
      stepCells[key].push(cell);
    }
  });
}

function clearStepDisplay() {
  Object.values(rowIds).forEach(elId => { document.getElementById(elId).innerHTML = ''; });
  Object.keys(stepCells).forEach(k => { stepCells[k] = []; });
}

function markCurrentStep(step) {
  Object.keys(stepCells).forEach(key => {
    stepCells[key].forEach((cell, i) => cell.classList.toggle('current', i === step));
  });
}

// ── スケジューラー ─────────────────────────────────────
let bpm = 120;
let currentPatternKey = null;
let schedulerTimer = null;
let nextStepTime = 0;
let currentStep = 0;
const LOOKAHEAD = 0.1;

function scheduleStep(step, t) {
  const p = PATTERNS[currentPatternKey];
  if (p.hh[step])    { triggerDrum('ch', t);    flashPad('ch');    flashVis('ch'); }
  if (p.kick[step])  { triggerDrum('kick', t);  flashPad('kick');  flashVis('kick'); }
  if (p.snare[step]) { triggerDrum('snare', t); flashPad('snare'); flashVis('snare'); }

  const delay = Math.max(0, (t - getCtx().currentTime) * 1000);
  setTimeout(() => markCurrentStep(step), delay);
}

function runScheduler() {
  const ctx = getCtx();
  while (nextStepTime < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(currentStep, nextStepTime);
    nextStepTime += 60 / bpm / 4;
    currentStep = (currentStep + 1) % STEP_COUNT;
  }
}

function startPattern(patternKey) {
  stopAutoPlay();
  currentPatternKey = patternKey;
  buildStepDisplay(patternKey);
  const ctx = getCtx();
  nextStepTime = ctx.currentTime + 0.05;
  currentStep = 0;
  schedulerTimer = setInterval(runScheduler, 25);

  statusDot.className = 'playing';
  statusText.textContent = patternKey === 'beat4' ? '4ビート再生中' : '8ビート再生中';
  document.querySelectorAll('.pattern-btn').forEach(b =>
    b.classList.toggle('playing', b.dataset.pattern === patternKey)
  );
  stopBtn.disabled = false;
}

function stopAutoPlay() {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
  currentPatternKey = null;
  currentStep = 0;
  clearStepDisplay();
  statusDot.className = '';
  statusText.textContent = '準備完了';
  document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('playing'));
  stopBtn.disabled = true;
}

// ── BPM コントロール ───────────────────────────────────
const bpmValue  = document.getElementById('bpm-value');
const bpmSlider = document.getElementById('bpm-slider');

function setBpm(v) {
  bpm = Math.min(200, Math.max(60, Math.round(v)));
  bpmValue.textContent = bpm;
  bpmSlider.value = bpm;
}

document.getElementById('bpm-down').addEventListener('click', () => setBpm(bpm - 5));
document.getElementById('bpm-up').addEventListener('click',   () => setBpm(bpm + 5));
bpmSlider.addEventListener('input', () => setBpm(Number(bpmSlider.value)));

// ── ボタンイベント ─────────────────────────────────────
const statusDot  = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const stopBtn    = document.getElementById('stop-btn');

document.querySelectorAll('.pattern-btn').forEach(btn => {
  btn.addEventListener('click', () => startPattern(btn.dataset.pattern));
});
stopBtn.addEventListener('click', stopAutoPlay);
