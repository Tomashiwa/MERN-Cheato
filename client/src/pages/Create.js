import React, { useState, useEffect, useRef, useContext } from 'react'

import ImageCanvas from "../components/ImageCanvas";
import CreateForm from '../components/CreateForm';
import ImagePreviewer from '../components/ImagePreviewer';

import {Container, Button} from 'reactstrap';
import {useHistory} from "react-router-dom"
import "./css/Create.css"

import axios from 'axios';
import uuid from "uuid";
import mongoose from "mongoose";
import Stepper from 'react-stepper-horizontal';

import {CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT} from "../components/ImageCanvas"
import UserContext from '../context/UserContext';

export const CREATE_STEP_IMPORT = 1;
export const CREATE_STEP_FORM = 2;
export const CREATE_STEP_PREVIEW = 3;

export const ImagesContext = React.createContext(null);
export const ConfigContext = React.createContext(null);

function Create() {
    const {userData} = useContext(UserContext);

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

    const [sheetId, setSheetId] = useState(undefined);
    
    const blobRef = useRef(null);
    const history = useHistory();

    const setBlob = blob => blobRef.current = blob;

    // Navigation events that happened when Next button is pressed
    useEffect(() => {
        const saveToDb = url => {
            const newCheatsheet = {
                file: url,
                user: mongoose.Types.ObjectId(userData.user.id),
                name: form.name,
                school: mongoose.Types.ObjectId(form.school),
                module: mongoose.Types.ObjectId(form.module),
                description: form.description,
                datetime: Date.now(),
                rating: 0,
                comments: [],
                isPublic: form.isPublic
            }

            axios.post("/api/cheatsheets/add", newCheatsheet)
                .then(sheet => {
                    setSheetId(sheet.data._id);
                })
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
    }, [formStep, form, userData])

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

    useEffect(() => {
        const finishButton = document.querySelector("#create-btn-finish");
        
        const viewSheet = () => {
            if(sheetId !== undefined) {
                history.push(`/view/${sheetId}`);
                window.location.reload(); 
            }
        }

        if(formStep === CREATE_STEP_PREVIEW) {    
            finishButton.addEventListener("click", viewSheet);
        }

        return () => {
            if(formStep === CREATE_STEP_PREVIEW) {
                finishButton.removeEventListener("click", viewSheet);
            }
        }
    }, [formStep, sheetId, history])


    return (    
        <div>
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
                        <div id="create-title-nav">
                            {
                                formStep === CREATE_STEP_IMPORT
                                    ? <h2>Import your cheatsheets</h2>
                                : formStep === CREATE_STEP_FORM
                                    ? <h2>Fill in details</h2>
                                : formStep === CREATE_STEP_PREVIEW
                                    ? <h2>Preview</h2>
                                : <div></div>
                            }
                            {
                                formStep === CREATE_STEP_PREVIEW
                                    ? <Button id="create-btn-finish" disabled={!(sheetId !== undefined)} outline color="light">
                                        Finish
                                    </Button>
                                    : <Button id="create-btn-next" disabled={!nextEnabled} outline color="light">
                                        Next
                                      </Button>
                            }
                        </div>
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
