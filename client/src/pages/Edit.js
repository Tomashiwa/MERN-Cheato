import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext";
import { Button } from "reactstrap";
import Container from "reactstrap/lib/Container";
import EditForm from "../components/EditForm";

import "./css/Edit.css";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

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
	});

	const confirmEdit = () => {
        console.log({ userData, form });
        console.log(`/api/cheatsheets/edit/${id}`);
		axios
			.post(`/api/cheatsheets/edit/${id}`, { user: userData.user, form })
			.then((result) => {
                console.log("post result:", result);
                history.push(`/view/${id}`);
			})
			.catch((err) => {
				console.log("post err:", err);
			});
	};

	useEffect(() => {
		axios.post(`/api/cheatsheets/${id}`, userData.user).then((result) => {
			const fetchedSheet = result.data;
			console.log("fetchedSheet:", fetchedSheet);
            setSheet(fetchedSheet);

			// setSheet(fetchedSheet);
			setForm({
				name: fetchedSheet.name,
				school: fetchedSheet.school,
				module: fetchedSheet.module,
				description: fetchedSheet.description,
				isPublic: fetchedSheet.isPublic,
			});
		});
	}, [id, userData]);

	return (
		<Container id="edit-container">
			<div id="edit-header">
				<h2>Edit your cheatsheet {id}</h2>
				<Button color="warning" onClick={confirmEdit}>
					Confirm
				</Button>
			</div>

			<EditForm
				form={form}
				setForm={setForm}
				isAnonymous={userData.isLoaded && userData.token === undefined}
			/>
		</Container>
	);
}

export default Edit;
