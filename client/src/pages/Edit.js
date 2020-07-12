import React, { useContext, useState, useEffect, Suspense } from "react";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";

import Container from "reactstrap/lib/Container";
import Button from "reactstrap/lib/Button";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import CardText from "reactstrap/lib/CardText";

// import EditForm from "../components/EditForm";
import UserContext from "../context/UserContext";

import "./css/Edit.css";

const EditForm = React.lazy(() => import("../components/EditForm"));

function Edit() {
	const { userData } = useContext(UserContext);
	const { id } = useParams();
	const history = useHistory();

	const [sheet, setSheet] = useState(null);
	const [form, setForm] = useState({
		name: "",
		school: "",
		module: "",
		description: "",
		isPublic: false,
		isInvalid: false
	});

	const [errorMsg, setErrorMsg] = useState("");

	const goHome = () => {
		history.push("/");
	};

	const loginLink = <a href={"/login"}>here</a>;

	const confirmEdit = () => {
		axios
			.post(`/api/cheatsheets/edit/${id}`, { user: userData.user, form })
			.then((result) => {
				history.push(`/view/${id}`);
			})
			.catch((err) => {
				console.log("POST ERROR");
				console.log("post err:", err);
				setErrorMsg(err.response.data.msg);
			});
	};

	useEffect(() => {
		axios.post(`/api/cheatsheets/${id}`, userData.user)
			.then((result) => {
				const fetchedSheet = result.data;
				setSheet(fetchedSheet);
				setForm({
					name: fetchedSheet.name,
					school: fetchedSheet.school,
					module: fetchedSheet.module,
					description: fetchedSheet.description,
					isPublic: fetchedSheet.isPublic,
					isInvalid: false
				});
			})
			.catch((err) => {
				console.log("POST ERROR");
				console.log("post err:", err);
				setErrorMsg(err.response.data.msg);
			});
	}, [id, userData]);

	return (
		<div>
			{
				!errorMsg
					? 	<Container id="edit-container">
							<div id="edit-header">
								<h2>Edit your cheatsheet</h2>
								<Button
									color="warning"
									onClick={confirmEdit}
									disabled={form.name.length <= 0 || form.school.length <= 0 || form.module.length <= 0 || form.isInvalid}
								>
									Confirm
								</Button>
							</div>
				
							<Suspense fallback={<div>Loading...</div>}>
								<EditForm
									form={form}
									setForm={setForm}
									isAnonymous={userData.isLoaded && userData.token === undefined}
								/>
							</Suspense>
						</Container>
					:	<Container id="edit-container-error">
							<Card>
								<CardHeader tag="h3">{errorMsg}</CardHeader>
								<CardBody>
									{errorMsg === "No cheatsheet found" ? (
										<CardText>
											The cheatsheet you trying to acccess does not exist. You may try
											to find it in the search bar above.
										</CardText>
									) : userData.user === undefined ? (
										<CardText>
											If you are the owner of this sheet, please try again after
											logging in {loginLink}.
										</CardText>
									) : (
											<CardText>
												This account do not have access to this cheatsheet. You can only
												view it after the owner enable public access.
											</CardText>
										)}
									<Button onClick={goHome}>Back to Home</Button>
								</CardBody>
							</Card>
						</Container>
			}
		</div>
		
	);
}

export default Edit;
