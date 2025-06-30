import React from 'react';
import '../../globals.css';

export const FlexiButton = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'btn-base focus-ring';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <div className="loading-spinner mr-2" style={{ width: '1rem', height: '1rem' }}></div>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};