import React, { useState } from 'react'
import AppNavbar from "./components/AppNavbar"
import InputForm from "./components/InputForm"
import ImageCanvas from "./components/ImageCanvas"

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
            <ImageCanvas />
          </ConfigContext.Provider>
        </ImagesContext.Provider>
      </Container>
    </div>
  );
}

export default App;
