import React, { useState, useEffect } from 'react'
import { Container, ListGroup, ListGroupItem, Button } from "reactstrap";

import axios from "axios";

function CheatsheetList() {
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

    useEffect(() => {
        const deleteCheatsheet = id => {
            axios.delete(`/api/cheatsheets/${id}`)
                .then(res => {
                    setCheatsheets(cheatsheets.filter(cheatsheet => cheatsheet._id !== id));
                    setLoaded(true);
                })
                .catch(err => console.log(`Fail to delete cheatsheet ${id}: ${err}`));
        }

        const removeBtns = document.querySelectorAll(".remove-btn");
        if(removeBtns.length > 0) {
            const removeCheatsheet = e => deleteCheatsheet(e.target.getAttribute("index"));
            removeBtns.forEach(btn => btn.addEventListener("click", removeCheatsheet));
            return () => removeBtns.forEach(btn => btn.removeEventListener("click", removeCheatsheet));
        }
    }, [cheatsheets]);

    return( 
        <Container>
            <ListGroup className="cheatsheet-list">
                {cheatsheets.map(({_id, file, datetime}) => (
                    <ListGroupItem key={_id}>
                        <Button 
                            className="remove-btn" 
                            color="danger" 
                            size="sm"
                            index={_id}
                        >
                            &times;
                        </Button>
                        {`#${_id} @ ${datetime}: ${file}`}
                    </ListGroupItem>
                ))}
            </ListGroup>
        </Container>
    );
}
 
export default CheatsheetList;