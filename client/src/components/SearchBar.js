import React, { useState, useEffect } from 'react';

import axios from "axios";
import ReactSearchBox from "react-search-box";
import { useHistory } from "react-router-dom";

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [cheatsheets, setCheatsheets] = useState([]);
    const [autocompletes, setAutocompletes] = useState([]);

    const history = useHistory();

    // Fetch similar cheatsheets from backend based on given input
    useEffect(() => {
        axios.get("/api/cheatsheets")
            .then(res => {
                setCheatsheets(res.data);
                console.log("Fetched cheatsheets");
            })
            .catch(err => {
                console.log(`Fail to fetch cheatsheets: ${err}`);
            });
    }, [searchTerm, setCheatsheets])

    // Convert fetched cheatsheets to potential autocompletes to be suggested to user
    useEffect(() => {
        const newAutocompletes = cheatsheets.map(cheatsheet => {
            return {key: cheatsheet._id, value: cheatsheet.school};
        });
        
        console.log("newAutocompletes:");
        console.log(newAutocompletes);
        
        setAutocompletes(newAutocompletes);
    }, [cheatsheets])

    // Go to the view page of the cheatsheet selected by user
    const viewCheatsheet = option => {
        history.push(`/view/${option.key}`);
    }

    // Update searchTerm based on user's input
    const updateTerm = value => {
        setSearchTerm(value);
    }

    return (
        <ReactSearchBox
            placeholder="Search for cheatsheets here..."
            data={autocompletes}
            onSelect={viewCheatsheet}
            onChange={updateTerm}
            value={searchTerm}
        />
    )
}

export default SearchBar
