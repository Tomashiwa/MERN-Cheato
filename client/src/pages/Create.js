import React, { useState, useEffect, useRef } from 'react'

import AppNavbar from '../components/AppNavbar'

import ImageCanvas from "../components/ImageCanvas";
import CreateForm from '../components/CreateForm';
import ImagePreviewer from '../components/ImagePreviewer';

import {Container, Button} from 'reactstrap';
import {Link} from "react-router-dom"
import "./css/Create.css"

import axios from 'axios';
import uuid from "uuid";
import Stepper from 'react-stepper-horizontal';

import {CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT} from "../components/ImageCanvas"

export const CREATE_STEP_IMPORT = 1;
export const CREATE_STEP_FORM = 2;
export const CREATE_STEP_PREVIEW = 3;

export const ImagesContext = React.createContext(null);
export const ConfigContext = React.createContext(null);

function Create() {
    const [images, setImages] = useState([]);
    const [config, setConfig] = useState({
        arrangement: "generated",
        sortOrder: "largestSide",
        resolution: "a4",
        canvasWidth: CANVAS_BASE_WIDTH,
        canvasHeight: CANVAS_BASE_HEIGHT
    });
    const [formStep, setFormStep] = useState(CREATE_STEP_IMPORT);
    const [form, setForm] = useState({
        url: "",
        name: "",
        school: "",
        module: "",
        description: "",
        isPublic: false
    });
    const [nextEnabled, setNextEnabled] = useState(false);

    const blobRef = useRef(null);

    const setBlob = blob => blobRef.current = blob;

    // Navigation events that happened when Next button is pressed
    useEffect(() => {
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

            axios.post("/api/cheatsheets", newCheatsheet)
                .catch(err => console.log(err));
        }
        
        const upload = () => {
            const formData = new FormData();
            formData.append("file", blobRef.current, `${form.name}-${uuid.v4()}.png`);
            
            axios.post("/upload", formData)
                .then(res => {
                    saveToDb(res.data.data.Location);
                    setForm({...form, ...{url: res.data.data.Location}});
                })
                .catch(err => console.log(err));
        };

        const hasStepCompleted = () => {
            return true;
        }

        const endStep = () => {
            if(formStep === CREATE_STEP_FORM) {
                upload();
            }
        }

        const nextStep = () => {
            const nextStep = formStep + 1 < 3
                ? formStep + 1
                : CREATE_STEP_PREVIEW;
            setFormStep(nextStep);
        }

        const next = e => {
            if(hasStepCompleted()) {
                endStep();
                nextStep();
            }
        };

        const nextBtn = document.querySelector("#create-btn-next");
        if(nextBtn) {
            nextBtn.addEventListener("click", next);
        }

        return () => {
            if(nextBtn) {
                nextBtn.removeEventListener("click", next);
            }
        }
    }, [formStep, form])

    // Verify if user can proceed to next step and toggle the Next button
    useEffect(() => {
        if(formStep === CREATE_STEP_PREVIEW && nextEnabled) {
            setNextEnabled(false);
        } else if(formStep === CREATE_STEP_FORM) {
            if(!nextEnabled && form.name.length > 0 && form.school.length > 0 && form.module.length > 0) {
                setNextEnabled(true);
            } else if(nextEnabled && (form.name.length === 0 || form.school.length === 0 || form.module.length === 0)) {
                setNextEnabled(false);
            }
        } else if(formStep === CREATE_STEP_IMPORT) {
            if(!nextEnabled && images.length > 0) {
                setNextEnabled(true);
            } else if(nextEnabled && images.length <= 0) {
                setNextEnabled(false);
            }
        }
    }, [formStep, form.name, form.school, form.module, images, nextEnabled]);

    return (    
        <div>
            <AppNavbar />
            <Container id="create-container">
                <ImagesContext.Provider value={{images, setImages}}>
                    <ConfigContext.Provider value={{config, setConfig}}>
                        <Stepper
                            size={40}
                            activeColor="#505050"
                            completeColor="#505050"
                            activeTitleColor="#FFF"
                            completeTitleColor="#FFF"
                            steps={[{title: "Create"}, {title: "Details"}, {title: "Preview"}]}
                            activeStep={formStep - 1}
                        />
                        {
                            formStep === CREATE_STEP_IMPORT
                                ? <h1>Import your cheatsheets</h1>
                            : formStep === CREATE_STEP_FORM
                                ? <h1>Fill in details</h1>
                            : formStep === CREATE_STEP_PREVIEW
                                ? <h1>Preview</h1>
                            : <div></div>
                        }
                        {
                            formStep === CREATE_STEP_PREVIEW
                                ? <Link to="/">
                                    <Button id="create-btn-finish">Finish</Button>
                                  </Link>
                                : <Button id="create-btn-next" disabled={!nextEnabled}>Next</Button>
                        }
                        {
                            formStep === CREATE_STEP_IMPORT
                                ? <ImageCanvas form={form} setBlob={setBlob} />
                            : formStep === CREATE_STEP_FORM
                                ? <CreateForm form={form} setForm={setForm} />
                            : formStep === CREATE_STEP_PREVIEW
                                ? <ImagePreviewer imageURL={form.url} />
                            : <div></div>
                        }
                    </ConfigContext.Provider>
                </ImagesContext.Provider>
            </Container>
        </div>
    )
}

export default Create
