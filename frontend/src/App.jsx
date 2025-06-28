import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";
import Survey from "./pages/Survey";
import Roleplay from "./pages/Roleplay";
import Chains from "./pages/Chains";
import BlurText from "./components/BlurText";
import CustomNavbar from "./pages/CustomNavbar";
import ClickSpark from "./components/ClickSpark"; // Import the ClickSpark component
import Aurora from "./components/Aurora"; // Import the Aurora component

const AppContent = () => {
  const [theme, setTheme] = useState('light');
  const location = useLocation();

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
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen" style={{ overflow: 'hidden' }}>
      <Aurora
        colorStops={theme === 'dark' ? ["#3A29FF", "#FF94B4", "#FF3232"] : ["#5227FF", "#7cff67", "#5227FF"]}
        amplitude={1.0}
        blend={0.5}
        speed={0.5}
        className="absolute top-0 left-0 z-0"
      />
      <ClickSpark
        sparkColor={theme === 'dark' ? '#38bdf8' : '#0ea5e9'}
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <div className={`font-space-mono min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''} z-10 relative`}>
          {location.pathname === '/survey' ? (
            <CustomNavbar theme={theme} toggleTheme={toggleTheme} />
          ) : (
            <Navbar theme={theme} toggleTheme={toggleTheme} />
          )}
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex-1 flex flex-col items-center justify-center pt-28">
                  <div className="text-center mt-[-110vh]">
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
                  <p className="space-mono-regular-italic"></p>
                  <Home />
                </div>
              }
            />
            <Route path="/login" element={<Login theme={theme} />} />
            <Route path="/survey" element={<Survey theme={theme} />} />
            <Route path="/roleplay" element={<Roleplay theme={theme} />} />
            <Route path="/chains" element={<Chains />} />
          </Routes>
        </div>
      </ClickSpark>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;