
let playBtn, prevBtn, nextBtn, volumeBtn, volumeSlider;
let progressBarBottom, progressBarTop;
let currentTimeElBottom, durationElBottom, currentTimeElTop, durationElTop;
let playlistItems, songTitle, artistName, albumArt;
let minimizeBtn, maximizeBtn, closeBtn;

const playlist = [
  {
    title: 'Я дэбил',
    artist: 'MACAN',
    image: '../assets/images/placeholder.png',
    source: ''
  },
  {
    title: 'Песня 2',
    artist: 'Исполнитель 2',
    image: '../assets/images/placeholder.png',
    source: ''
  },
  {
    title: 'Песня 3',
    artist: 'Исполнитель 3',
    image: '../assets/images/placeholder.png',
    source: ''
  }
];

let currentTrackIndex = 0;
let isPlaying = false;
let updateTimer;
let isMaximized = false;

const audio = new Audio();
audio.volume = 0.5;

function initPlayer() {
  initDOMElements();
  
  if (volumeSlider) {
    audio.volume = volumeSlider.value / 100;
  }
  
  loadTrack(currentTrackIndex);
  
  addEventListeners();
  
  renderPlaylist();
}

function initDOMElements() {
  playBtn = document.getElementById('play');
  prevBtn = document.getElementById('prev');
  nextBtn = document.getElementById('next');
  volumeBtn = document.getElementById('volume-btn');
  volumeSlider = document.querySelector('.volume-slider-wrapper input[type="range"]');
  progressBarBottom = document.querySelector('.progress-container-bottom .progress-bar #progress');
  progressBarTop = document.querySelector('.progress-container .progress-bar #progress');
  currentTimeElBottom = document.getElementById('current-time');
  durationElBottom = document.getElementById('duration');
  currentTimeElTop = document.querySelector('.progress-container .time-info:first-child');
  durationElTop = document.querySelector('.progress-container .time-info:last-child');
  playlistItems = document.getElementById('playlist-items');
  songTitle = document.querySelector('.bottom-player-details h2');
  artistName = document.querySelector('.bottom-player-details p');
  albumArt = document.querySelector('.bottom-player-image img');
  minimizeBtn = document.getElementById('minimize-btn');
  maximizeBtn = document.getElementById('maximize-btn');
  closeBtn = document.getElementById('close-btn');
}

function addEventListeners() {
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (prevBtn) prevBtn.addEventListener('click', playPrevTrack);
  if (nextBtn) nextBtn.addEventListener('click', playNextTrack);
  if (volumeSlider) volumeSlider.addEventListener('input', setVolume);
  
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', playNextTrack);
}

function loadTrack(trackIndex) {
  if (updateTimer) clearInterval(updateTimer);
  resetPlayer();
  
  const track = playlist[trackIndex];
  if (!track) return;
  
  updatePlayerInfo(track);
  
  updateActiveTrack();
  updateTimer = setInterval(updateProgress, 1000);
}

function updatePlayerInfo(track) {
  if (!track) return;
  
  if (songTitle) songTitle.textContent = track.title;
  if (artistName) artistName.textContent = track.artist;
  if (albumArt) albumArt.src = track.image;
  
  const mainSongTitle = document.getElementById('song-title');
  const mainArtistName = document.getElementById('artist-name');
  const mainAlbumArt = document.querySelector('.song-image img');
  
  if (mainSongTitle) mainSongTitle.textContent = track.title;
  if (mainArtistName) mainArtistName.textContent = track.artist;
  if (mainAlbumArt) mainAlbumArt.src = track.image;
}

function resetPlayer() {
  const resetTime = '0:00';
  if (currentTimeElBottom) currentTimeElBottom.textContent = resetTime;
  if (durationElBottom) durationElBottom.textContent = resetTime;
  if (currentTimeElTop) currentTimeElTop.textContent = resetTime;
  if (durationElTop) durationElTop.textContent = resetTime;
  
  const resetWidth = '0%';
  if (progressBarBottom) progressBarBottom.style.width = resetWidth;
  if (progressBarTop) progressBarTop.style.width = resetWidth;
}

function togglePlay() {
  if (!isPlaying) {
    playTrack();
  } else {
    pauseTrack();
  }
}

function playTrack() {
  isPlaying = true;
  if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
  isPlaying = false;
  if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
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
  if (!volumeSlider) return;
  audio.volume = volumeSlider.value / 100;
  updateVolumeIcon();
}

function updateVolumeIcon() {
  if (!volumeBtn) return;
  const icon = volumeBtn.querySelector('i');
  if (!icon) return;
  
  const volume = audio.volume;
  icon.style.opacity = volume === 0 ? '0.3' : volume < 0.5 ? '0.6' : '1';
}

function updateProgress() {
  if (!audio.duration) return;
  
  const progress = (audio.currentTime / audio.duration) * 100;
  
  if (progressBarBottom) progressBarBottom.style.width = `${progress}%`;
  if (progressBarTop) progressBarTop.style.width = `${progress}%`;
  
  const formattedCurrentTime = formatTime(audio.currentTime);
  const formattedDuration = formatTime(audio.duration);
  
  if (currentTimeElBottom) currentTimeElBottom.textContent = formattedCurrentTime;
  if (durationElBottom) durationElBottom.textContent = formattedDuration;
  if (currentTimeElTop) currentTimeElTop.textContent = formattedCurrentTime;
  if (durationElTop) durationElTop.textContent = formattedDuration;
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

function updateActiveTrack() {
  if (!playlistItems) return;
  
  const items = playlistItems.getElementsByTagName('li');
  if (!items || !items.length) return;
  
  for (let i = 0; i < items.length; i++) {
    if (i === currentTrackIndex) {
      items[i].classList.add('active');
    } else {
      items[i].classList.remove('active');
    }
  }
}

function renderPlaylist() {
  if (!playlistItems) return;
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

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('componentsLoaded', () => {
    initPlayer();
  });
});