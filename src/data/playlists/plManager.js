/**
 * Менеджер плейлистов - отвечает за управление плейлистами
 */

// Для браузера мы не можем использовать fs и path
// const fs = require('fs');
// const path = require('path');

// Пути к директориям - используем относительный путь, который работает в Electron
const PLAYLISTS_BASE_URL = '../data/playlists/playlistData/';

// Класс для управления плейлистами
class PlaylistManager {
    constructor() {
        this.playlists = [];
        this.loadAllPlaylists();
    }

    /**
     * Загружает все плейлисты из директории
     * @returns {Array} - массив плейлистов
     */
    loadAllPlaylists() {
        // В браузере мы не можем напрямую читать директорию
        // Поэтому здесь мы жестко закодируем список известных плейлистов
        // или загрузим их через AJAX-запрос к серверному API

        // Пример жесткого кодирования 
        const knownPlaylists = ['PayBoyCarti'];
        
        this.playlists = [];
        
        // Асинхронно загружаем каждый плейлист
        knownPlaylists.forEach(playlistId => {
            this.loadPlaylistById(playlistId);
        });
        
        return this.playlists;
    }

    /**
     * Загружает плейлист по ID
     * @param {string} playlistId - ID плейлиста
     */
    loadPlaylistById(playlistId) {
        // Загружаем JSON напрямую через fetch
        fetch(`${PLAYLISTS_BASE_URL}${playlistId}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Добавляем id плейлиста
                data.id = playlistId;
                data.filePath = `${PLAYLISTS_BASE_URL}${playlistId}.json`;
                
                // Добавляем в массив плейлистов
                const existingIndex = this.playlists.findIndex(pl => pl.id === playlistId);
                if (existingIndex >= 0) {
                    this.playlists[existingIndex] = data;
                } else {
                    this.playlists.push(data);
                }
                
                // Уведомляем о загрузке
                console.log(`Плейлист загружен: ${playlistId}`);
                
                // Генерируем событие загрузки плейлиста
                const event = new CustomEvent('playlistLoaded', { 
                    detail: { playlistId: playlistId }
                });
                document.dispatchEvent(event);
            })
            .catch(error => {
                console.error(`Ошибка загрузки плейлиста ${playlistId}:`, error);
                
                // Пробуем загрузить предопределенные данные в случае ошибки
                this.loadHardcodedPlaylist(playlistId);
            });
    }
    
    /**
     * Загружает жестко закодированный плейлист, если fetch не удался
     * @param {string} playlistId - ID плейлиста
     */
    loadHardcodedPlaylist(playlistId) {
        if (playlistId === 'PayBoyCarti') {
            const hardcodedPlaylist = {
                "id": "PayBoyCarti",
                "plName": "I am autistic",
                "plDescription": "I am autistic",
                "plOwner": "PayBoyCarti",
                "plImage": "https://i.scdn.co/image/ab6761610000e5eb29d7f503f7d47279532d6a8b",
                "totalSongs": 5,
                "audioTitles": [
                    "I am autistic",
                    "I am autistic",
                    "I am autistic",
                    "I am autistic",
                    "I am autistic"
                ],
                "tracks": [
                    {
                        "title": "I am autistic",
                        "artist": "PayBoyCarti",
                        "path": "../data/music/playboy/track1.mp3",
                        "image": "https://i.scdn.co/image/ab6761610000e5eb29d7f503f7d47279532d6a8b"
                    },
                    {
                        "title": "I am autistic",
                        "artist": "PayBoyCarti",
                        "path": "../data/music/playboy/track2.mp3",
                        "image": "https://i.scdn.co/image/ab6761610000e5eb29d7f503f7d47279532d6a8b"
                    },
                    {
                        "title": "I am autistic",
                        "artist": "PayBoyCarti",
                        "path": "../data/music/playboy/track3.mp3",
                        "image": "https://i.scdn.co/image/ab6761610000e5eb29d7f503f7d47279532d6a8b"
                    },
                    {
                        "title": "I am autistic",
                        "artist": "PayBoyCarti",
                        "path": "../data/music/playboy/track4.mp3",
                        "image": "https://i.scdn.co/image/ab6761610000e5eb29d7f503f7d47279532d6a8b"
                    },
                    {
                        "title": "I am autistic",
                        "artist": "PayBoyCarti",
                        "path": "../data/music/playboy/track5.mp3",
                        "image": "https://i.scdn.co/image/ab6761610000e5eb29d7f503f7d47279532d6a8b"
                    }
                ],
                "createdAt": "2023-07-15T12:00:00Z",
                "updatedAt": "2023-07-15T12:00:00Z"
            };
            
            hardcodedPlaylist.filePath = `${PLAYLISTS_BASE_URL}${playlistId}.json`;
            
            // Добавляем в массив плейлистов
            const existingIndex = this.playlists.findIndex(pl => pl.id === playlistId);
            if (existingIndex >= 0) {
                this.playlists[existingIndex] = hardcodedPlaylist;
            } else {
                this.playlists.push(hardcodedPlaylist);
            }
            
            console.log(`Загружен резервный плейлист: ${playlistId}`);
            
            // Генерируем событие загрузки плейлиста
            const event = new CustomEvent('playlistLoaded', { 
                detail: { playlistId: playlistId }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Получает плейлист по ID
     * @param {string} playlistId - ID плейлиста
     * @returns {Object|null} - плейлист или null, если не найден
     */
    getPlaylistById(playlistId) {
        return this.playlists.find(pl => pl.id === playlistId) || null;
    }

    /**
     * Создает новый плейлист
     * @param {Object} playlistData - данные плейлиста
     * @returns {Object} - созданный плейлист
     */
    createPlaylist(playlistData) {
        const newPlaylist = {
            id: playlistData.id || `playlist_${Date.now()}`,
            plName: playlistData.plName || 'Новый плейлист',
            plDescription: playlistData.plDescription || '',
            plOwner: playlistData.plOwner || 'User',
            plImage: playlistData.plImage || '../assets/images/placeholder.png',
            totalSongs: 0,
            audioTitles: [],
            tracks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Добавляем треки, если они есть
        if (playlistData.tracks && Array.isArray(playlistData.tracks)) {
            newPlaylist.tracks = playlistData.tracks;
            newPlaylist.audioTitles = playlistData.tracks.map(track => track.title);
            newPlaylist.totalSongs = playlistData.tracks.length;
        }

        // В браузере мы не можем напрямую сохранять файлы
        // Вместо этого мы можем отправить данные на сервер через AJAX
        // или сохранить в localStorage для демонстрации
        localStorage.setItem(`playlist_${newPlaylist.id}`, JSON.stringify(newPlaylist));
        
        newPlaylist.filePath = `${PLAYLISTS_BASE_URL}${newPlaylist.id}.json`;
        this.playlists.push(newPlaylist);
        
        return newPlaylist;
    }

    /**
     * Обновляет существующий плейлист
     * @param {string} playlistId - ID плейлиста
     * @param {Object} updatedData - обновленные данные
     * @returns {Object|null} - обновленный плейлист или null, если не найден
     */
    updatePlaylist(playlistId, updatedData) {
        const playlistIndex = this.playlists.findIndex(pl => pl.id === playlistId);
        
        if (playlistIndex === -1) {
            return null;
        }

        const playlist = this.playlists[playlistIndex];
        
        // Обновляем поля плейлиста
        const updatedPlaylist = {
            ...playlist,
            ...updatedData,
            updatedAt: new Date().toISOString()
        };

        // Обновляем количество треков и названия, если изменились треки
        if (updatedData.tracks) {
            updatedPlaylist.totalSongs = updatedData.tracks.length;
            updatedPlaylist.audioTitles = updatedData.tracks.map(track => track.title);
        }

        // В браузере мы не можем напрямую сохранять файлы
        // Сохраняем в localStorage для демонстрации
        localStorage.setItem(`playlist_${updatedPlaylist.id}`, JSON.stringify(updatedPlaylist));
        
        // Обновляем плейлист в массиве
        this.playlists[playlistIndex] = updatedPlaylist;
        
        return updatedPlaylist;
    }

    /**
     * Удаляет плейлист
     * @param {string} playlistId - ID плейлиста
     * @returns {boolean} - успешно ли удален плейлист
     */
    deletePlaylist(playlistId) {
        const playlistIndex = this.playlists.findIndex(pl => pl.id === playlistId);
        
        if (playlistIndex === -1) {
            return false;
        }

        // Удаляем из localStorage
        localStorage.removeItem(`playlist_${playlistId}`);
        
        // Удаляем плейлист из массива
        this.playlists.splice(playlistIndex, 1);
        
        return true;
    }

    /**
     * Добавляет трек в плейлист
     * @param {string} playlistId - ID плейлиста
     * @param {Object} trackData - данные трека
     * @returns {Object|null} - обновленный плейлист или null, если не найден
     */
    addTrackToPlaylist(playlistId, trackData) {
        const playlist = this.getPlaylistById(playlistId);
        
        if (!playlist) {
            return null;
        }

        // Создаем копию массива треков и добавляем новый трек
        const updatedTracks = [...(playlist.tracks || []), trackData];
        
        // Обновляем плейлист
        return this.updatePlaylist(playlistId, { tracks: updatedTracks });
    }

    /**
     * Удаляет трек из плейлиста
     * @param {string} playlistId - ID плейлиста
     * @param {number} trackIndex - индекс трека
     * @returns {Object|null} - обновленный плейлист или null, если не найден
     */
    removeTrackFromPlaylist(playlistId, trackIndex) {
        const playlist = this.getPlaylistById(playlistId);
        
        if (!playlist || !playlist.tracks || trackIndex >= playlist.tracks.length) {
            return null;
        }

        // Создаем копию массива треков и удаляем трек по индексу
        const updatedTracks = [...playlist.tracks];
        updatedTracks.splice(trackIndex, 1);
        
        // Обновляем плейлист
        return this.updatePlaylist(playlistId, { tracks: updatedTracks });
    }

    /**
     * Перемещает трек внутри плейлиста
     * @param {string} playlistId - ID плейлиста
     * @param {number} fromIndex - текущий индекс трека
     * @param {number} toIndex - новый индекс трека
     * @returns {Object|null} - обновленный плейлист или null, если не найден
     */
    moveTrack(playlistId, fromIndex, toIndex) {
        const playlist = this.getPlaylistById(playlistId);
        
        if (!playlist || !playlist.tracks) {
            return null;
        }

        if (fromIndex < 0 || fromIndex >= playlist.tracks.length || 
            toIndex < 0 || toIndex >= playlist.tracks.length) {
            return null;
        }

        // Создаем копию массива треков
        const updatedTracks = [...playlist.tracks];
        
        // Перемещаем трек
        const [trackToMove] = updatedTracks.splice(fromIndex, 1);
        updatedTracks.splice(toIndex, 0, trackToMove);
        
        // Обновляем плейлист
        return this.updatePlaylist(playlistId, { tracks: updatedTracks });
    }

    /**
     * Преобразует плейлист в формат, совместимый с плеером
     * @param {string} playlistId - ID плейлиста
     * @returns {Array|null} - массив треков в формате плеера или null, если не найден
     */
    convertToPlayerFormat(playlistId) {
        const playlist = this.getPlaylistById(playlistId);
        
        if (!playlist || !playlist.tracks) {
            return null;
        }

        return playlist.tracks.map(track => ({
            title: track.title,
            artist: track.artist,
            path: track.path,
            image: track.image || playlist.plImage
        }));
    }

    /**
     * Поиск по плейлистам
     * @param {string} query - поисковый запрос
     * @returns {Array} - найденные плейлисты
     */
    searchPlaylists(query) {
        const searchTerm = query.toLowerCase();
        
        return this.playlists.filter(playlist => {
            // Поиск по названию плейлиста
            if (playlist.plName.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Поиск по описанию
            if (playlist.plDescription.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Поиск по владельцу
            if (playlist.plOwner.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Поиск по трекам
            if (playlist.audioTitles.some(title => 
                title.toLowerCase().includes(searchTerm))) {
                return true;
            }
            
            return false;
        });
    }
}

// Создаем и экспортируем экземпляр менеджера плейлистов
const playlistManager = new PlaylistManager();

// Вместо Node.js module.exports мы добавляем в глобальный объект window для браузера
window.playlistManager = playlistManager;
