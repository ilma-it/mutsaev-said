/* ===================================================
   CUSTOM VIDEO PLAYER CONTROLLER - MOBILE & DESKTOP
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.video-container');
  const video = document.querySelector('.custom-video');
  const centerBtn = document.querySelector('.video-center-btn');
  const playBtn = document.querySelector('.play-toggle-btn');
  const timeline = document.querySelector('.video-timeline-container');
  const progress = document.querySelector('.video-progress');
  const buffer = document.querySelector('.video-buffer');
  const curTimeEl = document.querySelector('.video-time-current');
  const durTimeEl = document.querySelector('.video-time-total');
  const muteBtn = document.querySelector('.mute-btn');
  const volumeSlider = document.querySelector('.volume-slider');
  const fullscreenBtn = document.querySelector('.fullscreen-btn');

  if (!video || !container) return;

  // Explicitly ensure sound is unmuted and at 100%
  video.muted = false;
  video.volume = 1.0;
  if (volumeSlider) volumeSlider.value = 1.0;
  updateVolumeIcon();

  function togglePlay() {
    if (video.paused || video.ended) {
      if (video.muted) {
        video.muted = false;
        video.volume = volumeSlider ? parseFloat(volumeSlider.value) || 1.0 : 1.0;
        updateVolumeIcon();
      }
      video.play().catch(err => console.log('Play error:', err));
      container.classList.add('playing');
    } else {
      video.pause();
      container.classList.remove('playing');
    }
    updatePlayIcons();
  }

  function updatePlayIcons() {
    const isPaused = video.paused;
    if (playBtn) {
      playBtn.innerHTML = isPaused
        ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }
    if (centerBtn) {
      centerBtn.innerHTML = isPaused
        ? '<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }
  }

  // Play / Pause triggers
  centerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  playBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  video.addEventListener('click', togglePlay);

  // Time formatting
  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Update progress
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (progress) progress.style.width = `${pct}%`;
    if (curTimeEl) curTimeEl.textContent = formatTime(video.currentTime);
  });

  video.addEventListener('loadedmetadata', () => {
    if (durTimeEl) durTimeEl.textContent = formatTime(video.duration);
    video.muted = false;
    video.volume = volumeSlider ? parseFloat(volumeSlider.value) || 1.0 : 1.0;
    updateVolumeIcon();
  });

  // Progress buffer update
  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && video.duration) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferPct = (bufferedEnd / video.duration) * 100;
      if (buffer) buffer.style.width = `${bufferPct}%`;
    }
  });

  // Timeline scrub (Mouse & Touch)
  let isScrubbing = false;

  function scrub(clientX) {
    const rect = timeline.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
  }

  timeline?.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    scrub(e.clientX);
  });

  timeline?.addEventListener('touchstart', (e) => {
    isScrubbing = true;
    scrub(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    if (isScrubbing) scrub(e.clientX);
  });

  window.addEventListener('touchmove', (e) => {
    if (isScrubbing) scrub(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    if (isScrubbing) isScrubbing = false;
  });

  window.addEventListener('touchend', () => {
    if (isScrubbing) isScrubbing = false;
  });

  // Volume controls
  function setVolume(val) {
    val = Math.max(0, Math.min(1, val));
    video.volume = val;
    video.muted = (val === 0);
    if (volumeSlider) volumeSlider.value = val;
    updateVolumeIcon();
  }

  volumeSlider?.addEventListener('input', (e) => {
    setVolume(parseFloat(e.target.value));
  });

  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (video.muted || video.volume === 0) {
      video.muted = false;
      const targetVol = parseFloat(volumeSlider?.value) || 1.0;
      video.volume = targetVol > 0 ? targetVol : 1.0;
      if (volumeSlider) volumeSlider.value = video.volume;
    } else {
      video.muted = true;
    }
    updateVolumeIcon();
  });

  function updateVolumeIcon() {
    if (!muteBtn) return;
    if (video.muted || video.volume === 0) {
      muteBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      `;
      muteBtn.title = "Включить звук";
    } else {
      muteBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      `;
      muteBtn.title = "Выключить звук";
    }
  }

  // Fullscreen (targets only the video-container cleanly)
  fullscreenBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => console.log(err));
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  });

  // Auto-hide controls
  let hideTimeout;
  function resetControlsTimeout() {
    container.classList.remove('hide-controls');
    clearTimeout(hideTimeout);
    if (!video.paused) {
      hideTimeout = setTimeout(() => {
        container.classList.add('hide-controls');
      }, 2500);
    }
  }

  container.addEventListener('mousemove', resetControlsTimeout);
  container.addEventListener('touchstart', resetControlsTimeout, { passive: true });

  video.addEventListener('ended', () => {
    container.classList.remove('playing');
    updatePlayIcons();
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isVideoInView = container.getBoundingClientRect().top < window.innerHeight && container.getBoundingClientRect().bottom > 0;
    if (!isVideoInView) return;

    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      muteBtn?.click();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      fullscreenBtn?.click();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      setVolume(video.volume + 0.1);
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      setVolume(video.volume - 0.1);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
    }
  });
});
