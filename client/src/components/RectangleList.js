import React, { Component } from 'react';
import axios from "axios";
import { Container, ListGroup, ListGroupItem, Button } from "reactstrap";

import RectModal from "./RectModal"

class RectangleList extends Component {
    state = { 
        rectangles: [],
        loaded: false
    }

    componentDidMount() {
        this.fetchRects();
    }

    fetchRects = () => {
        axios.get("/api/rectangles")
            .then(res => {
                this.setState({rectangles: res.data, loaded: true});
            })
            .catch(err => {
                console.log(`Fail to fetch rectangles: ${err}`);
            });
    }

    addRect = newRect => {
        axios.post("/api/rectangles", newRect)
            .then(res => {
                this.setState({
                    rectangles: [...this.state.rectangles, res.data],
                    loaded: true
                });
            })
            .catch(err => console.log(`Fail to create rectangle: ${err}`));
    }

    deleteRect = id => {
        axios.delete(`/api/rectangles/${id}`)
            .then(res => {
                console.log(`Rectangle ${id} has been deleted...`);
                this.setState(state => ({
                    rectangles: state.rectangles.filter(rect => {console.log(`rect id: ${rect._id}, id: ${id}`); return rect._id !== id}),
                    loaded: true
                }));
            })
            .catch(err => console.log(`Fail to delete rectangle ${id}: ${err}`));
    }

    render() { 
        const { rectangles } = this.state;
        return( 
            <Container>
                <RectModal addRect={this.addRect}/>                

                <ListGroup className="rect-list">
                    {rectangles.map(({_id, length, width, pos_x, pos_y}) => (
                        <ListGroupItem key={_id}>
                            <Button 
                                className="remove-btn" 
                                color="danger" 
                                size="sm"
                                onClick={() => this.deleteRect(_id)}
                            >
                                &times;
                            </Button>
                            {`Rect ${_id} (${length}x${width}) @ (${pos_x},${pos_y})`}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </Container>
        );
    }
}
 
export default RectangleList;