import React from 'react';
import '../../globals.css';

export const FlexiCard = ({ 
  children, 
  variant = 'base', 
  className = '', 
  onClick,
  hover = false,
  ...props 
}) => {
  const baseClasses = {
    base: 'card-base',
    glass: 'card-glass',
    setup: 'card-setup'
  };

  const classes = [
    baseClasses[variant],
    hover && 'hover-lift',
    onClick && 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export const FlexiCardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

export const FlexiCardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  );
};