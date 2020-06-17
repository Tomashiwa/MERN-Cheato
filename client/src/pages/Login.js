import React, {useState, useContext} from 'react'
import { useHistory } from 'react-router-dom'
import {Form, FormGroup, Label, Input, FormFeedback, Button, Container} from "reactstrap"

import axios from "axios"

import UserContext from '../context/UserContext'

import "./css/Login.css"

function Login() {
    const { userData, setUserData } = useContext(UserContext);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const [fieldsInvalid, setFieldsInvalid] = useState({name: false, pass: false});
    const [invalidMsg, setInvalidMsg] = useState("");

    const changeName = e => setName(e.target.value);
    const changePass = e => setPassword(e.target.value);

    const history = useHistory();

    const login = e => {
        e.preventDefault();

        const user = {name, password};

        axios.post("/api/auth", user)
            .then(loginRes => {
                setUserData({...userData, ...{token: loginRes.data.token, user: loginRes.data.user}})
                localStorage.setItem("auth-token", loginRes.data.token);
                history.push("/");
            })
            .catch(err => {
                setInvalidMsg(err.response.data.msg);
                setFieldsInvalid({name: true, pass: true});
            })
    }

    const registerLink = <a href={"/register"}>Register here</a>

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
                        invalid={fieldsInvalid.name ? true : false}/>
                    <FormFeedback invalid="true">{invalidMsg}.</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label>Password</Label>
                    <Input id="login-input-pass" 
                        type="password"
                        onChange={changePass}
                        invalid={fieldsInvalid.pass ? true : false}/>
                </FormGroup>
                <div>Don't have an account? {registerLink}</div>
                <Button type="submit">Login</Button>
            </Form>
            
        </Container>
    )
}

export default Login
