import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import BlurText from "./components/BlurText";

const App = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAnimationComplete = () => {
    console.log('RE-LEARN animation completed!');
  };

  useEffect(() => {
    // Initialize theme based on system preference or saved state
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className={`font-space-mono min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="flex-1 flex flex-col items-center justify-center pt-28">
        <div className="text-center mt-[-70vh]">
          <p className="space-mono-regular text-lg">Start learning with</p>
          <BlurText
            text="RE-LEARN"
            delay={150}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="space-mono-bold text-8xl"
          />
        </div>
        <p className="space-mono-regular-italic">This is the main application component.</p>
        <Home />
      </div>
    </div>
  );
}

export default App;