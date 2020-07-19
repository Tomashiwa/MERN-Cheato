import React, { useState, useEffect } from 'react'
import axios from "axios";
import { Container, ListGroup, ListGroupItem, Button } from "reactstrap";

import RectModal from "./RectModal"

function RectangleList() {
    const [rectangles, setRectangles] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
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

        const drawRects = () => {
            const canvas = document.querySelector("#canvas");
            const ctx = canvas.getContext("2d");
    
            ctx.clearRect(0, 0, 850, 500);
            rectangles.forEach(rect => {
                ctx.fillStyle = `rgb(${255 * (rect.width/850)}, ${255 * (rect.height/500)}, 0)`;
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            });
        }

        if(!loaded) {
            fetchRects();
        } else {
            drawRects();
        }
    }, [loaded, rectangles]);

    useEffect(() => {
        const deleteRect = id => {
            axios.delete(`/api/rectangles/${id}`)
                .then(res => {
                    setRectangles(rectangles.filter(rect => rect._id !== id));
                    setLoaded(true);
                })
                .catch(err => console.log(`Fail to delete rectangle ${id}: ${err}`));
        }

        const removeBtns = document.querySelectorAll(".remove-btn");
        if(removeBtns.length > 0) {
            const removeRect = e => deleteRect(e.target.getAttribute("index"));
            removeBtns.forEach(btn => btn.addEventListener("click", removeRect));
            return () => removeBtns.forEach(btn => btn.removeEventListener("click", removeRect));
        }
    }, [rectangles]);

    const addRect = newRect => {
        axios.post("/api/rectangles", newRect)
            .then(res => {
                setRectangles([...rectangles, res.data]);
                setLoaded(true);
            })
            .catch(err => console.log(`Fail to create rectangle: ${err}`));
    }

    return( 
        <Container>
            <RectModal addRect={addRect}/>                

            <ListGroup className="rect-list">
                {rectangles.map(({_id, width, height, x, y}) => (
                    <ListGroupItem key={_id}>
                        <Button 
                            className="remove-btn" 
                            color="danger" 
                            size="sm"
                            index={_id}
                        >
                            &times;
                        </Button>
                        {`Rectangle of ${width} x ${height} @ (${x}, ${y})`}
                    </ListGroupItem>
                ))}
            </ListGroup>
        </Container>
    );
}
 
export default RectangleList;