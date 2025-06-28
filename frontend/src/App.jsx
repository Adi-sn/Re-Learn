import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar"; // For homepage
import MinimalNavbar from "./pages/MinimalNavbar"; // For other pages
import Login from "./pages/Login";
import Survey from "./pages/Survey";
import BlurText from "./components/BlurText";
import ClickSpark from "./components/ClickSpark";

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    // Set dark theme globally and permanently for the new design
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#000'; // Ensure body bg is black
  }, []);

  const handleAnimationComplete = () => {
    console.log('RE-LEARN animation completed!');
  };

  const isHomePage = location.pathname === '/';

  return (
    // ClickSpark needs a relative parent
    <div className="relative min-h-screen"> 
      <ClickSpark
        sparkColor={'#38bdf8'}
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <div className="font-space-mono min-h-screen flex flex-col bg-black text-white">
          {isHomePage ? <Navbar /> : <MinimalNavbar />}
          
          <main className="flex-1 flex flex-col w-full">
            <Routes>
              <Route
                path="/"
                element={
                  // This div handles centering for the homepage content
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div>
                      <p className="space-mono-regular text-lg">Start learning with</p>
                      <BlurText
                        text="RE-LEARN"
                        delay={150}
                        animateBy="words"
                        direction="top"
                        onAnimationComplete={handleAnimationComplete}
                        className="space-mono-bold text-8xl"
                      />
                      <Home />
                    </div>
                  </div>
                }
              />
              {/* Page components now render directly without extra wrappers */}
              <Route path="/login" element={<Login />} />
              <Route path="/survey" element={<Survey />} />
            </Routes>
          </main>
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