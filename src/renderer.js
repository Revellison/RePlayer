// Проверяем, не определены ли переменные уже в глобальном контексте
if (typeof window._rendererInitialized === 'undefined') {
  window._rendererInitialized = true;
  
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
    // Проверка существования элементов перед инициализацией
    playBtn = document.getElementById('play') || null;
    prevBtn = document.getElementById('prev') || null;
    nextBtn = document.getElementById('next') || null;
    volumeBtn = document.getElementById('volume-btn') || null;
    volumeSlider = document.querySelector('.volume-slider-wrapper input[type="range"]') || null;
    progressBarBottom = document.querySelector('.progress-container-bottom .progress-bar #progress') || null;
    progressBarTop = document.querySelector('.progress-container .progress-bar #progress') || null;
    currentTimeElBottom = document.getElementById('current-time') || null;
    durationElBottom = document.getElementById('duration') || null;
    currentTimeElTop = document.querySelector('.progress-container .time-info:first-child') || null;
    durationElTop = document.querySelector('.progress-container .time-info:last-child') || null;
    playlistItems = document.getElementById('playlist-items') || null;
    songTitle = document.querySelector('.bottom-player-details h2') || null;
    artistName = document.querySelector('.bottom-player-details p') || null;
    albumArt = document.querySelector('.bottom-player-image img') || null;
    minimizeBtn = document.getElementById('minimize-btn') || null;
    maximizeBtn = document.getElementById('maximize-btn') || null;
    closeBtn = document.getElementById('close-btn') || null;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('componentsLoaded', () => {
      // Проверяем, содержит ли текущая страница элементы плеера
      const hasPlayerElements = document.getElementById('play') || 
                               document.querySelector('.progress-container-bottom') ||
                               document.querySelector('.bottom-player');
      
      if (hasPlayerElements) {
        initPlayer();
      }
    });
  });
}