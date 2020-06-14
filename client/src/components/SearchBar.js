import React, { useState, useEffect } from 'react';

import axios from "axios";
import ReactSearchBox from "react-search-box";
import { useHistory } from "react-router-dom";

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [autocompletes, setAutocompletes] = useState([]);
    const history = useHistory();

    const resultLimit = 5;

    // Fetch similar cheatsheets from backend based on given input
    useEffect(() => {
        const nameComparator = (a, b) => {
            return a.name < b.name
                    ? -1
                : a.name > b.name
                    ? 1 : 0;
        }

        if(searchTerm.length > 0) {
            const searchSheets = axios.get(`/api/cheatsheets/search/${searchTerm}/${resultLimit}`);
            const searchSchools = axios.get(`/api/schools/search/${searchTerm}/${resultLimit}`);
            const searchModules = axios.get(`/api/modules/search/${searchTerm}/${resultLimit}`);
    
            Promise
                .all([searchSheets, searchSchools, searchModules])
                .then(results => {
                    const sheets = Array.prototype.slice.call(results[0].data)
                        .sort(nameComparator)
                        .map(sheet => {return {key: sheet._id, value: `Sheet - ${sheet.name}`}});
                    const schools =  Array.prototype.slice.call(results[1].data)
                        .sort(nameComparator)
                        .map(school => {return {key: school._id, value: `School - ${school.name}`}});
                    const modules = Array.prototype.slice.call(results[2].data)
                        .sort(nameComparator)
                        .map(module => {return {key: module._id, value: `Module - ${module.name}`}});
                
                    const newAutocompletes = sheets.concat(schools, modules).slice(0, resultLimit);

                    console.log("Autocompletes:");
                    console.log(newAutocompletes);

                    setAutocompletes(newAutocompletes);
                });
        }
    }, [searchTerm]);

    // Go to the view page of the cheatsheet selected by user
    const browseOption = option => {
        console.log(`option clicked: ${option.value}`);
        const clicked = option.value;

        if(clicked.includes("Sheet")) {
            history.push(`/view/${option.key}`);
        } else if(clicked.includes("School")) {
            console.log(`View sheets from the school, ${clicked}`);
            history.push(`/${option.key}`);
        } else if(clicked.includes("Module")) {
            console.log(`View sheets from the module, ${clicked}`);
            history.push(`/${option.key}`);
        }
    }

    // Update searchTerm based on user's input
    const updateTerm = value => {
        setSearchTerm(value);
    }

    return (
        <ReactSearchBox
            placeholder="Search here..."
            data={autocompletes}
            onSelect={browseOption}
            onChange={updateTerm}
            value={searchTerm}
            fuseConfigs={{
                threshold: 0.8,
              }}
        />
    )
}

export default SearchBar
