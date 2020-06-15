import React, { useState, useEffect } from 'react';

import AppNavbar from "../components/AppNavbar";
import CheatsheetCard from "../components/CheatsheetCard";



import axios from "axios";
import "./css/Home.css";



function Home() {
   
    const [cheatsheets, setCheatsheets] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(() => {
        const fetchImages = () => {
            axios.get("/api/cheatsheets")
                .then(res => {
                    setCheatsheets(res.data);
                    setLoaded(true);
                })
                .catch(err => {
                    console.log(`Fail to fetch cheatsheets: ${err}`);
                });
        }

        fetchImages();
    }, []);
    
    console.log(cheatsheets);
    /*{cheatsheets.map(cs => (
        <CheatsheetCard sheet = {cs} /> 
    ))}*?
    

   /* <CheatsheetCard sheet = {cheatsheets}>

            </CheatsheetCard>*/
    
return (
        <div>
            <AppNavbar />
            <div className = "gallery">
            {cheatsheets.map(cs => (
                <CheatsheetCard sheet = {cs} /> 
           ))}
           </div>
    
        </div>
   
    )
}

export default Home;
