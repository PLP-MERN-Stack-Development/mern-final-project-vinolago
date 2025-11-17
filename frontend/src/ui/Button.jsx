import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = `
  inline-flex items-center justify-center font-medium rounded-lg transition-colors
  focus:outline-none focus:ring-0 focus:border-none active:outline-none active:ring-0
`;


  const variants = {
    primary: 'bg-[#9fe870] hover:bg-[#65cf21] text-[#163300] focus:ring-0',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-0',
    outline: 'border border-[#9f3870] bg-[#9fe870] hover:bg-[#65cf21] text-gray-700 focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;