/* ========== Build candles ========== */
const CANDLE_COUNT = 5;
const candleRow = document.getElementById('candleRow');
for(let i=0;i<CANDLE_COUNT;i++){
  const c = document.createElement('div');
  c.className='candle';
  c.innerHTML = `
    <div class="wick"></div>
    <div class="glow"></div>
    <div class="flame-wrap"><div class="flame"></div></div>
    <div class="smoke"></div>
  `;
  candleRow.appendChild(c);
}

/* ========== Blow out candles + confetti ========== */
const blowBtn = document.getElementById('blowBtn');
const wishText = document.getElementById('wishText');
const nextbtn = document.getElementById('nextbtn');
let blown = false;

blowBtn.addEventListener('click', () => {
  if(blown) return;
  blown = true;
  document.querySelectorAll('.candle').forEach((c, i)=>{
    setTimeout(()=> c.classList.add('out'), i*90);
  });
  setTimeout(()=>{
    wishText.classList.add('show');
    launchConfettiBurst();
  }, CANDLE_COUNT*90 + 150);
  blowBtn.disabled = true;
  // blowBtn.textContent = ' Next Surprise';
  blowBtn.hidden = true;
 document.getElementById('nextbtn').style.visibility = 'visible';
});

/* ========== Confetti / party poppers ========== */
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const colors = ['#ff6fa5','#ffcf6b','#7be0d0','#c99bff','#ff9f6b','#6fe0a5','#ffe1ee'];
let particles = [];

function makeParticle(x,y,angleDeg,spread){
  const angle = (angleDeg + (Math.random()-0.5)*spread) * Math.PI/180;
  const speed = 6 + Math.random()*10;
  return {
    x,y,
    vx: Math.cos(angle)*speed,
    vy: Math.sin(angle)*speed,
    size: 5 + Math.random()*6,
    color: colors[Math.floor(Math.random()*colors.length)],
    rotation: Math.random()*360,
    rotSpeed: (Math.random()-0.5)*20,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    gravity: 0.28 + Math.random()*0.12,
    drag: 0.985,
    life: 0,
    maxLife: 110 + Math.random()*60
  };
}

function burstAt(x,y,count,angle,spread){
  for(let i=0;i<count;i++){
    particles.push(makeParticle(x,y,angle,spread));
  }
}

function launchConfettiBurst(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  burstAt(w*0.1, h*0.9, 60, -70, 50);
  burstAt(w*0.9, h*0.9, 60, -110, 50);
  burstAt(w*0.5, h, 80, -90, 40);
  burstAt(0, h*0.3, 45, 0, 60);
  burstAt(w, h*0.3, 45, 180, 60);
  burstAt(w*0.5, h*0.15, 40, 90, 150);

  if(!animating) animate();

  setTimeout(()=>{
    burstAt(w*0.2, h*0.8, 40, -80, 60);
    burstAt(w*0.8, h*0.8, 40, -100, 60);
    if(!animating) animate();
  }, 350);
  setTimeout(()=>{
    burstAt(w*0.5, h*0.9, 50, -90, 70);
    if(!animating) animate();
  }, 700);
}

let animating = false;
function animate(){
  animating = true;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.vx *= p.drag;
    p.vy = p.vy*p.drag + p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotSpeed;
    p.life++;

    const fade = Math.max(0, 1 - p.life/p.maxLife);
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rotation*Math.PI/180);
    ctx.globalAlpha = fade;
    ctx.fillStyle = p.color;
    if(p.shape==='rect'){
      ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*0.66);
    } else {
      ctx.beginPath();
      ctx.arc(0,0,p.size/2,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  });

  particles = particles.filter(p=> p.life < p.maxLife && p.y < window.innerHeight+50);

  if(particles.length>0){
    requestAnimationFrame(animate);
  } else {
    animating = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
}

/* ========== Song bar ========== */
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const disc = document.getElementById('disc');
const bars = document.getElementById('bars');
const volume = document.getElementById('volume');
const trackName = document.getElementById('trackName');

playBtn.addEventListener('click', ()=>{
  if(audio.paused){
    audio.play().catch(err=> console.log('Audio play blocked or failed:', err));
  } else {
    audio.pause();
  }
});

// Keep the disc/bars/button icon in sync with whatever actually plays or pauses
// the audio — whether triggered by playBtn OR the "Tap to Begin" overlay.
audio.addEventListener('play', () => {
  playBtn.textContent = '⏸';
  disc.classList.add('playing');
  bars.classList.add('playing');
});

audio.addEventListener('pause', () => {
  playBtn.textContent = '▶';
  disc.classList.remove('playing');
  bars.classList.remove('playing');
});

document.getElementById('prevBtn').addEventListener('click', ()=>{
  trackName.textContent = 'Happy Birthday Tune';
});
document.getElementById('nextBtn').addEventListener('click', ()=>{
  trackName.textContent = 'Celebration Song 🎶';
});

volume.addEventListener('input', ()=>{
  audio.volume = volume.value;
});
audio.volume = volume.value;

// Celebration page always starts the song from the beginning
window.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('audioTime');
  localStorage.removeItem('audioPlaying');
  audio.currentTime = 0;
});

// Still save progress as it plays, so the NEXT page can continue from here
audio.addEventListener('timeupdate', () => {
  localStorage.setItem('audioTime', audio.currentTime);
});

audio.addEventListener('play', () => {
  localStorage.setItem('audioPlaying', 'true');
});

audio.addEventListener('pause', () => {
  localStorage.setItem('audioPlaying', 'false');
});

window.addEventListener('beforeunload', () => {
  localStorage.setItem('audioTime', audio.currentTime);
  localStorage.setItem('audioPlaying', !audio.paused);
});