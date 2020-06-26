import React, {useState, useEffect, useRef, useContext} from 'react'
import {Input, Button} from "reactstrap";
import axios from "axios";
import Fuse from "fuse.js";
import {useHistory} from "react-router-dom";

import "./css/FuseSearchbar.css"
import sheetIcon from "../icons/icon-sheet.svg";
import schoolIcon from "../icons/icon-school.svg";
import moduleIcon from "../icons/icon-module.svg";
import UserContext from '../context/UserContext';

const SEARCHBAR_MAX_CHARS = 50;
const SEARCHBAR_ICON_SIZE = 24;
const SEARCHBAR_MAX_RESULTS = 5;

function FuseSearchbar() {
    const {userData} = useContext(UserContext);

    const [term, setTerm] = useState("");
    const [list, setList] = useState([]);
    const [results, setResults] = useState([]);

    const [isFocused, setIsFocused] = useState(false);

    const optionsRef = useRef({
        keys: [
            "id",
            "data.name",
            "data.description"
        ]
    });

    const history = useHistory();

    // Update searchTerm upon user's input
    useEffect(() => {
        const searchBar = document.querySelector("#searchbar-input");
                
        const changeSearchTerm = e => setTerm(e.target.value);
        const focus = e => setIsFocused(true);
        const blur = e => {
            if(isFocused && e.target !== searchBar) {
                setIsFocused(false);
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
        const postConfig = {headers: {"Content-Type": "application/json"}};

        const searchSheets = userData.user === undefined
            ? axios.post("/api/cheatsheets", null, postConfig)
            : axios.post("/api/cheatsheets", userData.user, postConfig); 
        const searchSchools = axios.get("/api/schools/");
        const searchModules = axios.get("/api/modules/");

        Promise
            .all([searchSheets, searchSchools, searchModules])
            .then(resultSets => {
                const sheets = resultSets[0].data.map(sheet => {
                    return {
                        id: sheet._id,
                        type: "sheet",
                        data: sheet
                    }
                });

                const schools = resultSets[1].data.map(school => {
                    return {
                        id: school._id,
                        type: "school",
                        data: school
                    }
                });

                const modules = resultSets[2].data.map(module => {
                    return {
                        id: module._id,
                        type: "module",
                        data: module
                    }
                });

                setList(sheets.concat(schools, modules));
            })
    }, [userData.user])

    // Determine results when user provide a search term
    useEffect(() => {
        if(term.length > 0) {
            const fuse = new Fuse(list, optionsRef.current);
            const results = fuse.search(term)
                .slice(0, SEARCHBAR_MAX_RESULTS)
                .map(result => result.item);
            setResults(results);
        } else {
            setResults([]);
        }
    }, [term, list, optionsRef, setResults])

    // Search term upon pressing enter
    useEffect(() => {
        const searchBar = document.querySelector("#searchbar-input");
        const search = e => {
            if(e.key === "Enter" && term.length > 0) {
                // const fuse = new Fuse(list, optionsRef.current);
                // const results = fuse.search(term).map(result => result.item);

                setIsFocused(false);
                setResults([]);
                document.querySelector("#searchbar-input").value = "";
                
                history.push(`/search/${term}`);
            }
        }

        searchBar.addEventListener("keydown", search);
        return () => searchBar.removeEventListener("keydown", search);
    })

    const browse = result => {
        console.log("Will be browsing...");
        
        if(result.type === "sheet") {
            console.log("Browsing a sheet");
            console.log(result);

            history.push(`/view/${result.id}`);
        } else if(result.type === "school") {
            console.log("Browsing a school");
            console.log(result);

            history.push(`/${result.id}`);
        } else if(result.type === "module") {
            console.log("Browsing a module");
            console.log(result);

            history.push(`/${result.id}`);
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
            />

            <div id="searchbar-list">
                {
                    isFocused && results.map(result => (
                        <Button key={result.id} onClick={() => browse(result)} color="light">
                            <div>
                                <img 
                                    src={result.type === "sheet" 
                                            ? sheetIcon
                                        :result.type === "school"
                                            ? schoolIcon 
                                        : moduleIcon} 
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
