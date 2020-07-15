import React, { useEffect, useState, useContext, Suspense } from "react";
import { useParams, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";

import Container from "reactstrap/lib/Container";
import Button from "reactstrap/lib/Button";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import CardText from "reactstrap/lib/CardText";
import Spinner from 'reactstrap/lib/Spinner';

import ImagePreviewer from "../components/ImagePreviewer";
import BookmarkButton from "../components/BookmarkButton";
import Rating from "../components/Rating";
import CommentGallery from "../components/CommentGallery";
import SuggestionGallery from "../components/SuggestionGallery";

import UserContext from "../context/UserContext";

import "./css/View.css";

const EditButton = React.lazy(() => import("../components/EditButton"));

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
							<Suspense fallback={<div className="center-screen"><Spinner color="warning"/></div>}>
								{
									userData.isLoaded && userData.user && (userData.user.id === sheet.user || userData.user.isAdmin)
									?	<EditButton sheet={sheet} />
									:	<></>
								}
							</Suspense>
							<BookmarkButton sheet={sheet} />
							<Rating sheet={sheet} />
						</div>
					</div>

					<div className="view-section-line" />

					<ImagePreviewer imageURL={sheet.file} />

					<div className="view-section-line" />

					<div>
						<h5>Description</h5>
						<h6>{sheet.description}</h6>
					</div>

					<div className="view-section-line" />

					<div id="view-footer">
						<div id="view-comments">
							<CommentGallery sheetID={id} />
						</div>

						<div id="view-similars">
							<SuggestionGallery align="vertical" limit={5} />
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
