import React, {useState, useContext} from 'react'
import { useHistory } from 'react-router-dom'
import {Form, FormGroup, Label, Input, FormFeedback, Button, Container} from "reactstrap"

import axios from "axios"

import UserContext from '../context/UserContext'

import "./css/Login.css"

function Login() {
    const { setUserData } = useContext(UserContext);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const [nameState, setNameState] = useState({valid: false, invalid: false});
    const [passState, setPassState] = useState({valid: false, invalid: false});

    const changeName = e => setName(e.target.value);
    const changePass = e => setPassword(e.target.value);

    const history = useHistory();

    const login = e => {
        e.preventDefault();

        const user = {name, password};

        axios.post("/api/auth", user)
            .then(loginRes => {
                setUserData({
                    token: loginRes.data.token,
                    user: loginRes.data.user
                })
                localStorage.setItem("auth-token", loginRes.data.token);
                history.push("/");
            })
    }

    return (
        <Container id="login-container">
            <Form id="login-form" onSubmit={login}>
                <FormGroup>
                    <h2>Login</h2>
                </FormGroup>
                <FormGroup>
                    <Label>Name</Label>
                    <Input id="login-input-name" 
                        onChange={changeName}
                        valid={nameState.valid ? true : false} 
                        invalid={nameState.invalid ? true : false}/>
                    <FormFeedback invalid="true">Name already exists.</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label>Password</Label>
                    <Input id="login-input-pass" 
                        type="password"
                        onChange={changePass}
                        valid={passState.valid ? true : false} 
                        invalid={passState.invalid ? true : false}/>
                    <FormFeedback invalid="true">Password is not secure enough</FormFeedback>
                </FormGroup>
                <Button type="submit">Login</Button>
            </Form>
            
        </Container>
    )
}

export default Login
