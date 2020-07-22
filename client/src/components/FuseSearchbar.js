import React, {useState, useEffect, useContext, useRef} from 'react'
import {useHistory} from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";

import Input from 'reactstrap/lib/Input';
import Button from 'reactstrap/lib/Button';

import UserContext from '../context/UserContext';
import "./css/FuseSearchbar.css"

const SEARCHBAR_MAX_CHARS = 50;
const SEARCHBAR_ICON_SIZE = 24;
const SEARCHBAR_MAX_RESULTS = 5;

const URL_SHEETICON = "https://d2conugba1evp1.cloudfront.net/icons/icon-sheet.svg";

function FuseSearchbar() {
    const {userData} = useContext(UserContext);

    const [term, setTerm] = useState("");
    const [list, setList] = useState([]);
    const [results, setResults] = useState([]);

    const [isFocused, setIsFocused] = useState(false);
    const indexRef = useRef(-1);

    const history = useHistory();

    // Update searchTerm upon user's input
    useEffect(() => {
        const searchBar = document.querySelector("#searchbar-input");
                
        const changeSearchTerm = e => {
            const list = document.querySelector("#searchbar-list");

            if(indexRef.current >= 0 && indexRef.current < list.children.length) {
                list.children[indexRef.current].classList.remove("searchHover");
                indexRef.current = -1;
            }

            setTerm(e.target.value);
        }
        const focus = e => setIsFocused(true);
        const blur = e => {
            if(isFocused && e.target !== searchBar) {
                setIsFocused(false);
                indexRef.current = -1;
            }
        };

        searchBar.addEventListener("input", changeSearchTerm);
        searchBar.addEventListener("focus", focus);
        window.addEventListener("click", blur);

        return () => {
            searchBar.removeEventListener("input", changeSearchTerm);
            searchBar.removeEventListener("focus", focus);
            window.removeEventListener("click", blur);
        }
    }, [isFocused])

    // Fetch data from backend
    useEffect(() => {
        if(isFocused) {
            const postConfig = {headers: {"Content-Type": "application/json"}};
    
            const searchSheets = userData.user === undefined
                ? axios.post("/api/cheatsheets", null, postConfig)
                : axios.post("/api/cheatsheets", userData.user, postConfig); 
    
            searchSheets
                .then(resultSheets => {
                    const sheets = resultSheets.data.map(sheet => {
                        return {
                            id: sheet._id,
                            type: "sheet",
                            data: sheet
                        };
                    });
    
                    setList(sheets);
                })
        }
    }, [userData.user, isFocused])

    // Determine results when user provide a search term
    useEffect(() => {
        if(term.length > 0) {
            const options = {
                keys: [
                    "id",
                    "data.name",
                    "data.description"
                ]
            };
            const fuse = new Fuse(list, options);
            const results = fuse.search(term)
                .slice(0, SEARCHBAR_MAX_RESULTS)
                .map(result => result.item);
            setResults(results);
        } else {
            setResults([]);
        }
    }, [term, list, setResults])

    // Search term upon pressing enter
    useEffect(() => {
        const searchBar = document.querySelector("#searchbar-input");
        const list = document.querySelector("#searchbar-list");

        const up = e => {
            if(e.key === "ArrowUp" && results.length > 0) {
                if(indexRef.current >= 0 && indexRef.current < list.children.length) {
                    list.children[indexRef.current].classList.remove("searchHover");
                }
                indexRef.current = indexRef.current === 0 ? 0 : indexRef.current - 1;
                list.children[indexRef.current].classList.add("searchHover");
            }
        }
        const down = e => {
            if(e.key === "ArrowDown" && results.length > 0) {
                if(indexRef.current >= 0 && indexRef.current < list.children.length) {
                    list.children[indexRef.current].classList.remove("searchHover");
                }
                indexRef.current = indexRef.current === results.length - 1 ? results.length - 1 : indexRef.current + 1;
                list.children[indexRef.current].classList.add("searchHover")
            }
        }
        const enter = e => {
            if(e.key === "Enter" && indexRef.current >= 0 && indexRef.current < list.children.length) {
                list.children[indexRef.current].click();
                searchBar.blur();
            }
        }

        searchBar.addEventListener("keydown", up);
        searchBar.addEventListener("keydown", down);
        searchBar.addEventListener("keydown", enter);

        return () => {
            searchBar.removeEventListener("keydown", up);
            searchBar.removeEventListener("keydown", down);
            searchBar.removeEventListener("keydown", enter);
        }
    })

    const browse = result => {
        if(result.type === "sheet") {
            history.push(`/view/${result.id}`);
        }

        setIsFocused(false);
        setResults([]);
        document.querySelector("#searchbar-input").value = "";
    }

    return (
        <div id="searchbar">
            <Input 
                id="searchbar-input"
                type="text"
                placeholder="Search here..."
                size={`${SEARCHBAR_MAX_CHARS}`}
                autoComplete="off"
            />

            <div id="searchbar-list">
                {
                    isFocused && results.map(result => (
                        <Button key={result.id} onClick={() => browse(result)} color="light">
                            <div>
                                <img 
                                    src={URL_SHEETICON} 
                                    width={`${SEARCHBAR_ICON_SIZE}px`} 
                                    height={`${SEARCHBAR_ICON_SIZE}px`} 
                                    alt=""
                                />
                                <div>
                                    <span>{result.data.name}</span>
                                </div>
                            </div>
                        </Button>
                    ))
                }
            </div>
        </div>
    )
}

export default FuseSearchbar
