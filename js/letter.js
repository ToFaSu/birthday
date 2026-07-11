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