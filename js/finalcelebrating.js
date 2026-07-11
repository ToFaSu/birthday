const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
 
function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
 
const palettes = [
  ['#ff6fa5','#ffcf6b','#fff3e6'],
  ['#7be0d0','#6fe0a5','#c8ffe8'],
  ['#c99bff','#ff9f6b','#ffe1ee'],
  ['#ff5e5e','#ffd166','#ffffff'],
  ['#5ec8ff','#a0f0ff','#ffffff']
];
 
let particles = [];
let rockets = [];
 
function randRange(a,b){ return a + Math.random()*(b-a); }
 
/* A rocket is launched from bottom, travels up, then explodes into particles */
function launchRocket(){
  const x = randRange(canvas.width*0.1, canvas.width*0.9);
  const targetY = randRange(canvas.height*0.15, canvas.height*0.5);
  const palette = palettes[Math.floor(Math.random()*palettes.length)];
  rockets.push({
    x, y: canvas.height + 10,
    targetY,
    vy: randRange(-9.5, -7.5),
    color: palette[0],
    palette,
    trail: [],
    style: Math.random() > 0.5 ? 'burst' : 'ring'
  });
}
 
function explode(x, y, palette, style){
  const count = style === 'ring' ? 60 : 70;
  for(let i=0;i<count;i++){
    let angle, speed;
    if(style === 'ring'){
      angle = (Math.PI*2 * i) / count;
      speed = randRange(3.5, 4.5);
    } else {
      angle = Math.random()*Math.PI*2;
      speed = randRange(1.5, 6.5);
    }
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      color: palette[Math.floor(Math.random()*palette.length)],
      size: randRange(2, 3.5),
      gravity: 0.045,
      drag: 0.985,
      life: 0,
      maxLife: randRange(60, 100),
      sparkle: Math.random() > 0.6
    });
  }
  // small flash at explosion center
  particles.push({
    x, y, vx:0, vy:0,
    color:'#ffffff',
    size: 30,
    gravity:0, drag:1,
    life:0, maxLife:8,
    flash:true
  });
}
 
function updateRockets(){
  rockets.forEach(r=>{
    r.trail.push({x:r.x, y:r.y});
    if(r.trail.length > 8) r.trail.shift();
    r.x += Math.sin(r.y*0.02)*0.4;
    r.y += r.vy;
    r.vy += 0.03;
  });
 
  rockets = rockets.filter(r=>{
    if(r.y <= r.targetY || r.vy >= -0.5){
      explode(r.x, r.y, r.palette, r.style);
      return false;
    }
    return true;
  });
}
 
function drawRockets(){
  rockets.forEach(r=>{
    r.trail.forEach((t,i)=>{
      ctx.globalAlpha = i / r.trail.length * 0.6;
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.8, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(r.x, r.y, 2.2, 0, Math.PI*2);
    ctx.fill();
  });
}
 
function updateParticles(){
  particles.forEach(p=>{
    if(p.flash) { p.life++; return; }
    p.vx *= p.drag;
    p.vy = p.vy*p.drag + p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
  });
  particles = particles.filter(p => p.life < p.maxLife);
}
 
function drawParticles(){
  particles.forEach(p=>{
    const fade = Math.max(0, 1 - p.life/p.maxLife);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.flash ? 0 : 8;
    const size = p.flash ? p.size * fade : p.size;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });
}
 
function loop(){
  // trailing fade effect instead of full clear, for glowing streaks
  ctx.fillStyle = 'rgba(14,8,32,0.25)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
 
  updateRockets();
  updateParticles();
  drawRockets();
  drawParticles();
 
  requestAnimationFrame(loop);
}
loop();
 
/* Continuously launch rockets at random intervals for a non-stop show */
function scheduleNextLaunch(){
  const delay = randRange(350, 900);
  setTimeout(()=>{
    launchRocket();
    // occasionally launch a quick double/triple burst
    if(Math.random() > 0.7){
      setTimeout(launchRocket, 150);
    }
    scheduleNextLaunch();
  }, delay);
}
 
// Start the show as soon as the page loads
window.addEventListener('DOMContentLoaded', () => {
  launchRocket();
  scheduleNextLaunch();
});




const audio = document.getElementById('audio');

window.addEventListener('DOMContentLoaded', () => {
  const savedTime = localStorage.getItem('audioTime');
  const wasPlaying = localStorage.getItem('audioPlaying');

  function restore() {
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
    }
    if (wasPlaying === 'true') {
      audio.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }

  // If metadata is already available, restore immediately.
  // readyState >= 1 means HAVE_METADATA or higher.
  if (audio.readyState >= 1) {
    restore();
  } else {
    audio.addEventListener('loadedmetadata', restore);
  }
});

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