import React, { useState, useEffect, useRef } from 'react'

import AppNavbar from '../components/AppNavbar'

import ImageCanvas from "../components/ImageCanvas";
import CreateForm from '../components/CreateForm';
import ImagePreviewer from '../components/ImagePreviewer';

import {Container, Button} from 'reactstrap';
import "./css/Create.css"

export const CREATE_STEP_IMPORT = 1;
export const CREATE_STEP_FORM = 2;
export const CREATE_STEP_PREVIEW = 3;

function Create() {
    const [formStep, setFormStep] = useState(CREATE_STEP_IMPORT);
    const [form, setForm] = useState({
        canvas: null,
        url: "",
        name: "",
        institution: "",
        module: "",
        description: "",
        isPublic: false
    });

    //Form navigation
    useEffect(() => {
        const prev = e => {
            const prevStep = formStep - 1 > 0
                ? formStep - 1
                : CREATE_STEP_IMPORT;
            setFormStep(prevStep);
        };

        const next = e => {
            const nextStep = formStep + 1 < 3
                ? formStep + 1
                : CREATE_STEP_PREVIEW;
            setFormStep(nextStep);
        };

        const prevBtn = document.querySelector("#create-btn-prev");
        const nextBtn = document.querySelector("#create-btn-next");

        prevBtn.addEventListener("click", prev);
        nextBtn.addEventListener("click", next);

        return () => {
            prevBtn.removeEventListener("click", prev);
            nextBtn.removeEventListener("click", next);
        }
    }, [formStep])

    return (
        <div>
            <AppNavbar />
            <Container id="create-container">
                <Button id="create-btn-prev">Previous</Button>
                <Button id="create-btn-next">Next</Button>
                {
                    formStep === CREATE_STEP_IMPORT
                        ? <ImageCanvas setForm={setForm}/>
                    : formStep === CREATE_STEP_FORM
                        ? <CreateForm form={form} setForm={setForm} />
                    : formStep === CREATE_STEP_PREVIEW
                        ? <ImagePreviewer imageURL={form.url} />
                    : <div></div>
                }
            </Container>
        </div>
    )
}

export default Create
