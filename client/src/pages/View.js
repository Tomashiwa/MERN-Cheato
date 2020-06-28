import React, { useEffect, useState, useContext } from "react";
import { Container, Button, Card, CardHeader, CardBody, CardText } from "reactstrap";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

import UserContext from "../context/UserContext";
import ImagePreviewer from "../components/ImagePreviewer";
import BookmarkButton from "../components/BookmarkButton";
import CommentGallery from "../components/CommentGallery";

import "./css/View.css";
import Rating from "../components/Rating";

function View() {
	const { userData } = useContext(UserContext);
	const { id } = useParams();

	const [sheet, setSheet] = useState(null);
	const [school, setSchool] = useState(null);
	const [module, setModule] = useState(null);
	const [owner, setOwner] = useState(null);

	const [errorMsg, setErrorMsg] = useState("");

	const history = useHistory();

	// Fetch cheatsheet to be viewed
	useEffect(() => {
		const fetchSheet = async () => {
			if (userData.isLoaded) {
				try {
					const response = await axios.post(`/api/cheatsheets/${id}`, userData.user);
					setSheet(response.data);
				} catch (err) {
					setErrorMsg(err.response.data.msg);
				}
			}
		};

		fetchSheet();
	}, [id, userData]);

	// Fetch the respective school and module of the sheet
	useEffect(() => {
		const fetchDetails = async () => {
			if (sheet) {
				try {
					const schRes = await axios.get(`/api/schools/${sheet.school}`);
					const modRes = await axios.get(`/api/modules/${sheet.module}`);
					const ownerRes = await axios.get(`/api/users/${sheet.user}`);
					setSchool(schRes.data);
					setModule(modRes.data);
					setOwner(ownerRes.data);
				} catch (err) {
					console.log("error:");
					console.log(err);
				}
			}
		};

		fetchDetails();
	}, [sheet]);

	const goHome = () => {
		history.push("/");
	};

	const loginLink = <a href={"/login"}>here</a>;

	return (
		<div>
			{sheet && school && module && (owner || sheet.isAnonymous) ? (
				<Container id="view-container">
					<div id="view-header">
						<div id="view-description">
							<h2>{sheet.name}</h2>
							<h5>{`${school.name} - ${module.name}`}</h5>
							<h5>{`Uploaded by: ${sheet.isAnonymous ? "Anonymous" : owner.name}`}</h5>
						</div>

						<div id="view-feedback">
							<BookmarkButton sheet={sheet} size={"24px"} />
							<Rating sheet={sheet} />
						</div>
					</div>

					<ImagePreviewer imageURL={sheet.file} />

					<div id="view-footer">
						<div id="view-comments">
							<CommentGallery sheetID={id} />
						</div>

						<div id="view-similars">
							<h5>Similar cheatsheets</h5>
						</div>
					</div>
				</Container>
			) : errorMsg ? (
				<Container id="view-container-error">
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
			) : (
						<div id="view-container-empty"></div>
					)}
		</div>
	);
}

export default View;
