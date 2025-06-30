import React from 'react';
import '../../globals.css';

export const FlexiInput = ({ 
  variant = 'base',
  className = '',
  ...props 
}) => {
  const baseClasses = 'input-base focus-ring';
  
  const variantClasses = {
    base: '',
    large: 'input-large'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <input className={classes} {...props} />
  );
};