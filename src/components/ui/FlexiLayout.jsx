import React from 'react';
import '../../globals.css';

export const FlexiPageLayout = ({ children, className = '' }) => {
  return (
    <div className={`layout-full-screen ${className}`}>
      <div className="layout-container">
        {children}
      </div>
    </div>
  );
};

export const FlexiContainer = ({ children, size = 'default', className = '' }) => {
  const sizeClasses = {
    default: 'layout-container',
    small: 'layout-container-sm'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};