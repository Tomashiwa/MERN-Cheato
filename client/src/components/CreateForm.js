import React from 'react'
import {Form, FormGroup, Label, Input, FormText} from "reactstrap";

import "./css/CreateForm.css"

function CreateForm() {
    return (
        <Form id="form-create">
            <FormGroup>
                <Label>Name</Label>
                <Input />
                <FormText>Enter the name of your cheatsheet.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Institution</Label>
                <Input />
                <FormText>Institution that your cheatsheet is for.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Module</Label>
                <Input />
                <FormText>Module that your cheatsheet is for.</FormText>
            </FormGroup>
            <FormGroup>
                <Label>Description</Label>
                <Input type="textarea"/>
                <FormText>Information that may help readers understand your cheatsheet.</FormText>
            </FormGroup>
            <FormGroup check>
                <Label check>
                    <Input type="checkbox"/> Share with public
                </Label>
            </FormGroup>
        </Form>
    )
}

export default CreateForm
