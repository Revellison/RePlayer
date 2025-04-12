(function() {
    if (window._playerInitialized) {
        return;
    }
    
    window._playerInitialized = true;

    let audioPlayer = null;
    let audioPlaying = false;
    let currentTrackIndex = 0;
    let playlist = [];
    let duration = 0;
    let currentTime = 0;
    let updateTimer = null;
    
    let isPlayPauseDebouncing = false;
    let isTrackSwitchDebouncing = false;
    let lastActionTime = 0;
    const DEBOUNCE_DELAY = 500;
    let trackSwitchInProgress = false;

    document.addEventListener('componentsLoaded', () => {
        initializePlayer();
        loadDefaultPlaylist();
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('play')) {
            initializePlayer();
            loadDefaultPlaylist();
        }
    });

    function loadDefaultPlaylist() {
        playlist = [
            {
                title: 'Test track 1',
                artist: 'Test artist 1', 
                path: "../data/test/music.mp3",
                image: "../assets/images/placeholder.png"
            },
            {
                title: 'Test track 2',
                artist: 'Test artist 2',
                path: "../data/test/music2.mp3",
                image: "../assets/images/placeholder.png"
            },
            {
                title: 'D0 THE M0ST',
                artist: 'Playboi Carti',
                path: "../data/test/music3.mp3",
                image: "../data/test/music3.jpg"
            }
        ];
        
        renderPlaylist();
        
        if (playlist.length > 0) {
            loadTrack(currentTrackIndex);
            
            setTimeout(() => {
                preloadNextTrack();
            }, 1000);
        }
    }

    function initializePlayer() {
        const playButton = document.getElementById('play');
        const prevButton = document.getElementById('prev');
        const nextButton = document.getElementById('next');
        const volumeSlider = document.querySelector('[data-role="volume-slider"]');
        const volumeBtn = document.getElementById('volume-btn');
        
        initProgressBars();
        
        if (playButton) {
            playButton.addEventListener('click', togglePlay);
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', playPrevTrack);
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', playNextTrack);
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', setVolume);
            volumeSlider.addEventListener('change', setVolume);
        }
        
        if (volumeBtn) {
            volumeBtn.addEventListener('click', toggleMute);
        }
        
        if (window._playerInitialized) {
            setTimeout(restorePlayerState, 100);
        }
    }
    
    function initProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            bar.addEventListener('click', handleProgressBarClick);
            bar.addEventListener('mousedown', handleProgressBarMouseDown);
        });
        
        document.addEventListener('mousemove', handleProgressBarMouseMove);
        document.addEventListener('mouseup', handleProgressBarMouseUp);
    }
    
    function handleProgressBarClick(event) {
        if (!audioPlayer || !audioPlayer.buffer || !duration) return;
        
        const bar = event.currentTarget;
        const rect = bar.getBoundingClientRect();
        
        const clickPosition = (event.clientX - rect.left) / rect.width;
        
        const newTime = clickPosition * duration;
        
        seekToPosition(newTime);
    }
    
    let isDragging = false;
    let currentProgressBar = null;
    
    function handleProgressBarMouseDown(event) {
        if (!audioPlayer || !audioPlayer.buffer || !duration) return;
        
        isDragging = true;
        currentProgressBar = event.currentTarget;
        
        const handle = currentProgressBar.querySelector('.progress-handle');
        if (handle) handle.classList.add('active');
        
        handleProgressBarMouseMove(event);
    }
    
    function handleProgressBarMouseMove(event) {
        if (!isDragging || !currentProgressBar) return;
        
        const rect = currentProgressBar.getBoundingClientRect();
        
        let position = (event.clientX - rect.left) / rect.width;
        position = Math.max(0, Math.min(1, position));
        
        const newTime = position * duration;
        
        updateTimeDisplay(newTime);
        updateProgressBar(newTime, duration);
        
        const handle = currentProgressBar.querySelector('.progress-handle');
        if (handle) {
            handle.style.left = `${position * 100}%`;
        }
    }
    
    function handleProgressBarMouseUp(event) {
        if (!isDragging || !currentProgressBar) return;
        
        const rect = currentProgressBar.getBoundingClientRect();
        
        let position = (event.clientX - rect.left) / rect.width;
        position = Math.max(0, Math.min(1, position));
        
        const newTime = position * duration;
        
        seekToPosition(newTime);
        
        const handle = currentProgressBar.querySelector('.progress-handle');
        if (handle) {
            handle.classList.remove('active');
        }
        
        isDragging = false;
        currentProgressBar = null;
    }
    
    function seekToPosition(time) {
        if (!audioPlayer || !audioPlayer.buffer || !duration) return;
        
        time = Math.max(0, Math.min(duration, time));
        
        currentTime = time;
        
        Tone.Transport.seconds = time;
        
        if (audioPlaying) {
            audioPlayer.stop();
            
            const track = playlist[currentTrackIndex];
            if (track) {
                safeStartPlayer(track.path, time);
            }
        } else {
            updateTimeDisplay(time);
            updateProgressBar(time, duration);
        }
    }
    
    function setVolume() {
        const volumeSlider = document.querySelector('[data-role="volume-slider"]');
        if (!volumeSlider || !audioPlayer) return;
        
        const sliderValue = parseFloat(volumeSlider.value);
        
        try {
            let volumeInDB;
            
            if (sliderValue === 0) {
                volumeInDB = -Infinity;
            } else if (sliderValue < 50) {
                volumeInDB = -40 * (1 - (sliderValue / 50));
            } else {
                volumeInDB = (sliderValue - 50) * 0.2;
            }
            
            if (audioPlayer.state === "started" && audioPlayer.volume.value !== volumeInDB) {
                audioPlayer.volume.rampTo(volumeInDB, 0.1);
            } else {
                audioPlayer.volume.value = volumeInDB;
            }
            
            const linearVolume = sliderValue / 100;
            updateVolumeIcon(linearVolume);
            
        } catch (error) {
            console.error("Error setting volume:", error);
        }
    }
    
    function updateVolumeIcon(volume) {
        const volumeBtn = document.getElementById('volume-btn');
        if (!volumeBtn) return;
        
        const icon = volumeBtn.querySelector('i');
        if (!icon) return;
        
        icon.className = '';
        
        if (volume === 0) {
            icon.classList.add('fa-solid', 'fa-volume-xmark');
        } else if (volume < 0.3) {
            icon.classList.add('fa-solid', 'fa-volume-off');
        } else if (volume < 0.7) {
            icon.classList.add('fa-solid', 'fa-volume-low');
        } else {
            icon.classList.add('fa-solid', 'fa-volume-high');
        }
    }
    
    function toggleMute() {
        const volumeSlider = document.querySelector('[data-role="volume-slider"]');
        if (!volumeSlider || !audioPlayer) return;
        
        try {
            const currentVolumeDB = audioPlayer.volume.value;
            
            if (currentVolumeDB > -Infinity) {
                volumeSlider.dataset.prevVolume = volumeSlider.value;
                volumeSlider.value = 0;
            } else {
                volumeSlider.value = volumeSlider.dataset.prevVolume || 50;
            }
            
            setVolume();
        } catch (error) {
            console.error("Error toggling mute:", error);
        }
    }

    function loadTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        
        stopProgressLoop();
        
        currentTrackIndex = index;
        const track = playlist[index];
        
        const cachedDuration = getCachedTrackDuration(track.path);
        if (cachedDuration > 0) {
            duration = cachedDuration;
            setTimeout(() => {
                updateDuration(duration);
            }, 10);
            console.log(`Loaded track duration info: ${track.title}, duration: ${formatTime(duration)}`);
        } else {
            preloadTracksInfo();
        }
        
        if (audioPlayer) {
            try {
                if (audioPlayer._endDetectionTimer) {
                    clearTimeout(audioPlayer._endDetectionTimer);
                    audioPlayer._endDetectionTimer = null;
                }
                
                audioPlayer.stop();
                audioPlayer.dispose();
                audioPlayer = null;
            } catch (error) {
                console.error("Error releasing player resources:", error);
            }
            audioPlaying = false;
            updatePlayButtonIcon(false);
        }
        
        currentTime = 0;
        
        if (duration <= 0) {
            updateDuration(0);
        }
        
        updateTrackInfo(track);
        
        createPlayer(track.path);
        
        updateActiveTrack();
        
        setTimeout(() => {
            preloadNextTrack();
        }, 1000);
    }
    
    async function createPlayer(audioPath) {
        try {
            if (typeof Tone === 'undefined') {
                console.error('Tone.js is not loaded');
                return;
            }
            
            currentTime = 0;
            Tone.Transport.stop();
            Tone.Transport.cancel();
            Tone.Transport.seconds = 0;
            
            const cachedDuration = getCachedTrackDuration(audioPath);
            if (cachedDuration > 0) {
                duration = cachedDuration;
                console.log(`Using cached duration: ${formatTime(duration)} (${duration} sec)`);
                updateDuration(duration);
            }
            
            if (audioPlayer) {
                try {
                    audioPlayer.stop();
                    audioPlayer.dispose();
                    audioPlayer = null;
                } catch (error) {
                    console.error('Error releasing player resources:', error);
                }
            }
            
            audioPlayer = new Tone.Player({
                url: audioPath,
                onload: () => {
                    duration = audioPlayer.buffer.duration;
                    
                    cacheTrackDuration(audioPath, duration);
                    
                    const formattedDuration = formatTime(duration);
                    console.log(`Track duration: ${formattedDuration} (${duration} sec)`);
                    
                    setTimeout(() => {
                        updateDuration(duration);
                    }, 50);
                    
                    Tone.Transport.seconds = 0;
                    
                    stopProgressLoop();
                    startProgressLoop();
                },
                onerror: (error) => {
                    console.error('Error loading audio file:', error);
                }
            }).toDestination();
            
            setVolume();
            
            audioPlayer.onstop = () => {
                audioPlaying = false;
                updatePlayButtonIcon(false);
            };
        } catch (error) {
            console.error('Error creating player:', error);
        }
        
        if (!window._trackEndCheckerInitialized) {
            window._trackEndCheckerInitialized = true;
            
            setInterval(() => {
                if (audioPlaying && audioPlayer && audioPlayer.buffer) {
                    try {
                        const current = Tone.Transport.seconds;
                        
                        if (current >= duration - 0.1) {
                            console.log("Global check detected end of track");
                            
                            try {
                                Tone.Transport.pause();
                                if (audioPlayer) {
                                    audioPlayer.stop();
                                }
                                audioPlaying = false;
                                
                                if (!isTrackSwitchDebouncing) {
                                    isTrackSwitchDebouncing = true;
                                    
                                    setTimeout(() => {
                                        playNextTrack();
                                        setTimeout(() => {
                                            isTrackSwitchDebouncing = false;
                                        }, DEBOUNCE_DELAY);
                                    }, 100);
                                }
                            } catch (e) {
                                console.error("Error stopping player:", e);
                            }
                        }
                    } catch (error) {
                        console.error("Error checking track end:", error);
                    }
                }
            }, 1000);
        }
    }
    
    let animationFrameId = null;

    function startProgressLoop() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        function step() {
            updateProgress();
            animationFrameId = requestAnimationFrame(step);
        }
        animationFrameId = requestAnimationFrame(step);
    }
    
    function stopProgressLoop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
    

    function updateTrackInfo(track) {
        if (!track) return;
        
        if (!window._playerState) {
            window._playerState = {};
        }
        window._playerState.currentTrack = {
            title: track.title,
            artist: track.artist,
            image: track.image,
            path: track.path
        };
        
        const mainTitle = document.getElementById('song-title');
        const mainArtist = document.getElementById('artist-name');
        const mainAlbumArt = document.getElementById('album-art');
        
        if (mainTitle) mainTitle.textContent = track.title;
        if (mainArtist) mainArtist.textContent = track.artist;
        if (mainAlbumArt) mainAlbumArt.src = track.image;
        
        const mainTitleByRole = document.querySelector('[data-role="main-title"]');
        const mainArtistByRole = document.querySelector('[data-role="main-artist"]');
        const mainArtByRole = document.querySelector('[data-role="main-art"]');
        
        if (mainTitleByRole) mainTitleByRole.textContent = track.title;
        if (mainArtistByRole) mainArtistByRole.textContent = track.artist;
        if (mainArtByRole) mainArtByRole.src = track.image;
        
        const bottomTitle = document.querySelector('[data-role="song-title"]');
        const bottomArtist = document.querySelector('[data-role="artist-name"]');
        const bottomAlbumArt = document.querySelector('[data-role="album-art"]');
        
        if (bottomTitle) bottomTitle.textContent = track.title;
        if (bottomArtist) bottomArtist.textContent = track.artist;
        if (bottomAlbumArt) bottomAlbumArt.src = track.image;
        
        currentTime = 0;
        updateTimeDisplay(0);
        updateProgressBar(0, duration);
    }
    
    function cacheTrackDuration(trackPath, trackDuration) {
        if (!window._trackDurations) {
            window._trackDurations = {};
        }
        window._trackDurations[trackPath] = trackDuration;
    }
    
    function getCachedTrackDuration(trackPath) {
        if (window._trackDurations && window._trackDurations[trackPath]) {
            return window._trackDurations[trackPath];
        }
        return 0;
    }
    
    async function togglePlay() {
        const now = Date.now();
        if (isPlayPauseDebouncing) {
            return;
        }
        
        isPlayPauseDebouncing = true;
        
        setTimeout(() => {
            isPlayPauseDebouncing = false;
        }, DEBOUNCE_DELAY);
        
        try {
            if (!audioPlayer) {
                if (playlist.length > 0) {
                    await Tone.start();
                    loadTrack(currentTrackIndex);
                }
                return;
            }
            
            await Tone.start();
            
            if (audioPlaying) {
                currentTime = Tone.Transport.seconds;
                
                Tone.Transport.pause();
                audioPlayer.stop();
                
                if (audioPlayer._endDetectionTimer) {
                    clearTimeout(audioPlayer._endDetectionTimer);
                    audioPlayer._endDetectionTimer = null;
                }
                
                stopProgressLoop();
                audioPlaying = false;
            } else {
                if (currentTime >= duration - 0.1) {
                    currentTime = 0;
                }
                
                Tone.Transport.seconds = currentTime;
                
                Tone.Transport.start();
                startProgressLoop();
                try {
                    const track = playlist[currentTrackIndex];
                    if (!track) return;
                    
                    safeStartPlayer(track.path, currentTime);
                } catch (error) {
                    console.error("Error starting playback:", error);
                    audioPlayer.start();
                }
                
                audioPlaying = true;
            }
            
            updatePlayButtonIcon(audioPlaying);
        } catch (error) {
            console.error('Error during playback:', error);
        }
    }
    
    async function safeStartPlayer(audioPath, startTime) {
        try {
            let prevVolumeDB = 0;
            
            const volumeSlider = document.querySelector('[data-role="volume-slider"]');
            let sliderValue = 50;
            
            if (audioPlayer && audioPlayer.volume) {
                prevVolumeDB = audioPlayer.volume.value;
                
                if (volumeSlider) {
                    sliderValue = parseFloat(volumeSlider.value);
                }
            }
    
            if (audioPlayer) {
                audioPlayer.stop();
                audioPlayer.dispose();
                audioPlayer = null;
            }
    
            const newPlayer = new Tone.Player({
                url: audioPath,
                onload: () => {
                    if (startTime >= newPlayer.buffer.duration) {
                        startTime = 0;
                    }
                    
                    audioPlayer = newPlayer;
                    
                    newPlayer.volume.value = prevVolumeDB;

                    newPlayer.onstop = () => {
                        audioPlaying = false;
                        updatePlayButtonIcon(false);
                        
                        if (!trackSwitchInProgress && currentTime >= duration - 0.5) {
                            playNextTrack();
                        }
                    };
                    
                    const originalTrackIndex = currentTrackIndex;
                    newPlayer.buffer.onended = () => {
                        if (originalTrackIndex === currentTrackIndex && !trackSwitchInProgress) {
                            try {
                                Tone.Transport.pause();
                                if (audioPlayer) {
                                    audioPlayer.stop();
                                }
                                audioPlaying = false;
                            } catch (e) {
                                console.error("Error stopping player:", e);
                            }
                            
                            playNextTrack();
                        }
                    };
                    
                    const trackDuration = newPlayer.buffer.duration;
                    
                    const endDetectionTimer = setInterval(() => {
                        if (!audioPlaying || !audioPlayer || !audioPlayer.buffer || audioPlayer !== newPlayer) {
                            clearInterval(endDetectionTimer);
                            return;
                        }
                        
                        try {
                            const current = Tone.Transport.seconds;
                            
                            if (duration > 0 && current >= duration - 0.5 && current <= duration + 1) {
                                clearInterval(endDetectionTimer);
                                
                                if (!trackSwitchInProgress) {
                                    try {
                                        Tone.Transport.pause();
                                        if (audioPlayer) {
                                            audioPlayer.stop();
                                        }
                                        audioPlaying = false;
                                    } catch (e) {
                                        console.error("Error stopping player:", e);
                                    }
                                    
                                    playNextTrack();
                                }
                            }
                        } catch (error) {
                            console.error("Error checking track end:", error);
                            clearInterval(endDetectionTimer);
                        }
                    }, 300);
                    
                    newPlayer._endDetectionTimer = endDetectionTimer;

                    newPlayer.start("+0", startTime);
                    
                    const startCheckTimeout = setTimeout(() => {
                        if (audioPlayer === newPlayer && audioPlaying && audioPlayer.state !== "started") {
                            console.log("Audio did not start automatically, retrying start");
                            try {
                                newPlayer.stop();
                                newPlayer.start("+0", startTime);
                            } catch (e) {
                                console.error("Error during retry start:", e);
                            }
                        }
                    }, 500);
                    
                    setTimeout(() => {
                        clearTimeout(startCheckTimeout);
                    }, 1000);
                },
                onerror: (error) => {
                    console.error('Error loading audio file:', error);
                    if (audioPlayer) {
                        audioPlayer.start();
                    }
                }
            }).toDestination();
        } catch (error) {
            console.error("Error creating player for continuation:", error);
            if (audioPlayer) {
                audioPlayer.start();
            }
        }
    }
    
    function playPrevTrack() {
        console.log("Switching to previous track");
        
        if (isTrackSwitchDebouncing) {
            console.log("Track switch already in progress, skipping");
            return;
        }
        
        isTrackSwitchDebouncing = true;
        
        setTimeout(() => {
            isTrackSwitchDebouncing = false;
        }, DEBOUNCE_DELAY);
        
        if (audioPlayer && audioPlayer._endDetectionTimer) {
            clearInterval(audioPlayer._endDetectionTimer);
            audioPlayer._endDetectionTimer = null;
        }
        
        const newIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        currentTrackIndex = newIndex;
        const track = playlist[newIndex];
        
        console.log(`Switching to track: ${track.title} (index: ${newIndex})`);
        
        const cachedDuration = getCachedTrackDuration(track.path);
        if (cachedDuration > 0) {
            duration = cachedDuration;
            updateDuration(duration);
            console.log(`Set duration for previous track: ${formatTime(duration)} (${duration} sec)`);
        } else {
            console.log("Track duration not found in cache, loading info");
            preloadTracksInfo();
        }
        
        updateTrackInfo(track);
        updateActiveTrack();
        
        if (audioPlayer) {
            try {
                audioPlayer.stop();
                Tone.Transport.pause();
            } catch (e) {
                console.error("Error stopping current track:", e);
            }
        }
        
        Tone.start().then(() => {
            console.log("Tone.js started, loading new track");
            safeStartPlayer(track.path, 0);
            Tone.Transport.seconds = 0;
            Tone.Transport.start();
            audioPlaying = true;
            updatePlayButtonIcon(true);
            startProgressLoop();
            console.log("New track started");
        }).catch(error => {
            console.error("Error starting Tone.js:", error);
            isTrackSwitchDebouncing = false;
        });
        
        setTimeout(() => {
            preloadNextTrack();
        }, 1000);
    }
    
    function playNextTrack() {
        console.log("Switching to next track");
        
        if (trackSwitchInProgress) {
            console.log("Track switch already in progress");
            return;
        }
        
        trackSwitchInProgress = true;
        
        if (audioPlayer && audioPlayer._endDetectionTimer) {
            clearInterval(audioPlayer._endDetectionTimer);
            audioPlayer._endDetectionTimer = null;
        }
        
        const newIndex = (currentTrackIndex + 1) % playlist.length;
        currentTrackIndex = newIndex;
        const track = playlist[newIndex];
        
        const cachedDuration = getCachedTrackDuration(track.path);
        if (cachedDuration > 0) {
            duration = cachedDuration;
            updateDuration(duration);
        } else {
            preloadTracksInfo();
        }
        
        updateTrackInfo(track);
        updateActiveTrack();
        
        if (audioPlayer) {
            try {
                audioPlayer.stop();
                Tone.Transport.pause();
            } catch (e) {
                console.error("Error stopping current track:", e);
            }
        }
        
        Tone.start().then(() => {
            safeStartPlayer(track.path, 0);
            Tone.Transport.seconds = 0;
            Tone.Transport.start();
            audioPlaying = true;
            updatePlayButtonIcon(true);
            startProgressLoop();
            
            setTimeout(() => {
                trackSwitchInProgress = false;
                isTrackSwitchDebouncing = false;
            }, DEBOUNCE_DELAY);
        }).catch(error => {
            console.error("Error starting Tone.js:", error);
            trackSwitchInProgress = false;
            isTrackSwitchDebouncing = false;
        });
        
        setTimeout(() => {
            preloadNextTrack();
        }, 1000);
    }
    
    function updatePlayButtonIcon(playing) {
        const playButton = document.getElementById('play');
        if (!playButton) return;
        
        const playIcon = playButton.querySelector('i');
        if (playIcon) {
            if (playing) {
                playIcon.classList.remove('fa-play');
                playIcon.classList.add('fa-pause');
            } else {
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
            }
        }
    }
    
    function updateDuration(seconds) {
        if (!window._playerState) {
            window._playerState = {};
        }
        window._playerState.duration = seconds;
        
        const durationBottom = document.getElementById('duration');
        const durationTop = document.getElementById('duration-top');
        const durationTopByRole = document.querySelector('[data-role="duration-top"]');
        
        const formattedTime = formatTime(seconds);
        
        if (seconds <= 0) {
            if (durationBottom) durationBottom.textContent = '0:00';
            if (durationTop) durationTop.textContent = '0:00';
            if (durationTopByRole && durationTopByRole !== durationTop) 
                durationTopByRole.textContent = '0:00';
            return;
        }
        
        if (durationBottom) {
            durationBottom.textContent = formattedTime;
        }
        if (durationTop) {
            durationTop.textContent = formattedTime;
        }
        if (durationTopByRole && durationTopByRole !== durationTop) {
            durationTopByRole.textContent = formattedTime;
        }
    }
    
    function updateProgress() {
        if (!audioPlayer || !audioPlayer.buffer) return;
        
        try {
            if (audioPlaying && audioPlayer.state === "started") {
                currentTime = Tone.Transport.seconds;
            }
            
            if (isNaN(currentTime) || !isFinite(currentTime) || currentTime < 0) {
                currentTime = 0;
            }
            
            if (currentTime > duration) {
                currentTime = duration;
            }
            
            if (window._audioDebug) {
                console.log("Current time:", currentTime, "Duration:", duration, "State:", audioPlayer.state);
            }
            
            updateTimeDisplay(currentTime);
            
            updateProgressBar(currentTime, duration);
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    }
    
    function updateTimeDisplay(time) {
        if (!window._playerState) {
            window._playerState = {};
        }
        window._playerState.currentTime = time;
        
        const currentTimeBottom = document.getElementById('current-time');
        const currentTimeTop = document.getElementById('current-time-top');
        const currentTimeTopByRole = document.querySelector('[data-role="current-time-top"]');
        
        const formattedTime = formatTime(time);
        
        if (currentTimeBottom) currentTimeBottom.textContent = formattedTime;
        if (currentTimeTop) currentTimeTop.textContent = formattedTime;
        if (currentTimeTopByRole && currentTimeTopByRole !== currentTimeTop) 
            currentTimeTopByRole.textContent = formattedTime;
    }
    
    let lastProgressPercent = -1;

    function updateProgressBar(currentTime, duration) {
        if (isDragging) return;
    
        const progressPercent = (currentTime / duration) * 100;
        const safePercent = Math.max(0, Math.min(100, progressPercent));
    
        if (Math.abs(safePercent - lastProgressPercent) < 0.5) return;
        lastProgressPercent = safePercent;
    
        const progressBottom = document.querySelector('[data-role="progress-bar"]');
        const progressTop = document.getElementById('progress');
        const progressTopByRole = document.querySelector('[data-role="progress-top"]');
        const handleBottom = document.querySelector('[data-role="progress-handle-bottom"]');
        const handleTop = document.querySelector('[data-role="progress-handle-top"]');
    
        if (progressBottom) progressBottom.style.width = `${safePercent}%`;
        if (progressTop) progressTop.style.width = `${safePercent}%`;
        if (progressTopByRole && progressTopByRole !== progressTop) 
            progressTopByRole.style.width = `${safePercent}%`;
    
        if (handleBottom) handleBottom.style.left = `${safePercent}%`;
        if (handleTop) handleTop.style.left = `${safePercent}%`;
    }
    
    function resetProgress() {
        currentTime = 0;
        
        updateTimeDisplay(0);
        
        updateProgressBar(0, duration);
        
        if (duration <= 0) {
            const durationBottom = document.getElementById('duration');
            const durationTop = document.getElementById('duration-top');
            const durationTopByRole = document.querySelector('[data-role="duration-top"]');
            
            const resetTime = '0:00';
            
            if (durationBottom) durationBottom.textContent = resetTime;
            if (durationTop) durationTop.textContent = resetTime;
            if (durationTopByRole && durationTopByRole !== durationTop) 
                durationTopByRole.textContent = resetTime;
        }
    }
    
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
            return '0:00';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    function renderPlaylist() {
        const playlistContainer = document.getElementById('playlist-items');
        if (!playlistContainer) return;
        
        playlistContainer.innerHTML = '';
        
        playlist.forEach((track, index) => {
            const item = document.createElement('li');
            item.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
            item.textContent = `${track.title} - ${track.artist}`;
            
            item.addEventListener('click', () => {
                currentTrackIndex = index;
                const track = playlist[index];
                
                const cachedDuration = getCachedTrackDuration(track.path);
                if (cachedDuration > 0) {
                    duration = cachedDuration;
                    updateDuration(duration);
                } else {
                    updateDuration(0);

                    setTimeout(() => {
                        preloadTracksInfo();
                    }, 100);
                }
                
                updateTrackInfo(track);
                updateActiveTrack();
                
                Tone.start().then(() => {
                    safeStartPlayer(track.path, 0);
                    Tone.Transport.seconds = 0;
                    Tone.Transport.start();
                    audioPlaying = true;
                    updatePlayButtonIcon(true);
                    startProgressLoop();

                    setTimeout(() => {
                        preloadNextTrack();
                    }, 1000);
                });
            });
            
            playlistContainer.appendChild(item);
        });
    }
    
    function updateActiveTrack() {
        const playlistContainer = document.getElementById('playlist-items');
        if (!playlistContainer) return;
        
        const items = playlistContainer.querySelectorAll('.playlist-item');
        
        items.forEach((item, index) => {
            if (index === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    window.audioPlayerAPI = {
        playTrack: (index) => loadTrack(index),
        togglePlay: togglePlay,
        next: playNextTrack,
        prev: playPrevTrack
    };
    
    // Экспортируем функции в глобальную область видимости
    window.togglePlay = togglePlay;
    window.playPrevTrack = playPrevTrack;
    window.playNextTrack = playNextTrack;
    window.updatePlayButtonIcon = updatePlayButtonIcon;
    window.restorePlayerState = restorePlayerState;
    window.updateTimeDisplay = updateTimeDisplay;
    window.updateDuration = updateDuration;
    window.updateProgressBar = updateProgressBar;

    function preloadTracksInfo() {
        if (!playlist || playlist.length === 0 || currentTrackIndex < 0 || currentTrackIndex >= playlist.length) return;
        
        const currentTrack = playlist[currentTrackIndex];
        if (!currentTrack) return;
        
        const cachedDuration = getCachedTrackDuration(currentTrack.path);
        if (cachedDuration > 0) {
            console.log(`loaded info about track duration: ${currentTrack.title}, duration: ${formatTime(cachedDuration)}`);
            duration = cachedDuration;
            updateDuration(duration);
            return;
        }
        
        console.log(`loading info about track duration: ${currentTrack.title}`);
        
        const tempPlayer = new Tone.Player({
            url: currentTrack.path,
            onload: () => {
                const trackDuration = tempPlayer.buffer.duration;
                console.log(`loaded info about track: ${currentTrack.title}, duration: ${formatTime(trackDuration)}`);
                
                cacheTrackDuration(currentTrack.path, trackDuration);
                
                duration = trackDuration;
                updateDuration(duration);
                
                tempPlayer.dispose();
            },
            onerror: (error) => {
                console.error(`error loading info about track ${currentTrack.title}:`, error);
                tempPlayer.dispose();
            }
        });
    }

    function preloadNextTrack() {
        if (!playlist || playlist.length <= 1) return;
        
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        const nextTrack = playlist[nextIndex];
        
        const cachedDuration = getCachedTrackDuration(nextTrack.path);
        if (cachedDuration > 0) {
            console.log(`loaded info about track duration: ${nextTrack.title}, duration: ${formatTime(cachedDuration)}`);
            return;
        }
        
        console.log(`loading info about track duration: ${nextTrack.title}`);
        
        const tempPlayer = new Tone.Player({
            url: nextTrack.path,
            onload: () => {
                const trackDuration = tempPlayer.buffer.duration;
                console.log(`loaded info about track: ${nextTrack.title}, duration: ${formatTime(trackDuration)}`);
                
                cacheTrackDuration(nextTrack.path, trackDuration);
                
                tempPlayer.dispose();
            },
            onerror: (error) => {
                console.error(`error loading info about track ${nextTrack.title}:`, error);
                tempPlayer.dispose();
            }
        });
    }

    function restorePlayerState() {
        if (!window._playerState) return;
        
        if (window._playerState.currentTime !== undefined) {
            updateTimeDisplay(window._playerState.currentTime);
        }
        
        if (window._playerState.duration !== undefined) {
            updateDuration(window._playerState.duration);
        }
        
        if (window._playerState.currentTime !== undefined && window._playerState.duration !== undefined) {
            updateProgressBar(window._playerState.currentTime, window._playerState.duration);
        }
        
        updatePlayButtonIcon(audioPlaying);
    }

    document.addEventListener('pageLoaded', () => {
        restorePlayerState();
    });

    // Добавляем обработчик для события восстановления состояния плеера
    document.addEventListener('playerStateRestored', () => {
        // Восстанавливаем информацию о времени и длительности после смены страницы
        if (window._playerState) {
            if (window._playerState.currentTime !== undefined) {
                updateTimeDisplay(window._playerState.currentTime);
            }
            
            if (window._playerState.duration !== undefined) {
                updateDuration(window._playerState.duration);
            }
            
            if (window._playerState.currentTime !== undefined && window._playerState.duration !== undefined) {
                updateProgressBar(window._playerState.currentTime, window._playerState.duration);
            }
            
            // Восстанавливаем состояние кнопки плей/пауза
            updatePlayButtonIcon(audioPlaying);
            
            // Восстанавливаем активный трек в плейлисте
            updateActiveTrack();
        }
    });
})();