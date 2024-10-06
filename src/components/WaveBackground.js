import React from 'react';
import '../styles/WaveBackground.css';

const WaveBackground = () => {
  return (
    <div className="wave-container">
      <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g className="wave-group">
          <use xlinkHref="#gentle-wave" x="50" y="0" fill="rgba(0,119,255,0.7)" />
          <use xlinkHref="#gentle-wave" x="50" y="3" fill="rgba(0,119,255,0.5)" />
          <use xlinkHref="#gentle-wave" x="50" y="6" fill="rgba(0,119,255,0.3)" />
        </g>
      </svg>
    </div>
  );
};

export default WaveBackground;
