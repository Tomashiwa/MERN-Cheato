import React from 'react'

import { Switch, Route } from "react-router-dom"
import Home from "./pages/Home"
import Create from "./pages/Create"
import Upload from "./pages/Upload"

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css'

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/create" component={Create} />
        <Route path="/upload" component={Upload} />          
        <Route path="/" component={Home} />
      </Switch>
    </div>
  );
}

export default App;
