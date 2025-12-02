import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  loading,
  ...props 
}) => {
  const baseStyle = "py-3.5 px-6 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-munch-green text-white shadow-glow hover:bg-[#00b572]",
    secondary: "bg-munch-light text-munch-green hover:bg-green-100",
    outline: "border-2 border-munch-green text-munch-green bg-transparent hover:bg-munch-light",
    ghost: "bg-transparent text-munch-med hover:text-munch-dark"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
};