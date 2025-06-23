import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeLow } from '@fortawesome/free-solid-svg-icons';
import './volume.css';

const VolumeControl = ({ volume = 50, onChange = () => {} }) => {
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="control-btn"
        id="volume-btn"
        data-role="volume-btn"
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        <FontAwesomeIcon icon={faVolumeLow} />
      </button>
      <div
        className="volume-slider-wrapper"
        style={{ opacity: showSlider ? 1 : 0, pointerEvents: showSlider ? 'auto' : 'none', transform: showSlider ? 'translateY(0)' : 'translateY(-10px)' }}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        <div className="wrapper">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            data-role="volume-slider"
            onChange={e => onChange(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;