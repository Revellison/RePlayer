const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.querySelector('.volume-slider-wrapper input[type="range"]');
const progressBarBottom = document.querySelector('.progress-container-bottom .progress-bar #progress');
const progressBarTop = document.querySelector('.progress-container .progress-bar #progress');
const currentTimeElBottom = document.getElementById('current-time');
const durationElBottom = document.getElementById('duration');
const currentTimeElTop = document.querySelector('.progress-container .time-info:first-child');
const durationElTop = document.querySelector('.progress-container .time-info:last-child');
const playlistItems = document.getElementById('playlist-items');
const songTitle = document.querySelector('.bottom-player-details h2');
const artistName = document.querySelector('.bottom-player-details p');
const albumArt = document.querySelector('.bottom-player-image img');

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
audio.volume = volumeSlider.value / 100;

function initPlayer() {
  loadTrack(currentTrackIndex);
  
  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', playPrevTrack);
  nextBtn.addEventListener('click', playNextTrack);
  volumeSlider.addEventListener('input', setVolume);
  
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
  currentTimeElBottom.textContent = '0:00';
  durationElBottom.textContent = '0:00';
  currentTimeElTop.textContent = '0:00';
  durationElTop.textContent = '0:00';
  progressBarBottom.style.width = '0%';
  progressBarTop.style.width = '0%';
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
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
  // В реальном проекте здесь будет audio.pause()
  isPlaying = false;
  playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
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
  audio.volume = volumeSlider.value / 100;
  updateVolumeIcon();
}

function updateVolumeIcon() {
  const volume = audio.volume;
  const icon = volumeBtn.querySelector('i');
  
  if (volume === 0) {
    icon.style.opacity = '0.3';
  } else if (volume < 0.5) {
    icon.style.opacity = '0.6';
  } else {
    icon.style.opacity = '1';
  }
}

function updateProgress() {
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBarBottom.style.width = `${progress}%`;
    progressBarTop.style.width = `${progress}%`;
    
    currentTimeElBottom.textContent = formatTime(audio.currentTime);
    durationElBottom.textContent = formatTime(audio.duration);
    currentTimeElTop.textContent = formatTime(audio.currentTime);
    durationElTop.textContent = formatTime(audio.duration);
  }
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

function updateTrackInfo() {
  const track = playlist[currentTrackIndex];
  songTitle.textContent = track.title;
  artistName.textContent = track.artist;
  albumArt.src = track.image;
}

document.addEventListener('DOMContentLoaded', initPlayer);