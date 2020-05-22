import React, { useState } from 'react'
import AppNavbar from "./components/AppNavbar"
import InputForm from "./components/InputForm"
import RectangleList from "./components/RectangleList"

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css';
import Container from 'reactstrap/lib/Container';

export const ImagesContext = React.createContext(null);
export const ConfigContext = React.createContext(null);

function App() {
  const [images, setImages] = useState([]);
  const [config, setConfig] = useState({
    arrangement: "generated",
    sortOrder: "largestSide",
    resolution: "a4"
  });

  return (
    <div className="App">
      <AppNavbar />
      <Container id="container">
        <ImagesContext.Provider value={{images, setImages}}>
          <ConfigContext.Provider value={{config, setConfig}}>
            <InputForm />
          </ConfigContext.Provider>
        </ImagesContext.Provider>
        <br></br>
        <RectangleList />
        <br></br>
        <canvas id="canvas" width="850" height="500"></canvas>
      </Container>
    </div>
  );
}

export default App;
