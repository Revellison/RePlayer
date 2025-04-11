let playBtn, prevBtn, nextBtn, volumeBtn, volumeSlider;
let progressBarBottom, progressBarTop;
let currentTimeElBottom, durationElBottom, currentTimeElTop, durationElTop;
let playlistItems, songTitle, artistName, albumArt;
let minimizeBtn, maximizeBtn, closeBtn;

// NOTE: Этот массив больше не используется, все треки определены в player.js
// const playlist = [
//   {
//     title: 'Я дэбил',
//     artist: 'MACAN',
//     image: '../assets/images/placeholder.png',
//     source: ''
//   },
//   {
//     title: 'Песня 2',
//     artist: 'Исполнитель 2',
//     image: '../assets/images/placeholder.png',
//     source: ''
//   },
//   {
//     title: 'Песня 3',
//     artist: 'Исполнитель 3',
//     image: '../assets/images/placeholder.png',
//     source: ''
//   }
// ];

// NOTE: Управление плеером теперь перенесено в player.js
// Эти переменные оставлены для совместимости
let currentTrackIndex = 0;
let isPlaying = false;
let updateTimer;
let isMaximized = false;

function initPlayer() {
  initDOMElements();
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

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('componentsLoaded', () => {
    initPlayer();
  });
});