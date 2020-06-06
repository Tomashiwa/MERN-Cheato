import React from 'react'

import AppNavbar from '../components/AppNavbar'
import ImageCanvas from "../components/ImageCanvas";

import Container from 'reactstrap/lib/Container';

function Create() {
    return (
        <div>
            <AppNavbar />
            <Container id="container">
                <ImageCanvas />
            </Container>
        </div>
    )
}

export default Create
