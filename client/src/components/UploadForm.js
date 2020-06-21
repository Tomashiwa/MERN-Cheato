import React, { useState, useEffect } from 'react'
import { invalidSymbols } from "../misc/InvalidSymbols.js";
import axios from 'axios';
import { Form, FormGroup, Label, Input, FormFeedback, FormText } from "reactstrap";
import CreatableSelect from "react-select/creatable";
import "./css/UploadForm.css"

function UploadForm({form, setForm, setBlob, isAnonymous}) {
    const [schools, setSchools] = useState([]);
    const [modules, setModules] = useState([]);

    const [schoolOptions, setSchoolOptions] = useState([]);
    const [moduleOptions, setModuleOptions] = useState([]);

    const [nameState, setNameState] = useState({valid: false, invalid: false});
    const [schState, setSchState] = useState({isLoading: false, isDisabled: false, selected: null});
    const [modState, setModState] = useState({isLoading: false, isDisabled: false, selected: null});

    const hasInvalidSymbols = str => {
        let isInvalid = false;
        for(let symbol of invalidSymbols) {
            if(str.includes(symbol)) {
                isInvalid = true;
                break;
            }
        }
        return isInvalid;
    }

    const fetchSchs = callback => {
        axios.get("/api/schools")
            .then(res => {
                setSchools(res.data);
                callback();
            })
            .catch(err => {
                console.log(`Fail to fetch Schools: ${err}`);
            });
    }

    const fetchMods = callback => {
        axios.get("/api/modules")
            .then(res => {
                setModules(res.data);
                callback();
            })
            .catch(err => {
                console.log(`Fail to fetch modules: ${err}`);
            });
    }

    // Fetching schools and modules from server
    useEffect(() => {
        fetchSchs();
        fetchMods();
    }, []);

    // Create options based on fetched schools and modules
    useEffect(() => {
        setSchoolOptions(schools.map(school => {return {label: school.name, value: school._id}}));
        setModuleOptions(modules
            .filter(module => module.school && schState.selected && module.school === schState.selected.value)
            .map(module => {return {label: `${module.code} - ${module.name}`, value: module._id}}));
    }, [schools, modules, schState.selected])

    // Verify the name and save it to the form
    useEffect(() => {
        const nameInput = document.querySelector("#uploadform-input-name");

        const checkName = e => {
            const isValid = e.target.value.length && !hasInvalidSymbols(e.target.value);
            const isInvalid = e.target.value.length && hasInvalidSymbols(e.target.value);

            if(nameState.valid !== isValid || nameState.invalid !== isInvalid) {
                setNameState({valid: isValid, invalid: isInvalid});
            }
        }

        const changeName = e => setForm({...form, ...{name: e.target.value}});

        nameInput.addEventListener("input", checkName);
        nameInput.addEventListener("change", changeName);

        return () => {
            nameInput.removeEventListener("input", checkName);
            nameInput.removeEventListener("change", changeName);
        };
    }, [form, nameState, setForm])

    // Saving the description to the form
    useEffect(() => {
        const descInput = document.querySelector("#uploadform-input-desc");
        const changeDesc = e => setForm({...form, ...{description: e.target.value}});
        
        descInput.addEventListener("change", changeDesc);

        return () => descInput.removeEventListener("change", changeDesc);
    }, [form, setForm, nameState]);

    // Saving the isPublic to the form
    useEffect(() => {
        const isPublicInput = document.querySelector("#uploadform-input-public");
        if(!isAnonymous) {
            const changeIsPublic = e => setForm({...form, ...{isPublic: e.target.checked}});
    
            isPublicInput.addEventListener("change", changeIsPublic);
            return () => isPublicInput.removeEventListener("change", changeIsPublic);
        } else if(isAnonymous && !form.isPublic) {
            isPublicInput.setAttribute("checked", isAnonymous);
            isPublicInput.setAttribute("disabled", isAnonymous);
            setForm({...form, ...{isPublic: true}});
        }

    }, [form, setForm, isAnonymous]);

    // Save image input as blob
    useEffect(() => {
        const fileInput = document.querySelector("#uploadform-input-file");
        
        const loadFile = e => {
            const file = e.target.files[0];
            setBlob(file);
        }

        fileInput.addEventListener("change", loadFile);
        return () => fileInput.removeEventListener("change", loadFile)
    }, [setBlob])

    // Save a selected school to the form
    const saveSchool = option => {
        if(option) {
            setSchState({...schState, ...{selected: {label: option.label, value: option.value}}});
            setModState({...modState, ...{selected: null}})
            setForm({...form, ...{school: option.value}})
        }
    }

    // Save a selected module to the form
    const saveModule = option => {
        if(option) {
            setModState({...modState, ...{selected: {label: option.label, value: option.value}}});
            setForm({...form, ...{module: option.value}});
        }
    }

    // Add new school to the backend
    const addSchool = value => {
        const newSchool = {name: value}

        setSchState({...schState, ...{isDisabled: true, isLoading: true}});

        axios.post("/api/schools", newSchool)
            .then(res => {
                fetchSchs(() => {
                    setSchState({isDisabled: false, isLoading: false, selected: {label: value, value: value}});
                    setForm({...form, ...{school: value}})
                });
            })
            .catch(err => console.log(`Fail to add school: ${err}`));
    }

    // Add new module to the backend
    const addModule = value => {
        const newModule = {school: schState.selected.value, code: value, name: value}

        setModState({...modState, ...{isDisabled: true, isLoading: true}});

        axios.post("/api/modules", newModule)
            .then(res => {
                fetchMods(() => {
                    setModState({isDisabled: false, isLoading: false, selected: {label: value, value: value}});
                    setForm({...form, ...{module: value}})
                });
            })
            .catch(err => console.log(`Fail to add mod: ${err}`));
    }

    return (
        <Form id="form-upload">
            <FormGroup>
                <Label>File</Label>
                <Input id="uploadform-input-file" type="file" accept="image/*"/>
                <FormText>Choose an image file to be uploaded.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Name</Label>
                <Input id="uploadform-input-name" 
                    valid={nameState.valid ? true : false} 
                    invalid={nameState.invalid ? true : false}/>
                <FormFeedback invalid="true">Name cannot contains an invalid symbol.</FormFeedback>
                <FormText>Enter the name of your cheatsheet.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>School</Label>
                <CreatableSelect 
                    isClearable
                    isDisabled={schState.isDisabled}
                    isLoading={schState.isLoading}
                    onChange={saveSchool}
                    onCreateOption={addSchool}
                    options={schoolOptions}
                    value={schState.selected}
                />
                <FormText>School that your cheatsheet is for.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Module</Label>
                <CreatableSelect
                    isClearable
                    isDisabled={modState.isDisabled || schState.selected === null}
                    isLoading={modState.isLoading}
                    onChange={saveModule}
                    onCreateOption={addModule}
                    options={moduleOptions}
                    value={modState.selected}
                />
                <FormText>Module that your cheatsheet is for.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Description</Label>
                <Input id="uploadform-input-desc" type="textarea"/>
                <FormText>Information that may help readers understand your cheatsheet.</FormText>
            </FormGroup>
            <FormGroup check>
                <Label check>
                    <Input id="uploadform-input-public" type="checkbox"/> Share with public
                </Label>
            </FormGroup>

        </Form>
    )
}

export default UploadForm
