import React, { useEffect, useState, useRef } from 'react'
import {Form, FormGroup, Label, Input, FormFeedback, FormText, Button} from "reactstrap";

import "./css/CreateForm.css"

import axios from "axios";
import { invalidSymbols } from "../misc/InvalidSymbols.js";

function CreateForm({form, setForm}) {
    const [testBool, setTestBool] = useState(false);

    const schoolsRef = useRef([]);
    const modulesRef = useRef([]);

    const [nameState, setNameState] = useState({valid: false, invalid: false});

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

    // Fetching schools and modules from server
    useEffect(() => {
        const fetchSchs = () => {
            axios.get("/api/schools")
                .then(res => {
                    schoolsRef.current = res.data;

                    console.log("Schools loaded: ");
                    console.log(schoolsRef.current);
                })
                .catch(err => {
                    console.log(`Fail to fetch Schools: ${err}`);
                });
        }

        const fetchMods = () => {
            axios.get("/api/modules")
                .then(res => {
                    modulesRef.current = res.data;

                    console.log("Modules loaded: ");
                    console.log(modulesRef.current);
                })
                .catch(err => {
                    console.log(`Fail to fetch modules: ${err}`);
                });
        }

        fetchSchs();
        fetchMods();
    }, []);

    //Load previous entires if avaliable
    useEffect(() => {
        const nameInput = document.querySelector("#createform-input-name");
        const schInput = document.querySelector("#createform-input-sch");
        const modInput = document.querySelector("#createform-input-mod");
        const descInput = document.querySelector("#createform-input-desc");
        const isPublicInput = document.querySelector("#createform-input-public");

        nameInput.value = form.name;
        schInput.value = form.school;
        modInput.value = form.module;
        descInput.value = form.description;
        isPublicInput.checked = form.isPublic;
    }, [form]);

    //Save given details
    useEffect(() => {
        const nameInput = document.querySelector("#createform-input-name");
        const schInput = document.querySelector("#createform-input-sch");
        const modInput = document.querySelector("#createform-input-mod");
        const descInput = document.querySelector("#createform-input-desc");
        const isPublicInput = document.querySelector("#createform-input-public");

        const checkName = e => {
            const isValid = e.target.value.length && !hasInvalidSymbols(e.target.value);
            const isInvalid = e.target.value.length && hasInvalidSymbols(e.target.value);

            if(nameState.valid !== isValid || nameState.invalid !== isInvalid) {
                setNameState({valid: isValid, invalid: isInvalid});
            }
        }
        const changeName = e => setForm({...form, ...{name: e.target.value}});

        const checkSch = e => {
            // Search through the fetched schools and check if the value matches any of those

            // Create context menu that help to autocomplete with another button to add a new school
        }
        const changeSch = e => setForm({...form, ...{school: e.target.value}});
        
        const checkMod = e => {
            // Search through the fetched modules and check if the value matches any of those

            // Create context menu that help to autocomplete with another button to add a new module
        }
        const changeMod = e => setForm({...form, ...{module: e.target.value}});

        const changeDesc = e => setForm({...form, ...{description: e.target.value}});
        const changeIsPublic = e => setForm({...form, ...{isPublic: e.target.checked}});

        nameInput.addEventListener("input", checkName);
        nameInput.addEventListener("change", changeName);

        schInput.addEventListener("change", changeSch);
        modInput.addEventListener("change", changeMod);
        descInput.addEventListener("change", changeDesc);
        isPublicInput.addEventListener("change", changeIsPublic);

        return () => {
            nameInput.removeEventListener("input", checkName);
            nameInput.removeEventListener("change", changeName);
            
            schInput.removeEventListener("change", changeSch);
            modInput.removeEventListener("change", changeMod);
            descInput.removeEventListener("change", changeDesc);
            isPublicInput.removeEventListener("change", changeIsPublic);
        }
    }, [form, setForm, nameState]);

    return (
        <Form id="form-create">
            <Button onClick={() => setTestBool(!testBool)}>Test bool</Button>
            <FormGroup>
                <Label>Name</Label>
                <Input id="createform-input-name" valid={nameState.valid} invalid={nameState.invalid}/>
                <FormFeedback invalid>Name cannot contains an invalid symbol.</FormFeedback>
                <FormText>Enter the name of your cheatsheet.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>School</Label>
                <Input id="createform-input-sch"/>
                <FormText>School that your cheatsheet is for.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Module</Label>
                <Input id="createform-input-mod"/>
                <FormText>Module that your cheatsheet is for.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Description</Label>
                <Input id="createform-input-desc" type="textarea"/>
                <FormText>Information that may help readers understand your cheatsheet.</FormText>
            </FormGroup>
            <FormGroup check>
                <Label check>
                    <Input id="createform-input-public" type="checkbox"/> Share with public
                </Label>
            </FormGroup>
        </Form>
    )
}

export default CreateForm
