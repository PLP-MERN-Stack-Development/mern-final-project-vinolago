import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'medium',
  rounded = 'large',
  ...props
}) => {
  const baseStyles = 'bg-white border border-gray-200';

  const paddings = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const shadows = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  };

  const roundeds = {
    none: '',
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-xl',
  };

  const classes = [
    baseStyles,
    paddings[padding],
    shadows[shadow],
    roundeds[rounded],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;