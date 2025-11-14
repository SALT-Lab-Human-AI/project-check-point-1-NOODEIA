import React from 'react';

// Base Puffy Card Component
export function PuffyCard({
  children,
  color = 'purple',
  size = 'md',
  onClick,
  animate = true,
  className = ''
}) {
  const colorStyles = {
    blue: 'bg-gradient-to-br from-blue-200 via-blue-100 to-blue-50',
    purple: 'bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100',
    pink: 'bg-gradient-to-br from-pink-200 via-pink-100 to-pink-50',
    yellow: 'bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-50',
    green: 'bg-gradient-to-br from-green-200 via-green-100 to-green-50',
    orange: 'bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50',
  };

  const shadowStyles = {
    blue: 'shadow-[0_15px_30px_rgba(59,130,246,0.3),0_8px_16px_rgba(59,130,246,0.2),inset_0_2px_4px_rgba(255,255,255,0.5)]',
    purple: 'shadow-[0_15px_30px_rgba(168,85,247,0.3),0_8px_16px_rgba(168,85,247,0.2),inset_0_2px_4px_rgba(255,255,255,0.5)]',
    pink: 'shadow-[0_15px_30px_rgba(236,72,153,0.3),0_8px_16px_rgba(236,72,153,0.2),inset_0_2px_4px_rgba(255,255,255,0.5)]',
    yellow: 'shadow-[0_15px_30px_rgba(234,179,8,0.3),0_8px_16px_rgba(234,179,8,0.2),inset_0_2px_4px_rgba(255,255,255,0.5)]',
    green: 'shadow-[0_15px_30px_rgba(34,197,94,0.3),0_8px_16px_rgba(34,197,94,0.2),inset_0_2px_4px_rgba(255,255,255,0.5)]',
    orange: 'shadow-[0_15px_30px_rgba(249,115,22,0.3),0_8px_16px_rgba(249,115,22,0.2),inset_0_2px_4px_rgba(255,255,255,0.5)]',
  };

  const sizeStyles = {
    sm: 'p-4 rounded-2xl',
    md: 'p-6 rounded-3xl',
    lg: 'p-8 rounded-[2rem]',
  };

  const hoverAnimation = animate
    ? 'transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2),0_12px_20px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.6)]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`
        ${colorStyles[color]}
        ${shadowStyles[color]}
        ${sizeStyles[size]}
        ${hoverAnimation}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  );
}

// Puffy Button Component
export function PuffyButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  className = ''
}) {
  const variantStyles = {
    primary: 'bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 text-white shadow-[0_8px_16px_rgba(168,85,247,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    secondary: 'bg-gradient-to-br from-pink-500 via-pink-400 to-pink-300 text-white shadow-[0_8px_16px_rgba(236,72,153,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    white: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 text-purple-900 shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-3xl',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        font-black
        transition-all duration-300
        hover:translate-y-[-2px]
        hover:shadow-[0_12px_24px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)]
        active:translate-y-[0px]
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// Puffy Icon Button Component
export function PuffyIconButton({
  icon,
  color = 'white',
  size = 'md',
  notification = false,
  onClick,
  className = ''
}) {
  const colorStyles = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-[0_8px_16px_rgba(59,130,246,0.4)]',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-400 text-white shadow-[0_8px_16px_rgba(168,85,247,0.4)]',
    pink: 'bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-[0_8px_16px_rgba(236,72,153,0.4)]',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-400 text-white shadow-[0_8px_16px_rgba(234,179,8,0.4)]',
    white: 'bg-gradient-to-br from-white to-gray-100 text-purple-900 shadow-[0_8px_16px_rgba(0,0,0,0.1)]',
  };

  const sizeStyles = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${colorStyles[color]}
        ${sizeStyles[size]}
        rounded-full
        flex items-center justify-center
        transition-all duration-300
        hover:translate-y-[-2px]
        hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)]
        active:translate-y-[0px]
        relative
        ${className}
      `}
    >
      {icon}
      {notification && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

// Puffy Progress Circle Component
export function PuffyProgressCircle({
  children,
  progress = 0,
  size = 96,
  color = 'purple',
  className = ''
}) {
  const colorStyles = {
    blue: { stroke: '#3b82f6', bg: 'from-blue-100 to-blue-50' },
    purple: { stroke: '#a855f7', bg: 'from-purple-100 to-purple-50' },
    pink: { stroke: '#ec4899', bg: 'from-pink-100 to-pink-50' },
    green: { stroke: '#22c55e', bg: 'from-green-100 to-green-50' },
  };

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Circle */}
      <div
        className={`
          absolute inset-0
          bg-gradient-to-br ${colorStyles[color].bg}
          rounded-full
          shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)]
          flex items-center justify-center
        `}
      >
        {children}
      </div>

      {/* Progress Ring */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorStyles[color].stroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        />
      </svg>
    </div>
  );
}

// Puffy Badge Component
export function PuffyBadge({
  children,
  color = 'green',
  className = ''
}) {
  const colorStyles = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-400 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-400 text-white',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-400 text-white',
    green: 'bg-gradient-to-r from-green-500 to-green-400 text-white',
    yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white',
  };

  return (
    <span
      className={`
        ${colorStyles[color]}
        px-3 py-1
        rounded-full
        text-xs font-black
        shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]
        ${className}
      `}
    >
      {children}
    </span>
  );
}
