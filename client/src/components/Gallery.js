import React, { useState, useEffect } from 'react'

import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import CheatsheetCard from "../components/CheatsheetCard";

import axios from "axios";
import "./css/Gallery.css";

function Gallery() {
    const [sortOrder, setSortOrder] = useState("dateTime")
    const [cheatsheets, setCheatsheets] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    useEffect(() => {
        const fetchImages = () => {
            axios.post("/api/cheatsheets")
                .then(res => {
                    if (sortOrder === "dateTime") {
                        setCheatsheets(res.data);
                        setLoaded(true);
                    } else {
                        const sorted = res.data.sort(function (a, b) {
                            return b.rating - a.rating;
                        });
                        setCheatsheets(sorted);
                        setLoaded(true);
                    }
                })
                .catch(err => {
                    console.log(`Fail to fetch cheatsheets: ${err}`);
                });
        }

        fetchImages();
    }, [sortOrder]);
    
    
    const byRating = () => {
        setSortOrder("Popularity")
    
    }
    
    const byTime = () => {
        setSortOrder("dateTime");
    }

    return (
        <div>
            <div id="dropdownMenu">
                <ButtonDropdown isOpen={isOpen} toggle={toggle}>
                    <DropdownToggle caret>
                        Sort by:
                </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={byTime} >Date Uploaded</DropdownItem>
                        <DropdownItem onClick={byRating}>Popularity</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </div>
            <div className="gallery">
                {cheatsheets.map((cs,index) => (
                    <CheatsheetCard key = {index} sheet={cs} />
                ))}
            </div>
        </div >

    )
}

export default Gallery;

