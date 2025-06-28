import React from 'react';
import { useNavigate } from 'react-router-dom';

const MinimalNavbar = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 w-full p-6 z-50">
      <nav className="flex items-center">
        <button
          onClick={() => navigate('/')}
          className="font-space-mono space-mono-bold text-white text-xl uppercase tracking-wider transition-opacity hover:opacity-80"
        >
          Re-Learn
        </button>
      </nav>
    </header>
  );
};

export default MinimalNavbar;