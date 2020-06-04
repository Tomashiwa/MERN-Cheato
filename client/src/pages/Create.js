import React from 'react'

import AppNavbar from '../components/AppNavbar'
import InputForm from "../components/InputForm";
import ImageCanvas from "../components/ImageCanvas";

import Container from 'reactstrap/lib/Container';

function Create() {
    return (
        <div>
            <AppNavbar />
            <Container id="container">
                <InputForm />
                <ImageCanvas />
            </Container>
        </div>
    )
}

export default Create
