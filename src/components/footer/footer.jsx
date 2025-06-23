import { useState } from 'react';
import './footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faForward, faBackward } from '@fortawesome/free-solid-svg-icons';
import VolumeControl from './minions/volume/volume';

const PlayerFooter = ({
  cover = '/icon.png',
  title = 'Название трека',
  artist = 'Исполнитель',
  duration = 180,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayPause = () => setIsPlaying((prev) => !prev);
  const handleSeek = (value) => setCurrentTime(value);
  const handlePrev = () => setCurrentTime(0);
  const handleNext = () => setCurrentTime(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-footer">
      <img className="player-cover" src={cover} alt={title} />
      <div className="player-info">
        <div className="player-title">{title}</div>
        <div className="player-artist">{artist}</div>
      </div>
      <div className="player-timeline">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={e => handleSeek(Number(e.target.value))}
          style={{
            '--progress': `${progress}%`
          }}
        />
        <span>{formatTime(duration)}</span>
      </div>
      <div className="player-controls">
        <button onClick={handlePrev} title="Предыдущий трек">
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <button onClick={handlePlayPause} title={isPlaying ? 'Пауза' : 'Воспроизвести'}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button onClick={handleNext} title="Следующий трек">
          <FontAwesomeIcon icon={faForward} />
        </button>
        <VolumeControl volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
};

export default PlayerFooter;
