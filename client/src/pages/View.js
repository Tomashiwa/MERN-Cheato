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
	const [errorMsg, setErrorMsg] = useState("");

	const history = useHistory();
	
	const loginLink = <a href={"/login"}>here</a>;

	const goHome = () => history.push("/");
	const goProfile = () => history.push(`/profile/${sheet.author}`);

	// Fetch cheatsheet to be viewed
	useEffect(() => {
		if(userData.isLoaded) {
			axios.post(`/api/cheatsheets/view/${id}`, userData.user)
				.then(res => {
					setSheet(res.data)
				})
				.catch(err => {
					setErrorMsg(err.response.data.msg);
				});
		}
	}, [id, userData]);

	return (
		<div>
			{sheet ? (
				<Container id="view-container">
					<div id="view-header">
						<div id="view-description">
							<h2>{sheet.name}</h2>
							<h5>{`${sheet.school} - ${sheet.module}`}</h5>
							{
								sheet.authorName !== "Anonymous"
									? <Button id="view-author" color="link" onClick={goProfile}>{sheet.authorName}</Button>
									: <h5>Anonymous</h5>
							}
						</div>

						<div id="view-feedback">
							<Suspense fallback={<div className="center-screen"><Spinner color="warning"/></div>}>
								{
									userData.isLoaded && userData.user && (userData.user.name === sheet.authorName || userData.user.isAdmin)
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

					<div id="view-footer">
						<div id="view-desc-comment">
							<div id="view-desc">
								<h5>Description</h5>
								<div>{sheet.description}</div>
							</div>

							<div className="view-section-line" />

							<div id="view-comments">
								<CommentGallery sheetID={id} />
							</div>
						</div>
					
						<div id="view-similars">
							<SuggestionGallery align="vertical" limit={5} filter={[id]}/>
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
