import React, {useState, useEffect, useRef} from 'react'
import {Input, Button} from "reactstrap";
import axios from "axios";
import Fuse from "fuse.js";
import {useHistory} from "react-router-dom";

import "./css/FuseSearchbar.css"

function FuseSearchbar() {
    const [term, setTerm] = useState("");
    const [list, setList] = useState([]);
    const [results, setResults] = useState([]);

    const [isFocused, setIsFocused] = useState(false);

    const limitRef = useRef(5);
    const optionsRef = useRef({
        keys: [
            "id",
            "data.name",
            "data.code",
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
        const searchSheets = axios.get(`/api/cheatsheets/`);
        const searchSchools = axios.get(`/api/schools/`);
        const searchModules = axios.get(`/api/modules/`);

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
    }, [])

    // Determine results when user provide a search term
    useEffect(() => {
        if(term.length > 0) {
            const fuse = new Fuse(list, optionsRef.current);
            const results = fuse.search(term).slice(0, limitRef.current);
            setResults(results);
        } else {
            setResults([]);
        }
    }, [term, list, optionsRef, setResults])

    useEffect(() => console.log("term changed !!"), [term]);
    useEffect(() => console.log("list changed !!"), [list]);
    useEffect(() => console.log("options changed !!"), [optionsRef]);
    useEffect(() => console.log("results changed !!"), [setResults]);

    const browse = result => {
        console.log("Will be browsing...");
        
        if(result.type === "sheet") {
            console.log("Browsing a sheet");
            history.push(`/view/${result.id}`);
            setIsFocused(false);
        } else if(result.type === "school") {
            console.log("Browsing a school");
            history.push(`/${result.id}`);
        } else if(result.type === "module") {
            console.log("Browsing a module");
            history.push(`/${result.id}`);
        }
    }

    return (
        <div id="searchbar">
            <Input 
                id="searchbar-input"
                type="text"
            />

            <div id="searchbar-list">
                {
                    isFocused && results.map(result => (
                        <Button key={result.id} onClick={() => browse(result)}>
                            {`${result.type} - ${result.data.name}`}
                        </Button>
                    ))
                }
            </div>
        </div>
    )
}

export default FuseSearchbar
