import React from 'react';
import loginBackground from '../../assets/images/loginppage.png';

export const BackgroundCanvas = () => {
  return (
    <div className="game-background-container" aria-hidden="true">
      <div
        className="static-background"
        style={{
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="game-background-overlay" />
    </div>
  );
};




