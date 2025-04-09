const playButton = document.getElementById('play');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const volumeControl = document.getElementById('volume');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const albumArt = document.getElementById('album-art');
const progressBar = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playlistItems = document.getElementById('playlist-items');

const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const closeBtn = document.getElementById('close-btn');

const playlist = [
  {
    title: 'Я дэбил',
    artist: 'MACAN',
    image: './assets/images/placeholder.png',
    source: ''
  },
  {
    title: 'Песня 2',
    artist: 'Исполнитель 2',
    image: './assets/images/placeholder.png',
    source: ''
  },
  {
    title: 'Песня 3',
    artist: 'Исполнитель 3',
    image: './assets/images/placeholder.png',
    source: ''
  }
];

let currentTrackIndex = 0;
let isPlaying = false;
let updateTimer;
let isMaximized = false;

const audio = new Audio();
audio.volume = volumeControl.value / 100;

function initPlayer() {
  loadTrack(currentTrackIndex);
  
  playButton.addEventListener('click', togglePlay);
  prevButton.addEventListener('click', playPrevTrack);
  nextButton.addEventListener('click', playNextTrack);
  volumeControl.addEventListener('input', setVolume);
  
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', playNextTrack);
  
  renderPlaylist();
  initWindowControls();
}

function initWindowControls() {
  if (window.electronAPI) {
    minimizeBtn.addEventListener('click', () => {
      window.electronAPI.minimizeWindow();
    });
    
    maximizeBtn.addEventListener('click', async () => {
      isMaximized = await window.electronAPI.maximizeWindow();
      updateMaximizeButtonIcon();
    });
    
    closeBtn.addEventListener('click', () => {
      window.electronAPI.closeWindow();
    });
  } else {
    console.error('Electron API не доступен');
    document.querySelector('.window-controls').style.display = 'none';
  }
}

function updateMaximizeButtonIcon() {
  maximizeBtn.innerHTML = isMaximized ? '<i class="fa-solid fa-minimize"></i>' : '<i class="fa-solid fa-maximize"></i>';
}

function loadTrack(trackIndex) {
  clearInterval(updateTimer);
  resetPlayer();
  
  const track = playlist[trackIndex];
  
  songTitle.textContent = track.title;
  artistName.textContent = track.artist;
  albumArt.src = track.image;
  
  // В реальном приложении здесь будет источник трека
  // audio.src = track.source;
  
  // Обновление активного трека в плейлисте
  updateActiveTrack();
  updateTimer = setInterval(updateProgress, 1000);
}

function resetPlayer() {
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
  progressBar.style.width = '0%';
}

function togglePlay() {
  if (!isPlaying) {
    playTrack();
  } else {
    pauseTrack();
  }
}

function playTrack() {
  // В реальном проекте здесь будет audio.play()
  isPlaying = true;
  playButton.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
  // В реальном проекте здесь будет audio.pause()
  isPlaying = false;
  playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function playPrevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
}

function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
}

function setVolume() {
  audio.volume = volumeControl.value / 100;
}

function updateProgress() {
  // В демо-режиме используем случайный прогресс
  const fakeCurrentTime = Math.floor(Math.random() * 180);
  const fakeDuration = 180;
  
  // В реальном проекте здесь будут реальные значения:
  // const currentTime = audio.currentTime;
  // const duration = audio.duration;
  
  // Обновление прогресс-бара
  const progressPercent = (fakeCurrentTime / fakeDuration) * 100;
  progressBar.style.width = `${progressPercent}%`;
  
  currentTimeEl.textContent = formatTime(fakeCurrentTime);
  durationEl.textContent = formatTime(fakeDuration);
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

function updateActiveTrack() {
  const items = playlistItems.getElementsByTagName('li');
  for (let i = 0; i < items.length; i++) {
    if (i === currentTrackIndex) {
      items[i].classList.add('active');
    } else {
      items[i].classList.remove('active');
    }
  }
}

function renderPlaylist() {
  playlistItems.innerHTML = '';
  
  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
    li.textContent = `${track.title} - ${track.artist}`;
    
    li.addEventListener('click', () => {
      currentTrackIndex = index;
      loadTrack(currentTrackIndex);
      if (isPlaying) playTrack();
    });
    
    playlistItems.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', initPlayer);