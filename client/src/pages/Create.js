import React, { useState, useEffect, useRef, useContext, Suspense } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import uuid from "uuid";
import Stepper from 'react-stepper-horizontal';
import Resizer from "react-image-file-resizer";

import Container from "reactstrap/lib/Container";
import Button from "reactstrap/lib/Button";
import Spinner from 'reactstrap/lib/Spinner';
import Progress from 'reactstrap/lib/Progress';

import ImageCanvas from "../components/ImageCanvas";
import {CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT} from "../components/ImageCanvas"

import UserContext from '../context/UserContext';
import "./css/Create.css"

const CreateForm = React.lazy(() => import("../components/CreateForm"));
const ImagePreviewer = React.lazy(() => import("../components/ImagePreviewer"));

export const CREATE_STEP_IMPORT = 1;
export const CREATE_STEP_FORM = 2;
export const CREATE_STEP_PREVIEW = 3;
export const STEP_CIRCLE_SIZE = 40;

export const URL_S3 = "https://cheato.s3.amazonaws.com/";
export const URL_CLOUDFRONT = "https://d2conugba1evp1.cloudfront.net/";

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
        thumbnailUrl: "",
        name: "",
        school: "",
        module: "",
        description: "",
        isPublic: false
    });
    const [nextEnabled, setNextEnabled] = useState(false);

    const [sheetId, setSheetId] = useState(undefined);
    
    const [hasCreated, setHasCreated] = useState(false);
    const [percentage, setPercentage] = useState("0");
    const [msg, setMsg] = useState("");
    
    const blobRef = useRef(null);
    const thumbnailBlobRef = useRef(null);

    const history = useHistory();

    const setBlob = blob => {
        blobRef.current = blob
        console.log(`blob set`);

        console.log("resizing blob to 300x300 png");
        Resizer.imageFileResizer(
            blob, //is the file of the new image that can now be uploaded...
            300, // is the maxWidth of the  new image
            300, // is the maxHeight of the  new image
            "PNG", // is the compressFormat of the  new image
            100, // is the quality of the new image
            0, // is the degree of clockwise rotation to apply to the image. 
            blob => { 
                thumbnailBlobRef.current = blob
                console.log("resizing completed");
            },  // is the callBack function of the new image URI
            "blob"  // is the output type of the new image
        );
    };
    
    const upload = () => {
        const formData = new FormData();
        const thumbnailFormData = new FormData();
        const hashcode = uuid.v4();
        
        formData.append("file", blobRef.current, `${form.name}-${hashcode}.png`);
        thumbnailFormData.append("file", thumbnailBlobRef.current, `thumbnail-${form.name}-${hashcode}.png`);
        
        const config = {
            onUploadProgress: progressEvent => {
                let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Creating... ${percentCompleted}%`);
                setPercentage(percentCompleted);
            }
        }

        Promise.all([import("axios"), import("mongoose")])
            .then(([axios, mongoose]) => {
                setMsg("Creating...");
                axios.post("/upload", formData, config)
                    .then(res => {
                        const sheetUrl = res.data.url.replace(URL_S3, URL_CLOUDFRONT);
                        setMsg("Cleaning up...");

                        if(thumbnailBlobRef.current) {                            
                            axios.post("/upload", thumbnailFormData, config)
                                .then(thumbnailRes => {
                                    const thumbnailUrl = thumbnailRes.data.url.replace(URL_S3, URL_CLOUDFRONT);

                                    setForm({...form, ...{
                                        url: sheetUrl,
                                        thumbnailUrl: thumbnailUrl
                                    }});

                                    const newCheatsheet = {
                                        file: sheetUrl,
                                        thumbnail: thumbnailUrl, 
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
                                
                                    console.log("Submitting cheatsheet", newCheatsheet);
                                
                                    axios.post("/api/cheatsheets/add", newCheatsheet, config)
                                        .then(sheet => {
                                            setSheetId(sheet.data._id);
                                            setHasCreated(true);
                                            setMsg("");
                                        })
                                        .catch(err => console.log(err));
                                    
                                        console.log("RESIZED HAS BEEN SAVED TO S3");
                                })
                                .catch(err => console.log("RESIZED SAVING FAILED WITH ERROR", err));
                        }
                    });
            });
    };

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
        endStep();
        nextStep();
    };

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

    const viewSheet = () => {
        if(sheetId !== undefined) {
            history.push(`/view/${sheetId}`);
            window.location.reload(); 
        }
    }

    return (    
        <div>
            <Container id="create-container">
                <ImagesContext.Provider value={{images, setImages}}>
                    <ConfigContext.Provider value={{config, setConfig}}>
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
                            steps={[{title: "Create"}, {title: "Details"}, {title: "Preview"}]}
                            activeStep={formStep - 1}
                        />
                        <div id="create-title-nav">
                            <h2 id="create-title-text">
                                {
                                    formStep === CREATE_STEP_IMPORT
                                        ? "Import your cheatsheets"
                                    : formStep === CREATE_STEP_FORM
                                        ? "Fill in details"
                                    : formStep === CREATE_STEP_PREVIEW
                                        ? "Preview"
                                    : ""
                                }
                            </h2>
                            {
                                formStep === CREATE_STEP_PREVIEW
                                    ?   <Button id="create-btn-finish" disabled={!(sheetId !== undefined)} color="warning" onClick={viewSheet}>
                                            Finish
                                        </Button>
                                    :   <Button id="create-btn-next" disabled={!nextEnabled} color="warning" onClick={next}>
                                            Next
                                        </Button>
                            }
                        </div>

                        <Suspense fallback={<div className="center-screen stretch-height"><Spinner color="warning"/></div>}>
                            {
                                formStep === CREATE_STEP_IMPORT
                                    ? <ImageCanvas form={form} setBlob={setBlob} />
                                : formStep === CREATE_STEP_FORM
                                    ? <CreateForm form={form} setForm={setForm} isAnonymous={userData.isLoaded && userData.token === undefined}/>
                                : formStep === CREATE_STEP_PREVIEW && !hasCreated
                                    ? <div>
                                        <Progress animated bar color="warning" value={percentage}/>
                                        <h4 id="create-progress-msg">{msg}</h4>
                                    </div>
                                : formStep === CREATE_STEP_PREVIEW && hasCreated
                                    ? <ImagePreviewer imageURL={form.url} />
                                : <div></div>
                            }
                        </Suspense>
                    </ConfigContext.Provider>
                </ImagesContext.Provider>
            </Container>
        </div>
    )
}

export default Create
