import React from 'react';
import backgroundVideo from '../../assets/images/video.mp4';

export const VideoIntro = ({ onEnded }) => {
  return (
    <div className="video-intro-screen" aria-label="Mission Intro Video">
      <video
        className="login-intro-video"
        autoPlay
        muted
        playsInline
        onEnded={onEnded}
        onError={onEnded}
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>
    </div>
  );
};
