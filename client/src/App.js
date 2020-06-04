import React, { useState } from 'react'
import { CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT } from "./components/ImageCanvas"

import { Switch, Route } from "react-router-dom"
import Home from "./pages/Home"
import Create from "./pages/Create"
import Upload from "./pages/Upload"

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css'

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
        <ImagesContext.Provider value={{images, setImages}}>
          <ConfigContext.Provider value={{config, setConfig}}>
            <Switch>
              <Route path="/create" component={Create} />
              <Route path="/upload" component={Upload} />          
              <Route path="/" component={Home} />
            </Switch>
          </ConfigContext.Provider>
        </ImagesContext.Provider>
    </div>
  );
}

export default App;
