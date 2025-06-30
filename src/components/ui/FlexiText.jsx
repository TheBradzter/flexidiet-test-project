import React from 'react';
import '../../globals.css';

export const FlexiHeading = ({ 
  level = 1, 
  children, 
  className = '',
  ...props 
}) => {
  const Tag = `h${level}`;
  const headingClasses = {
    1: 'text-heading-1',
    2: 'text-heading-2',
    3: 'text-heading-3'
  };

  return (
    <Tag className={`${headingClasses[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

export const FlexiText = ({ 
  variant = 'body', 
  children, 
  className = '',
  ...props 
}) => {
  const textClasses = {
    body: 'text-body',
    'body-light': 'text-body-light',
    small: 'text-small'
  };

  return (
    <p className={`${textClasses[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};