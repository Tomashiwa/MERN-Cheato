import React, {useState, useContext, useRef, useEffect} from 'react'
import Stepper from 'react-stepper-horizontal'
import {useHistory} from "react-router-dom"
import UploadForm from "../components/UploadForm"
import ImagePreviewer from '../components/ImagePreviewer';
import {Container, Button} from 'reactstrap';
import UserContext from '../context/UserContext';
import axios from 'axios';
import uuid from "uuid";
import mongoose from "mongoose";

import "./css/Upload.css";

export const UPLOAD_STEP_FORM = 1;
export const UPLOAD_STEP_PREVIEW = 2;

function Upload() {
    const {userData} = useContext(UserContext);
    const [formStep, setFormStep] = useState(UPLOAD_STEP_FORM);
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

        const saveToDb = url => {
            const newCheatsheet = {
                file: url,
                user: userData.isLoaded && userData.token === undefined
                    ? mongoose.Types.ObjectId(-1)
                    : mongoose.Types.ObjectId(userData.user.id),
                name: form.name,
                school: mongoose.Types.ObjectId(form.school),
                module: mongoose.Types.ObjectId(form.module),
                description: form.description,
                datetime: Date.now(),
                rating: 0,
                comments: [],
                isPublic: form.isPublic,
                isAnonymous: userData.isLoaded && userData.token === undefined
            }

            axios.post("/api/cheatsheets/add", newCheatsheet)
                .then(sheet => {
                    setSheetId(sheet.data._id);
                })
                .catch(err => console.log(err));
        }
        

        const hasStepCompleted = () => {
            return true;
        }

        const endStep = () => {
            if(formStep === UPLOAD_STEP_FORM) {
                console.log("current step is FORM, will be uploading");
                upload();
            }
        }

        const nextStep = () => {
            console.log("NEXT STEP");
            const nextStep = formStep + 1 < 2
                ? formStep + 1
                : UPLOAD_STEP_PREVIEW;
            setFormStep(nextStep);
        }

        const next = e => {
            console.log("next clicked...");

            if(hasStepCompleted()) {
                console.log("current step completed, going to next step");
                endStep();
                nextStep();
            }
        };

        const nextBtn = document.querySelector("#upload-btn-next");
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
        if(formStep === UPLOAD_STEP_FORM) {
            if(!nextEnabled && blobRef !== null && form.name.length > 0 && form.school.length > 0 && form.module.length > 0) {
                setNextEnabled(true);
            } else if(nextEnabled && (blobRef === null || form.name.length === 0 || form.school.length === 0 || form.module.length === 0)) {
                setNextEnabled(false);
            }
        } else if (formStep === UPLOAD_STEP_PREVIEW) {
            setNextEnabled(false);
        }
    }, [form.module, form.name, form.school, form.url, formStep, nextEnabled]);
    
    // Attach view sheet event on Finish button
    useEffect(() => {
        const finishButton = document.querySelector("#upload-btn-finish");
        
        const viewSheet = () => {
            if(sheetId !== undefined) {
                history.push(`/view/${sheetId}`);
                window.location.reload();
            }
        }

        if(formStep === UPLOAD_STEP_PREVIEW) {    
            finishButton.addEventListener("click", viewSheet);
        }

        return () => {
            if(formStep === UPLOAD_STEP_PREVIEW) {
                finishButton.removeEventListener("click", viewSheet);
            }
        }
    }, [formStep, sheetId, history])


    return (
        <div>
            <Container id="upload-container">
                <Stepper
                    size={40}   
                    activeColor="#505050"
                    completeColor="#505050"
                    activeTitleColor="#FFF"
                    completeTitleColor="#FFF"
                    steps={[{title: "Upload"}, {title: "Preview"}]}
                    activeStep={formStep - 1}
                />

                <div id="upload-title-nav">
                    {
                        formStep === UPLOAD_STEP_FORM
                            ? <h2>Upload your cheatsheet</h2>
                        : formStep === UPLOAD_STEP_PREVIEW
                            ? <h2>Preview</h2>
                        : <div></div>
                    }
                    {
                        formStep === UPLOAD_STEP_PREVIEW
                            ? <Button id="upload-btn-finish" disabled={!(sheetId !== undefined)} outline color="light">
                                Finish
                            </Button>
                            : <Button id="upload-btn-next" disabled={!nextEnabled} outline color="light">
                                Next
                              </Button>
                    }
                </div>
                {
                    formStep === UPLOAD_STEP_FORM
                        ? <UploadForm form={form} setForm={setForm} setBlob={setBlob} isAnonymous={userData.isLoaded && userData.token === undefined}/>
                    : formStep === UPLOAD_STEP_PREVIEW
                        ? <ImagePreviewer imageURL={form.url} />
                    : <div></div>
                }
            </Container>
        </div>
    )
}

export default Upload
