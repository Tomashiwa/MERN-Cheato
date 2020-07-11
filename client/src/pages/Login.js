import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";

import Form from "reactstrap/lib/Form";
import FormGroup from "reactstrap/lib/FormGroup";
import Label from "reactstrap/lib/Label";
import Input from "reactstrap/lib/Input";
import FormFeedback from "reactstrap/lib/FormFeedback";
import Button from "reactstrap/lib/Button";
import Container from "reactstrap/lib/Container";

import UserContext from "../context/UserContext";

import "./css/Login.css";

function Login() {
	const { userData, setUserData } = useContext(UserContext);

	const [fieldsInvalid, setFieldsInvalid] = useState({ name: false, pass: false });
	const [invalidMsg, setInvalidMsg] = useState("");

	const history = useHistory();

	const login = async (e) => {
		e.preventDefault();

		const user = {
			name: document.querySelector("#login-input-name").value,
			password: document.querySelector("#login-input-pass").value,
		};

		return axios
			.post("/api/auth", user)
			.then((loginRes) => {
				setUserData({
					...userData,
					...{ token: loginRes.data.token, user: loginRes.data.user },
				});
				localStorage.setItem("auth-token", loginRes.data.token);
				history.push("/");
			})
			.catch((err) => {
				setInvalidMsg(err.response.data.msg);
				setFieldsInvalid({ name: true, pass: true });
			});
	};

	const registerLink = <a href={"/register"}>Register here</a>;

	return (
		<Container id="login-container">
			<Form id="login-form" onSubmit={login}>
				<h2>Login</h2>

				<FormGroup>
					<Label>Name</Label>
					<Input id="login-input-name" invalid={fieldsInvalid.name ? true : false} />
					<FormFeedback invalid="true">{invalidMsg}.</FormFeedback>
				</FormGroup>
				<FormGroup>
					<Label>Password</Label>
					<Input
						id="login-input-pass"
						type="password"
						invalid={fieldsInvalid.pass ? true : false}
					/>
				</FormGroup>

				<div>Don't have an account? {registerLink}</div>

				<Button id="login-btn" type="submit" color="warning">
					Login
				</Button>
			</Form>
		</Container>
	);
}

export default Login;
