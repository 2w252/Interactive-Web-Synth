const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let waveType = 'sine';
let attackTime = 0.1;
let releaseTime = 0.6;
let mainVolume = 0.6;

let filterCutoff = 2000;
let filterQ = 1.0;

let delayTimeVal = 0.3;
let delayFeedbackVal = 0.4;

let lfoRateVal = 4.0;
let lfoDepthVal = 300;

const filterNode = audioCtx.createBiquadFilter();
filterNode.type = 'lowpass';
filterNode.frequency.value = filterCutoff;
filterNode.Q.value = filterQ;

const delayNode = audioCtx.createDelay(1.0);
const feedbackNode = audioCtx.createGain();

delayNode.delayTime.value = delayTimeVal;
feedbackNode.gain.value = delayFeedbackVal;

delayNode.connect(feedbackNode);
feedbackNode.connect(delayNode);

const masterGain = audioCtx.createGain();
masterGain.gain.value = mainVolume;

filterNode.connect(masterGain);

filterNode.connect(delayNode);
delayNode.connect(masterGain);

masterGain.connect(analyser);
analyser.connect(audioCtx.destination);

const activeVoices = {};

const waveButtons = document.querySelectorAll('.wave-btn');
const volSlider = document.getElementById('volume');
const volVal = document.getElementById('volume-val');
const cutoffSlider = document.getElementById('cutoff');
const cutoffVal = document.getElementById('cutoff-val');
const resonanceSlider = document.getElementById('resonance');
const resonanceVal = document.getElementById('resonance-val');
const delayTimeSlider = document.getElementById('delay-time');
const delayTimeLabel = document.getElementById('delay-time-val');
const delayFeedbackSlider = document.getElementById('delay-feedback');
const delayFeedbackLabel = document.getElementById('delay-feedback-val');
const attackSlider = document.getElementById('attack');
const attackVal = document.getElementById('attack-val');
const releaseSlider = document.getElementById('release');
const releaseVal = document.getElementById('release-val');
const lfoRateSlider = document.getElementById('lfo-rate');
const lfoRateLabel = document.getElementById('lfo-rate-val');
const lfoDepthSlider = document.getElementById('lfo-depth');
const lfoDepthLabel = document.getElementById('lfo-depth-val');
const presetButtons = document.querySelectorAll('.preset-btn');
const keys = document.querySelectorAll('.key');

const presets = {
  space: {
    wave: 'sine',
    volume: 60,
    cutoff: 2500,
    resonance: 2.0,
    delayTime: 0.4,
    delayFeedback: 60,
    attack: 0.15,
    release: 0.8,
    lfoRate: 5.0,
    lfoDepth: 400
  },
  bass: {
    wave: 'sawtooth',
    volume: 75,
    cutoff: 600,
    resonance: 4.0,
    delayTime: 0.1,
    delayFeedback: 15,
    attack: 0.02,
    release: 0.3,
    lfoRate: 1.5,
    lfoDepth: 100
  },
  retro: {
    wave: 'square',
    volume: 50,
    cutoff: 5000,
    resonance: 0.5,
    delayTime: 0.25,
    delayFeedback: 30,
    attack: 0.01,
    release: 0.2,
    lfoRate: 8.0,
    lfoDepth: 150
  }
};

function loadPreset(name) {
  const p = presets[name];
  if (!p) return;

  waveType = p.wave;
  waveButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-wave') === p.wave);
  });

  volSlider.value = p.volume;
  volVal.textContent = p.volume + '%';
  mainVolume = p.volume / 100;
  masterGain.gain.setValueAtTime(mainVolume, audioCtx.currentTime);

  cutoffSlider.value = p.cutoff;
  cutoffVal.textContent = p.cutoff + ' Hz';
  filterCutoff = p.cutoff;
  filterNode.frequency.setValueAtTime(filterCutoff, audioCtx.currentTime);

  resonanceSlider.value = p.resonance;
  resonanceVal.textContent = p.resonance.toFixed(1);
  filterQ = p.resonance;
  filterNode.Q.setValueAtTime(filterQ, audioCtx.currentTime);

  delayTimeSlider.value = p.delayTime;
  delayTimeLabel.textContent = p.delayTime + 's';
  delayNode.delayTime.setValueAtTime(p.delayTime, audioCtx.currentTime);

  delayFeedbackSlider.value = p.delayFeedback;
  delayFeedbackLabel.textContent = p.delayFeedback + '%';
  feedbackNode.gain.setValueAtTime(p.delayFeedback / 100, audioCtx.currentTime);

  attackSlider.value = p.attack;
  attackVal.textContent = p.attack.toFixed(2) + 's';
  attackTime = p.attack;

  releaseSlider.value = p.release;
  releaseVal.textContent = p.release.toFixed(2) + 's';
  releaseTime = p.release;

  lfoRateSlider.value = p.lfoRate;
  lfoRateLabel.textContent = p.lfoRate.toFixed(1) + ' Hz';
  lfoRateVal = p.lfoRate;

  lfoDepthSlider.value = p.lfoDepth;
  lfoDepthLabel.textContent = p.lfoDepth;
  lfoDepthVal = p.lfoDepth;
}

presetButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    presetButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    loadPreset(e.target.getAttribute('data-preset'));
  });
});

waveButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    waveButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    waveType = e.target.getAttribute('data-wave');
  });
});

