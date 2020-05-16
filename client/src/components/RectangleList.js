import React, { useState, useEffect } from 'react'
import axios from "axios";
import { Container, ListGroup, ListGroupItem, Button } from "reactstrap";

import RectModal from "./RectModal"

function RectangleList() {
    const [rectangles, setRectangles] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if(!loaded) {
            fetchRects();
        }
    });

    const fetchRects = () => {
        axios.get("/api/rectangles")
            .then(res => {
                setRectangles(res.data);
                setLoaded(true);
            })
            .catch(err => {
                console.log(`Fail to fetch rectangles: ${err}`);
            });
    }

    const addRect = newRect => {
        axios.post("/api/rectangles", newRect)
            .then(res => {
                setRectangles([...rectangles, res.data]);
                setLoaded(true);
            })
            .catch(err => console.log(`Fail to create rectangle: ${err}`));
    }

    const deleteRect = id => {
        axios.delete(`/api/rectangles/${id}`)
            .then(res => {
                setRectangles(rectangles.filter(rect => rect._id !== id));
                setLoaded(true);
            })
            .catch(err => console.log(`Fail to delete rectangle ${id}: ${err}`));
    }

    return( 
        <Container>
            <RectModal addRect={addRect}/>                

            <ListGroup className="rect-list">
                {rectangles.map(({_id, length, width, pos_x, pos_y}) => (
                    <ListGroupItem key={_id}>
                        <Button 
                            className="remove-btn" 
                            color="danger" 
                            size="sm"
                            onClick={() => deleteRect(_id)}
                        >
                            &times;
                        </Button>
                        {`Rectangle of ${length} x ${width}`}
                    </ListGroupItem>
                ))}
            </ListGroup>
        </Container>
    );
}
 
export default RectangleList;