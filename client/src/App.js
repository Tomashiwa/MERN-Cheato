import React, { useState } from 'react'
import AppNavbar from "./components/AppNavbar"
import InputForm from "./components/InputForm"
import ImageCanvas, { CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT} from "./components/ImageCanvas"
import Container from 'reactstrap/lib/Container';

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css';

export const ImagesContext = React.createContext(null);
export const ConfigContext = React.createContext(null);

function App() {
  const [images, setImages] = useState([]);
  const [config, setConfig] = useState({
    arrangement: "generated",
    sortOrder: "largestSide",
    resolution: "a4",
    canvasWidth: CANVAS_BASE_WIDTH,
    canvasHeight: CANVAS_BASE_HEIGHT 
  });

  return (
    <div className="App">
      <AppNavbar />
      <Container id="container">
        <ImagesContext.Provider value={{images, setImages}}>
          <ConfigContext.Provider value={{config, setConfig}}>
            <InputForm />
            <ImageCanvas />
          </ConfigContext.Provider>
        </ImagesContext.Provider>
      </Container>
    </div>
  );
}

export default App;
