import React from 'react';

// The animated emoji/particle backdrop was replaced with a calm, clean surface so every page reads the
// same way. The wrapper is kept so existing imports and the DynamicBackground context keep working.
const DynamicBackground = ({ children, className = '' }) => (
  <div className={`app-surface min-h-screen ${className}`}>{children}</div>
);

export default DynamicBackground;

export const FloatingShapes = () => null;
export const FloatingParticle = () => null;
