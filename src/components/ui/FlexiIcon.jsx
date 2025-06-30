import React from 'react';
import '../../globals.css';

export const FlexiIconWrapper = ({ 
  children, 
  size = 'default',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    default: 'icon-wrapper',
    large: 'icon-wrapper icon-wrapper-large'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </div>
  );
};