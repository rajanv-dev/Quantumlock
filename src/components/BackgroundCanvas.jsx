import React from 'react';

export const BackgroundCanvas = () => {
  return (
    <div className="global-doom-backdrop" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {/* Static Website Background Image */}
      <div
        className="global-doom-artwork"
        style={{
          backgroundImage: "url('/images/loginppage.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          position: 'absolute',
          inset: 0,
          transform: 'none',
          animation: 'none'
        }}
      />
      {/* Subtle dark overlay for contrast */}
      <div
        className="global-doom-layer global-doom-layer--grade"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 8, 7, 0.15)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};
