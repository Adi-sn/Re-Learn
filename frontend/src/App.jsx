import React from "react";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";

const App = () => {
  return (
    <div>
      <Navbar/>
      <h1>Welcome to the App</h1>
      <p>This is the main application component.</p>
      <Home />
    </div>
  );
}
export default App;