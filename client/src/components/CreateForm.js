import React, { useEffect } from 'react'
import {Form, FormGroup, Label, Input, FormText} from "reactstrap";

import "./css/CreateForm.css"

function CreateForm({form, setForm}) {
    //Load previous entires if avaliable
    useEffect(() => {
        const nameInput = document.querySelector("#createform-input-name");
        const instInput = document.querySelector("#createform-input-insti");
        const modInput = document.querySelector("#createform-input-mod");
        const descInput = document.querySelector("#createform-input-desc");
        const isPublicInput = document.querySelector("#createform-input-public");

        nameInput.value = form.name;
        instInput.value = form.institution;
        modInput.value = form.module;
        descInput.value = form.description;
        isPublicInput.checked = form.isPublic;
    }, [form]);

    //Save given details
    useEffect(() => {
        const nameInput = document.querySelector("#createform-input-name");
        const instInput = document.querySelector("#createform-input-insti");
        const modInput = document.querySelector("#createform-input-mod");
        const descInput = document.querySelector("#createform-input-desc");
        const isPublicInput = document.querySelector("#createform-input-public");

        const changeName = e => setForm({...form, ...{name: e.target.value}});
        const changeInsti = e => setForm({...form, ...{institution: e.target.value}});
        const changeMod = e => setForm({...form, ...{module: e.target.value}});
        const changeDesc = e => setForm({...form, ...{description: e.target.value}});
        const changeIsPublic = e => setForm({...form, ...{isPublic: e.target.checked}});

        nameInput.addEventListener("change", changeName);
        instInput.addEventListener("change", changeInsti);
        modInput.addEventListener("change", changeMod);
        descInput.addEventListener("change", changeDesc);
        isPublicInput.addEventListener("change", changeIsPublic);

        return () => {
            nameInput.removeEventListener("change", changeName);
            instInput.removeEventListener("change", changeInsti);
            modInput.removeEventListener("change", changeMod);
            descInput.removeEventListener("change", changeDesc);
            isPublicInput.removeEventListener("change", changeIsPublic);
        }
    }, [form, setForm])

    return (
        <Form id="form-create">
            <FormGroup>
                <Label>Name</Label>
                <Input id="createform-input-name"/>
                <FormText>Enter the name of your cheatsheet.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Institution</Label>
                <Input id="createform-input-insti"/>
                <FormText>Institution that your cheatsheet is for.</FormText>
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