volSlider.addEventListener('input', (e) => {
  mainVolume = parseInt(e.target.value) / 100;
  volVal.textContent = e.target.value + '%';
  masterGain.gain.setValueAtTime(mainVolume, audioCtx.currentTime);
});

cutoffSlider.addEventListener('input', (e) => {
  filterCutoff = parseInt(e.target.value);
  cutoffVal.textContent = filterCutoff + ' Hz';
  filterNode.frequency.setValueAtTime(filterCutoff, audioCtx.currentTime);
});

resonanceSlider.addEventListener('input', (e) => {
  filterQ = parseFloat(e.target.value);
  resonanceVal.textContent = filterQ.toFixed(1);
  filterNode.Q.setValueAtTime(filterQ, audioCtx.currentTime);
});

delayTimeSlider.addEventListener('input', (e) => {
  delayTimeVal = parseFloat(e.target.value);
  delayTimeLabel.textContent = delayTimeVal + 's';
  delayNode.delayTime.setValueAtTime(delayTimeVal, audioCtx.currentTime);
});

delayFeedbackSlider.addEventListener('input', (e) => {
  delayFeedbackVal = parseInt(e.target.value) / 100;
  delayFeedbackLabel.textContent = e.target.value + '%';
  feedbackNode.gain.setValueAtTime(delayFeedbackVal, audioCtx.currentTime);
});

attackSlider.addEventListener('input', (e) => {
  attackTime = parseFloat(e.target.value);
  attackVal.textContent = attackTime.toFixed(2) + 's';
});

releaseSlider.addEventListener('input', (e) => {
  releaseTime = parseFloat(e.target.value);
  releaseVal.textContent = releaseTime.toFixed(2) + 's';
});

lfoRateSlider.addEventListener('input', (e) => {
  lfoRateVal = parseFloat(e.target.value);
  lfoRateLabel.textContent = lfoRateVal.toFixed(1) + ' Hz';
});

lfoDepthSlider.addEventListener('input', (e) => {
  lfoDepthVal = parseInt(e.target.value);
  lfoDepthLabel.textContent = lfoDepthVal;
});

function startNote(frequency) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (activeVoices[frequency]) {
    stopNote(frequency);
  }

  const osc = audioCtx.createOscillator();
  osc.type = waveType;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  const ampGain = audioCtx.createGain();
  ampGain.gain.setValueAtTime(0, audioCtx.currentTime);
  ampGain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + attackTime);

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = lfoRateVal;
  lfoGain.gain.value = lfoDepthVal;

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  osc.connect(ampGain);
  ampGain.connect(filterNode);

  lfo.start();
  osc.start();

  activeVoices[frequency] = { osc, ampGain, lfo };
}

function stopNote(frequency) {
  const voice = activeVoices[frequency];
  if (voice) {
    const { osc, ampGain, lfo } = voice;
    const now = audioCtx.currentTime;
    
    ampGain.gain.cancelScheduledValues(now);
    ampGain.gain.setValueAtTime(ampGain.gain.value, now);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);
    
    osc.stop(now + releaseTime);
    lfo.stop(now + releaseTime);
    
    delete activeVoices[frequency];
  }
}

const keyMap = {
  'a': keys[0],
  'w': keys[8],
  's': keys[1],
  'e': keys[9],
  'd': keys[2],
  'f': keys[3],
  't': keys[10],
  'g': keys[4],
  'y': keys[11],
  'h': keys[5],
  'u': keys[12],
  'j': keys[6],
  'k': keys[7]
};

keys.forEach(key => {
  const freq = parseFloat(key.getAttribute('data-note'));
  
  key.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    key.classList.add('active');
    startNote(freq);
  });

  key.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    key.classList.remove('active');
    stopNote(freq);
  });

  key.addEventListener('mouseleave', (e) => {
    e.stopPropagation();
    key.classList.remove('active');
    stopNote(freq);
  });
  
  key.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    key.classList.add('active');
    startNote(freq);
  });

  key.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    key.classList.remove('active');
    stopNote(freq);
  });
});

window.addEventListener('keydown', (e) => {
  const keyEl = keyMap[e.key.toLowerCase()];
  if (keyEl && !keyEl.classList.contains('active')) {
    keyEl.classList.add('active');
    startNote(parseFloat(keyEl.getAttribute('data-note')));
  }
});

window.addEventListener('keyup', (e) => {
  const keyEl = keyMap[e.key.toLowerCase()];
  if (keyEl) {
    keyEl.classList.remove('active');
    stopNote(parseFloat(keyEl.getAttribute('data-note')));
  }
});

const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = '#050508';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.strokeStyle = 'rgba(255,255,255,0.02)';
  canvasCtx.lineWidth = 1;
  canvasCtx.beginPath();
  for (let i = 0; i < canvas.width; i += 30) {
    canvasCtx.moveTo(i, 0);
    canvasCtx.lineTo(i, canvas.height);
  }
  for (let j = 0; j < canvas.height; j += 20) {
    canvasCtx.moveTo(0, j);
    canvasCtx.lineTo(canvas.width, j);
  }
  canvasCtx.stroke();

  canvasCtx.shadowBlur = 10;
  canvasCtx.shadowColor = '#00f0ff';
  canvasCtx.lineWidth = 3;
  canvasCtx.strokeStyle = '#00f0ff';
  canvasCtx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * (canvas.height / 2);

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
  
  canvasCtx.shadowBlur = 0;
}
draw();

loadPreset('space');
