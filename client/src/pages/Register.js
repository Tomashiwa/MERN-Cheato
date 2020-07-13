import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import Form from "reactstrap/lib/Form";
import FormGroup from "reactstrap/lib/FormGroup";
import Label from "reactstrap/lib/Label";
import Input from "reactstrap/lib/Input";
import FormFeedback from "reactstrap/lib/FormFeedback";
import Container from "reactstrap/lib/Container";
import Button from "reactstrap/lib/Button";

import UserContext from "../context/UserContext";

import "./css/Register.css";

export const NAME_MIN_LENGTH = 6;
export const PASSWORD_MIN_LENGTH = 8;

function Register() {
	const { userData, setUserData } = useContext(UserContext);

	const [fieldsInvalid, setFieldsInvalid] = useState({
		name: false,
		pass: false,
		check: false,
	});
	const [invalidMsg, setInvalidMsg] = useState("");
	const history = useHistory();

	const areInputsValid = () => {
		const name = document.querySelector("#register-input-name").value;
		const password = document.querySelector("#register-input-pass").value;
		const passwordCheck = document.querySelector("#register-input-confirmPass").value;

		if (name.length === 0 || password.length === 0) {
			setInvalidMsg("Please provide both name and password");
			setFieldsInvalid({ name: true, pass: true, check: true });
			return false;
		} else if (name.length < NAME_MIN_LENGTH) {
			setInvalidMsg(`Username should have ${NAME_MIN_LENGTH} or more characters`);
			setFieldsInvalid({ name: true, pass: false, check: false });
			return false;
		} else if (password.length < PASSWORD_MIN_LENGTH) {
			setInvalidMsg(`Password should have ${PASSWORD_MIN_LENGTH} or more characters`);
			setFieldsInvalid({ name: false, pass: true, check: false });
			return false;
		} else if (password !== passwordCheck) {
			setInvalidMsg("Password fields doesn't match with each other");
			setFieldsInvalid({ name: false, pass: true, check: true });
			return false;
		}

		return true;
	};

	const register = async (e) => {
		e.preventDefault();

		const name = document.querySelector("#register-input-name").value;
		const password = document.querySelector("#register-input-pass").value;

		if (areInputsValid()) {
			const newUser = { name, password, isAdmin: false };

			return import("axios")
				.then(axios => {
					axios
						.post("/api/users/register", newUser)
						.then((registerRes) => {
							return axios.post("/api/auth", { name, password }).then((loginRes) => {
								setUserData({
									...userData,
									...{
										token: loginRes.data.token,
										user: loginRes.data.user,
									},
								});
								localStorage.setItem("auth-token", loginRes.data.token);
								history.push("/");
							});
						})
						.catch((err) => {
							setInvalidMsg(err.response.data.msg);
							setFieldsInvalid({ name: true, pass: false, check: false });
						});
				});
		}
	};

	const link = <a href={"/login"}>Login here</a>;

	return (
		<Container id="register-container">
			<Form id="register-form" onSubmit={register}>
				<h2>Register</h2>
				
				<FormGroup>
					<Label>Name</Label>
					<Input id="register-input-name" invalid={fieldsInvalid.name ? true : false} />
					<FormFeedback invalid="true">{invalidMsg}</FormFeedback>
				</FormGroup>
				<FormGroup>
					<Label>Password</Label>
					<Input
						id="register-input-pass"
						type="password"
						invalid={fieldsInvalid.pass ? true : false}
					/>
					<FormFeedback invalid="true">{invalidMsg}</FormFeedback>
				</FormGroup>
				<FormGroup>
					<Label>Confirm password</Label>
					<Input
						id="register-input-confirmPass"
						type="password"
						invalid={fieldsInvalid.check ? true : false}
					/>
				</FormGroup>

				<div>Already have an account? {link}</div>
				
				<Button id="register-btn" type="submit" color="warning">
					Register
				</Button>
			</Form>
		</Container>
	);
}

export default Register;
