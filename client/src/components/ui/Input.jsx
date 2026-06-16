import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  disabled = false,
  className = '',
  name,
  autoComplete,
}) => {
  const baseStyles = 'w-full px-4 py-2 bg-[#17212b] border border-[#0e1621] rounded-lg text-white placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#2b5278] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';

  const combinedClassName = `${baseStyles} ${errorStyles} ${className}`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[#708499]">{label}</label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={combinedClassName}
        autoComplete={autoComplete}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
