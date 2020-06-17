import React, { useState, useContext } from 'react'
import {Form, FormGroup, Label, Input, FormFeedback, Button, Container} from "reactstrap"

import axios from "axios"

import UserContext from '../context/UserContext'
import "./css/Register.css"
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

export const NAME_MIN_LENGTH = 6;
export const PASSWORD_MIN_LENGTH = 8;

function Register() {
    const { userData, setUserData } = useContext(UserContext);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");

    const [fieldsInvalid, setFieldsInvalid] = useState({name: false, pass: false, check: false});
    const [invalidMsg, setInvalidMsg] = useState("");

    const changeName = e => setName(e.target.value);
    const changePass = e => setPassword(e.target.value);
    const changeConfirmPass = e => setPasswordCheck(e.target.value);

    const history = useHistory();

    const areInputsValid = () => {
        if(name.length === 0 || password.length === 0) {
            setInvalidMsg("Please provide both name and password");
            setFieldsInvalid({name: true, pass: true, check: true});
            return false;
        } 
        else if(name.length < NAME_MIN_LENGTH) {
            setInvalidMsg(`Username should have ${NAME_MIN_LENGTH} or more characters`);
            setFieldsInvalid({name: true, pass: false, check: false});
            return false;
        } else if(password.length < PASSWORD_MIN_LENGTH) {
            setInvalidMsg(`Password should have ${PASSWORD_MIN_LENGTH} or more characters`);
            setFieldsInvalid({name: false, pass: true, check: false});
            return false
        } else if(password !== passwordCheck) {
            setInvalidMsg("Password fields doesn't match with each other");
            setFieldsInvalid({name: false, pass: true, check: true});
            return false;
        } 

        return true;
    }

    const register = e => {
        e.preventDefault();

        if(areInputsValid()) {
            const newUser = {name, password, isAdmin: false};
    
            axios.post("/api/users/register", newUser)
                .then(registerRes => {
                    axios.post("/api/auth", {name, password})
                        .then(loginRes => {
                            setUserData({...userData, ...{token: loginRes.data.token, user: loginRes.data.user}});
                            localStorage.setItem("auth-token", loginRes.data.token);
                            history.push("/");
                        });
                })
                .catch(err => {
                    setInvalidMsg(err.response.data.msg);
                    setFieldsInvalid({name: true, pass: false, check: false});
                })
        }
    
    }

    const loginLink = <a href={"/login"}>Login here</a>

    return (
        <Container id="register-container">
            <Form id="register-form" onSubmit={register}>
                <h2>Register</h2>
                <FormGroup>
                    <Label>Name</Label>
                    <Input id="register-input-name" 
                        onChange={changeName}
                        invalid={fieldsInvalid.name ? true : false}/>
                    <FormFeedback invalid="true">{invalidMsg}</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label>Password</Label>
                    <Input id="register-input-pass" 
                        type="password"
                        onChange={changePass}
                        invalid={fieldsInvalid.pass ? true : false}/>
                    <FormFeedback invalid="true">{invalidMsg}</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label>Confirm password</Label>
                    <Input id="register-input-confirmPass"
                        type="password"
                        onInput={changeConfirmPass}
                        invalid={fieldsInvalid.check ? true : false}/>
                </FormGroup>
                <div>Already have an account? {loginLink}</div>
                <Button type="submit">Register</Button>
            </Form>
        </Container>
    )
}

export default Register
