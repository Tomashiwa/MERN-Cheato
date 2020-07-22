import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

import Button from "reactstrap/lib/Button";
import Container from "reactstrap/lib/Container";
import Spinner from 'reactstrap/lib/Spinner';
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import CardText from "reactstrap/lib/CardText";

import Gallery from "../components/Gallery";
import UserContext from "../context/UserContext";

import "./css/My.css";

function MyUpload() {
	const { userData } = useContext(UserContext);
	const { userID } = useParams();

	const [uploads, setUploads] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [name, setName] = useState("");

	const [errorMsg, setErrorMsg] = useState("");

	const history = useHistory();

	const goHome = () => history.push("/");
	const createLink = <a href={"/create"}>create</a>;
	const uploadLink = <a href={"/upload"}>upload</a>;

	useEffect(() => {
		axios
			.post(`/api/users/uploads/${userID}`, { user: userData.user })
			.then((res) => {
				setUploads(res.data.sheets);
                setIsLoaded(true);
			})
			.catch((err) => {
				setErrorMsg(err.response.data.msg);
			});

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
			{isLoaded ? (
				<>
					<h3>{userData.user && userData.user.id === userID ? `My Uploads` : `${name ? name + "'s ": ""}Uploads`}</h3>
					<div className="my-divider" />
					<Gallery injectedSheets={uploads} hasToolbar={false} hasPagination={true} />
					{
						uploads.length === 0 
							? userData.user && userData.user.id === userID
								? <h5 className="my-msg">You may start to {createLink} or {uploadLink} your cheatsheet</h5>
								: <h5 className="my-msg">This user has yet to upload any cheatsheets</h5>
							: <></>
					}
				</>
			) : errorMsg.length === 0 
				? 	<div className="my-spinner"><Spinner color="warning" /></div>
				: 	<Card>
						<CardHeader tag="h3">{errorMsg}</CardHeader>
						<CardBody>
							<CardText>
								{
									errorMsg.length > 0 
										? "The uploaded sheets of this user cannot be found, please try again later."
										: ""
								}
							</CardText>
							
							<Button onClick={goHome}>Back to Home</Button>
						</CardBody>
					</Card>
			}
		</Container>
	);
}

export default MyUpload;
