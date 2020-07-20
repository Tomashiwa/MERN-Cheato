import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Container from "reactstrap/lib/Container";

import Gallery from "../components/Gallery";
import UserContext from "../context/UserContext";

import "./css/My.css";

function MyUpload() {
	const { userData } = useContext(UserContext);
	const { userID } = useParams();

	const [uploads, setUploads] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [name, setName] = useState("");

	useEffect(() => {
		axios
			.post(`/api/users/uploads/${userID}`, { user: userData.user })
			.then((res) => {
				setUploads(res.data.sheets);
                setIsLoaded(true);
                console.log("res.data.sheets:", res.data.sheets);
			})
			.catch((err) => console.log("err", err));

		if (!userData.user || userData.user.id !== userID) {
			axios
				.get(`/api/users/name/${userID}`)
				.then((res) => {
					setName(res.data.name);
					console.log("res.data.name:", res.data.name);
				})
				.catch((err) => console.log("err", err));
		}
	}, [userID, userData]);

	return (
		<Container>
			<h3>{userData.user && userData.user.id === userID ? `My Uploads` : `${name ? name + "'s ": ""}Uploads`}</h3>
            <div className="my-divider" />
			{isLoaded ? (
				<Gallery injectedSheets={uploads} hasToolbar={false} hasPagination={true} />
			) : (
				<div></div>
			)}
		</Container>
	);
}

export default MyUpload;
