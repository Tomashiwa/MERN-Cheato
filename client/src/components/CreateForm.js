import React, { useEffect, useState } from 'react'
import { Form, FormGroup, Label, Input, FormFeedback, FormText } from "reactstrap";
import CreatableSelect from "react-select/creatable";

import "./css/CreateForm.css"

import axios from "axios";
import { invalidSymbols } from "../misc/InvalidSymbols.js";
import Col from 'reactstrap/lib/Col';

function CreateForm({form, setForm, isAnonymous}) {
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

    useEffect(() => {
        setSchoolOptions(schools.map(school => {return {label: school.name, value: school._id}}));
        setModuleOptions(modules
            .filter(module => module.school && schState.selected && module.school === schState.selected.value)
            .map(module => {return {label: `${module.code} - ${module.name}`, value: module._id}}));
    }, [schools, modules, schState.selected])

    // Load previous entires if avaliable
    useEffect(() => {
        const nameInput = document.querySelector("#createform-input-name");
        const descInput = document.querySelector("#createform-input-desc");
        const isPublicInput = document.querySelector("#createform-input-public");

        nameInput.value = form.name;
        descInput.value = form.description;

        if(!isAnonymous) {
            isPublicInput.checked = form.isPublic;
        }
    }, [form, isAnonymous]);

    // Verify the name and save it to the form
    const checkName = (e) => {
        const isValid = e.target.value.length && !hasInvalidSymbols(e.target.value);
        const isInvalid = e.target.value.length && hasInvalidSymbols(e.target.value);

        if(nameState.valid !== isValid || nameState.invalid !== isInvalid) {
            setNameState({valid: isValid, invalid: isInvalid});
        }
    }

    const saveName = e => setForm({...form, ...{name: e.target.value}});

    // Saving the description to the form
    const saveDesc = e => setForm({...form, ...{description: e.target.value}});

    // Saving the isPublic to the form
    const saveIsPublic = e => {
        console.log(`set isPublic to ${e.target.checked}`);
        setForm({...form, ...{isPublic: e.target.checked}});
    }
    useEffect(() => {
        const isPublicInput = document.querySelector("#createform-input-public");
        if(isAnonymous && !form.isPublic) {
            isPublicInput.setAttribute("checked", isAnonymous);
            isPublicInput.setAttribute("disabled", isAnonymous);
            setForm({...form, ...{isPublic: true}});
        }
    }, [form, setForm, isAnonymous]);

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
        <Form id="form-create">
            <FormGroup row>
                <Label sm={2}>Name</Label>
                <Col sm={10}>
                    <Input id="createform-input-name" 
                        onInput={checkName}
                        onChange={saveName}
                        valid={nameState.valid ? true : false} 
                        invalid={nameState.invalid ? true : false}/>
                    <FormFeedback invalid="true">Name cannot contains an invalid symbol.</FormFeedback>
                    <FormText>Enter the name of your cheatsheet.</FormText>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label sm={2}>School</Label>
                <Col sm={10}>
                    <CreatableSelect 
                        isClearable
                        isDisabled={schState.isDisabled}
                        isLoading={schState.isLoading}
                        onChange={saveSchool}
                        onCreateOption={addSchool}
                        options={schoolOptions}
                        value={schState.selected}
                    />
                    <FormText>Select a school that your cheatshet is for. If none is found, you may enter your school name to create it.</FormText>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label sm={2}>Module</Label>
                <Col sm={10}>
                    <CreatableSelect
                        isClearable
                        isDisabled={modState.isDisabled || schState.selected === null}
                        isLoading={modState.isLoading}
                        onChange={saveModule}
                        onCreateOption={addModule}
                        options={moduleOptions}
                        value={modState.selected}
                    />
                    <FormText>Select a module that your cheatshet is for. If none was found, you may enter your module name to create it.</FormText>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label sm={2}>Description</Label>
                <Col sm={10}>
                    <Input id="createform-input-desc" type="textarea" onChange={saveDesc}/>
                    <FormText>Information that may help others understand your cheatsheet.</FormText>
                </Col>
            </FormGroup>
            <FormGroup row check>
                <Label sm={10} check>
                    <Input id="createform-input-public" type="checkbox" onChange={!isAnonymous ? saveIsPublic : ()=>{}}/> Share with public
                </Label>
            </FormGroup>
        </Form>
    )
}

export default CreateForm
