import React from 'react';

const Avatar = ({
  src,
  alt = '',
  size = 'md',
  className = '',
  fallback = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const combinedClassName = `rounded-full object-cover flex items-center justify-center font-medium text-white bg-[#2b5278] ${sizeStyles[size]} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={combinedClassName}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div className={combinedClassName}>
      {fallback || getInitials(alt)}
    </div>
  );
};

export default Avatar;
