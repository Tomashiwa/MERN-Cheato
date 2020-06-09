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
        url: "",
        name: "",
        school: "",
        module: "",
        description: "",
        isPublic: false
    });

    const blobRef = useRef(null);

    const setBlob = blob => blobRef.current = blob;

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
                comments: [],
                isPublic: form.isPublic
            }

            Axios.post("/api/cheatsheets", newCheatsheet)
                .catch(err => console.log(err));
        }

        const upload = () => {
            const formData = new FormData();
            formData.append("file", blobRef.current, `${form.name}.png`);

            Axios.post("/upload", formData)
                .then(res => {
                    saveToDb(res.data.data.Location);
                    setForm({...form, ...{url: res.data.data.Location}});
                })
                .catch(err => console.log(err));
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
                {
                    formStep === CREATE_STEP_IMPORT
                        ? <ImageCanvas form={form} setBlob={setBlob} />
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
