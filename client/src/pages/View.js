import React, { useEffect, useState, useContext } from "react";
import { Container, Button, Card, CardHeader, CardBody, CardText } from "reactstrap";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

import UserContext from "../context/UserContext";
import ImagePreviewer from "../components/ImagePreviewer";

import "./css/View.css";

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
            if(sheet) {
                try {
                    const schRes = await axios.get(`/api/schools/${sheet.school}`);
                    const modRes = await axios.get(`/api/modules/${sheet.module}`);
                    const ownerRes = await axios.get(`/api/users/${sheet.user}`);

                    setSchool(schRes.data);
                    setModule(modRes.data);
                    setOwner(ownerRes.data);
                } catch(err) {
                    console.log("error:");
					console.log(err);
                }
            }
        };

        fetchDetails();
	}, [sheet]);

	// Bookmark event
	const bookmark = () => {
		console.log("Bookmarked !!");
	};

	// Upvote and downvote events
	const upvote = () => {
		console.log("Upvoted !!");
	};

	const downvote = () => {
		console.log("Downvoted !!");
	};

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
							<h3>{`${school.name} - ${module.name}`}</h3>
							<h4>
								{`Uploaded by: ${sheet.isAnonymous ? "Anonymous" : owner.name}`}
							</h4>
						</div>

						<div id="view-feedback">
							<Button id="view-btn-bookmark" onClick={bookmark}>Bookmark</Button>
							<Button id="view-btn-upvote" onClick={upvote}>Upvote</Button>
							<Button id="view-btn-downvote" onClick={downvote}>Downvote</Button>
						</div>
					</div>

					<ImagePreviewer imageURL={sheet.file} />

					<div id="view-footer">
						<div id="view-comments">
							<h5>Comments</h5>
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
