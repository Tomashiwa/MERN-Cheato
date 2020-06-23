import React, { useState, useEffect } from 'react';

import AppNavbar from "../components/AppNavbar";
import CheatsheetCard from "../components/CheatsheetCard";
import CommentCard from "../components/CommentCard";

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
    
    
    
return (
        <div>
            <div className = "gallery">
            {cheatsheets.map(cs => (
                <CheatsheetCard sheet = {cs} /> 
           ))}
           </div>
        </div>
   
    )
}

export default Home;
