import React from 'react';
import AppNavbar from "./components/AppNavbar"
import RectangleList from "./components/RectangleList"

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css';

function App() {
  return (
    <div className="App">
      <AppNavbar />
      <RectangleList />
    </div>
  );
}

export default App;
