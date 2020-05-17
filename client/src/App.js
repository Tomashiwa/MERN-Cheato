import React from 'react';
import AppNavbar from "./components/AppNavbar"
import RectangleList from "./components/RectangleList"

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css';
import Container from 'reactstrap/lib/Container';

function App() {
  return (
    <div className="App">
      <AppNavbar />
      <Container id="container">
        <RectangleList />
        <br></br>
        <br></br>
        <canvas id="canvas" width="600" height="600"></canvas>
      </Container>
    </div>
  );
}

export default App;
