import React from 'react';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};

// ⭐ Use the uploaded file directly
const HERB_IMAGE = "/mnt/data/herb-mascot.png";

export const Mascot: React.FC<MascotProps> = ({ size = 'md' }) => {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-munch-light dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm`}
    >
      <img
        src={HERB_IMAGE}
        alt="Herb the raccoon"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
