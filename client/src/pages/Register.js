import React, { useState, useContext } from 'react'
import {Form, FormGroup, Label, Input, FormFeedback, Button, Container} from "reactstrap"

import axios from "axios"

import UserContext from '../context/UserContext'
import "./css/Register.css"
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

function Register() {
    const { setUserData } = useContext(UserContext);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");

    const [nameState, setNameState] = useState({valid: false, invalid: false});
    const [passState, setPassState] = useState({valid: false, invalid: false});
    const [checkState, setCheckState] = useState({valid: false, invalid: false});
    
    const changeName = e => setName(e.target.value);
    const changePass = e => setPassword(e.target.value);
    const changeConfirmPass = e => setPasswordCheck(e.target.value);

    const history = useHistory();

    const register = e => {
        e.preventDefault();
         
        const newUser = {name, password, isAdmin: false};

        axios.post("/api/users/register", newUser)
            .then(registerRes => {
                axios.post("/api/auth", {name, password})
                    .then(loginRes => {
                        setUserData({
                            token: loginRes.data.token,
                            user: loginRes.data.user
                        });
                        localStorage.setItem("auth-token", loginRes.data.token);
                        history.push("/");
                    });
            });
    }

    return (
        <Container id="register-container">
            <Form id="register-form" onSubmit={register}>
                <FormGroup>
                    <h2>Register</h2>
                </FormGroup>
                <FormGroup>
                    <Label>Name</Label>
                    <Input id="register-input-name" 
                        onChange={changeName}
                        valid={nameState.valid ? true : false} 
                        invalid={nameState.invalid ? true : false}/>
                    <FormFeedback invalid="true">Name already exists.</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label>Password</Label>
                    <Input id="register-input-pass" 
                        type="password"
                        onChange={changePass}
                        valid={passState.valid ? true : false} 
                        invalid={passState.invalid ? true : false}/>
                    <FormFeedback invalid="true">Password is not secure enough</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label>Confirm password</Label>
                    <Input id="register-input-confirmPass"
                        type="password"
                        onInput={changeConfirmPass}
                        valid={checkState.valid ? true : false} 
                        invalid={checkState.invalid ? true : false}/>
                    <FormFeedback invalid="true">Doesn't match with the above password</FormFeedback>
                </FormGroup>
                <Button type="submit">Register</Button>
            </Form>
        </Container>
    )
}

export default Register
