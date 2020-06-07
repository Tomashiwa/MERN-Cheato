import React, { useState, useEffect, useRef } from 'react'

import AppNavbar from '../components/AppNavbar'

import ImageCanvas from "../components/ImageCanvas";
import CreateForm from '../components/CreateForm';
import ImagePreviewer from '../components/ImagePreviewer';

import {Container, Button} from 'reactstrap';
import "./css/Create.css"
import Axios from 'axios';

export const CREATE_STEP_IMPORT = 1;
export const CREATE_STEP_FORM = 2;
export const CREATE_STEP_PREVIEW = 3;

function Create() {
    const [formStep, setFormStep] = useState(CREATE_STEP_IMPORT);
    const [form, setForm] = useState({
        blob: null,
        name: "",
        school: "",
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

        const saveToDb = url => {
            const newCheatsheet = {
                file: url,
                user: 0,
                school: form.school,
                module: form.module,
                description: form.description,
                datetime: Date.now(),
                rating: 0,
                comments: []
            }

            console.log(newCheatsheet);
            // Axios.post("/api/cheatsheets", newCheatsheet)
            //     .catch(err => console.log(err));
        }

        const upload = () => {
            const formData = new FormData();
            formData.append("file", form.blob, `${form.name}.png`);

            console.log("uploading formdata");
            console.log(formData);

            // console.log("saving to db");
            // saveToDb("dummyurl");

            // Axios.post("/upload", formData)
            //     .then(res => {
            //         console.log(res.data.data.Location);
            //         saveToDb(res.data.data.Location);                    
            //     })
            //     .catch(err => console.log(err));
        };

        const next = e => {
            if(formStep === CREATE_STEP_FORM) {
                upload();
            }

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
    }, [formStep, form])

    return (
        <div>
            <AppNavbar />
            <Container id="create-container">
                <Button id="create-btn-prev">Previous</Button>
                <Button id="create-btn-next">Next</Button>
                <Button onClick={() => console.log(form)}>Blob test</Button>
                {
                    formStep === CREATE_STEP_IMPORT
                        ? <ImageCanvas form={form} setForm={setForm}/>
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
