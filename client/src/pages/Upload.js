import React, {Suspense, useState, useContext, useEffect} from 'react'
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Stepper from 'react-stepper-horizontal'
import axios from 'axios';
import uuid from "uuid";
import mongoose from "mongoose";
import Resizer from "react-image-file-resizer";

import Container from "reactstrap/lib/Container";
import Button from "reactstrap/lib/Button";

import UploadForm from "../components/UploadForm"
// import ImagePreviewer from '../components/ImagePreviewer';

import UserContext from '../context/UserContext';
import "./css/Upload.css";

const ImagePreviewer = React.lazy(() => import("../components/ImagePreviewer"));

export const UPLOAD_STEP_FORM = 1;
export const UPLOAD_STEP_PREVIEW = 2;
export const STEP_CIRCLE_SIZE = 40;

function Upload() {
    const {userData} = useContext(UserContext);
    const [formStep, setFormStep] = useState(UPLOAD_STEP_FORM);
    const [form, setForm] = useState({
        url: "",
        thumbnailUrl: "",
        name: "",
        school: "",
        module: "",
        description: "",
        isPublic: false
    });
    const [nextEnabled, setNextEnabled] = useState(false);
    const [sheetId, setSheetId] = useState(undefined);

    const [blob, setBlob] = useState(undefined);
    const [thumbnailBlob, setThumbnailBlob] = useState(undefined);

    const history = useHistory();

    const setUploadBlobs = blob => {
        setBlob(blob);
        console.log(`blob set`);

        console.log(`Resizing blob to 300x300 png`);
        Resizer.imageFileResizer(
            blob,
            300, 
            300,
            "PNG",
            100,
            0,
            newBlob => { 
                setThumbnailBlob(newBlob);
                console.log("resizing completed");
            },  
            "blob"
        );
    }

    // Navigation events that happened when Next button is pressed
    const upload = () => {
        const formData = new FormData();
        const thumbnailFormData = new FormData();
        const hashcode = uuid.v4();

        formData.append("file", blob, `${form.name}-${hashcode}.png`);
        thumbnailFormData.append("file", thumbnailBlob, `thumbnail-${form.name}-${hashcode}.png`);        

        axios.post("/upload", formData)
            .then(res => {
                // saveToDb(res.data.data.Location);
                setForm({...form, ...{url: res.data.data.Location}});
                console.log('res.data:', res.data);

                if(thumbnailBlob) {
                    console.log(`thumbnail blob found, saving it to S3`);

                    axios.post("/upload", thumbnailFormData)
                        .then(thumbnailRes => {
                            console.log('thumbnailRes.data:', thumbnailRes.data);

                            setForm({...form, ...{thumbnailUrl: thumbnailRes.data.data.Location}});
                            
                            const newSheet = {
                                file: res.data.data.Location,
                                thumbnail: thumbnailRes.data.data.Location,
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
                            };

                            console.log('newSheet:', newSheet);

                            axios.post("/api/cheatsheets/add", newSheet)
                                .then(sheet => {
                                    setSheetId(sheet.data._id);
                                })
                                .catch(err => console.log(err));
                            
                            console.log("RESIZED HAS BEEN SAVED TO S3");
                        })
                }
            })
            .catch(err => console.log(err));
    };

    const saveSheet = () => {
        if(formStep === UPLOAD_STEP_FORM) {
            upload();
        }
    }

    const openPreviewer = () => {
        const nextStep = formStep + 1 < 2
            ? formStep + 1
            : UPLOAD_STEP_PREVIEW;
        setFormStep(nextStep);
    }

    const finishForm = e => {
        saveSheet();
        openPreviewer();
    };

    // Verify if user can proceed to next step and toggle the Next button
    useEffect(() => {
        if(formStep === UPLOAD_STEP_FORM) {
            if(!nextEnabled && blob !== undefined && form.name.length > 0 && form.school.length > 0 && form.module.length > 0) {
                setNextEnabled(true);
            } else if(nextEnabled && (blob === undefined || form.name.length === 0 || form.school.length === 0 || form.module.length === 0)) {
                setNextEnabled(false);
            }
        } else if (formStep === UPLOAD_STEP_PREVIEW) {
            setNextEnabled(false);
        }
    }, [form.module, form.name, form.school, form.url, formStep, nextEnabled, blob]);
    
    // Direct to the sheet's view page
    const viewSheet = () => {
        if(sheetId !== undefined) {
            history.push(`/view/${sheetId}`);
            window.location.reload();
        }
    }

    return (
        <div>
            <Container id="upload-container">
                <Stepper
                    size={STEP_CIRCLE_SIZE}   
                    defaultColor="#555555"
                    activeColor="#ffdd66"
                    completeColor="#ccaa44"
                    activeTitleColor="#555555"
                    completeTitleColor="#555555"
                    defaultBarColor="#555555"
                    completeBarColor="#ccaa44"
                    circleFontColor="#555555"
                    steps={[{title: "Upload"}, {title: "Preview"}]}
                    activeStep={formStep - 1}
                />

                <div id="upload-title-nav">
                    <h2 id="upload-title-text">
                        {
                            formStep === UPLOAD_STEP_FORM
                                ? "Upload your cheatsheet"
                            : formStep === UPLOAD_STEP_PREVIEW
                                ? "Preview"
                            : ""
                        }
                    </h2>

                    {
                        formStep === UPLOAD_STEP_PREVIEW
                            ? <Button id="upload-btn-finish" disabled={!(sheetId !== undefined)} color="warning" onClick={viewSheet}>
                                Finish
                            </Button>
                            : <Button id="upload-btn-next" disabled={!nextEnabled} color="warning" onClick={finishForm}>
                                Next
                              </Button>
                    }
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    {
                        formStep === UPLOAD_STEP_FORM
                            ? <UploadForm form={form} setForm={setForm} setBlob={setUploadBlobs} isAnonymous={userData.isLoaded && userData.token === undefined}/>
                        : formStep === UPLOAD_STEP_PREVIEW
                            ? <ImagePreviewer imageURL={form.url} />
                        : <div></div>
                    }
                </Suspense>
            </Container>
        </div>
    )
}

export default Upload
