import React from 'react';
import { useNavigate } from 'react-router-dom';

// A reusable NavLink component for the new style
const NavLink = ({ children, to }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      // Styling for the minimal text link with a border outline on hover
      className="font-space-mono space-mono-regular text-white uppercase tracking-wider p-2 transition-all duration-200 ease-in-out border border-transparent hover:border-white"
    >
      {children}
    </button>
  );
};


const Navbar = () => {
  return (
    // Position the header at the top right of the screen
    <header className="fixed top-0 right-0 p-4 z-50">
      <nav className="flex items-center space-x-4">
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/signup">Sign Up</NavLink>
        <NavLink to="/survey">Demo</NavLink>
      </nav>
    </header>
  );
};

export default Navbar;