import React from 'react';

interface DefaultProductIconProps {
  className?: string;
}

const DefaultProductIcon: React.FC<DefaultProductIconProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center bg-gray-200 text-gray-500 w-full h-full rounded-md ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
  );
};

export default DefaultProductIcon;
