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
import SuggestionGallery from "../components/SuggestionGallery";
import UserContext from "../context/UserContext";

import "./css/Profile.css";

const URL_USERICON = "https://d2conugba1evp1.cloudfront.net/icons/icon-user.svg";
const PREVIEW_LIMIT = 3;

function Profile() {
	const { userData } = useContext(UserContext);
	const { userID } = useParams();
	const [user, setUser] = useState(null);

	const [hasUserLoad, setHasUserLoad] = useState(false);

	const [uploads, setUploads] = useState([]);
	const [totalUploads, setTotalUploads] = useState(0);
	const [hasUploadLoad, setHasUploadLoad] = useState(false);

	const [bookmarks, setBookmarks] = useState([]);
	const [totalBookmarks, setTotalBookmarks] = useState(0);
	const [hasBookmarkLoad, setHasBookmarkLoad] = useState(false);

	const [errorMsg, setErrorMsg] = useState("");

	const history = useHistory();

	const createLink = <a href={"/create"}>create</a>;
	const uploadLink = <a href={"/upload"}>upload</a>;

	const viewBookmark = () => {
		history.push(`/MyBookmark/${userID}`);
	};

	const viewUpload = () => {
		history.push(`/MyUpload/${userID}`);
	};

	const goHome = () => history.push("/");
	const bookmarkIcon = <img src="https://d2conugba1evp1.cloudfront.net/icons/icon-bookmark.svg" width="24px" height="24px" alt="bookmark"/>;

	useEffect(() => {
		axios
			.get(`/api/users/profile/${userID}`)
			.then((res) => {
				setUser(res.data);
				setHasUserLoad(true);
			})
			.catch((err) => {
				setErrorMsg(err.response.data.msg)			
			});
	}, [userID]);

	useEffect(() => {
		axios
			.post(`/api/users/uploads/${userID}`, {user: userData.user, limit: PREVIEW_LIMIT})
			.then(res => {
				setUploads(res.data.sheets);
				setTotalUploads(res.data.total);
				setHasUploadLoad(true);
			})
			.catch(err => console.log("Fail to fetch uploads", err));

		axios
			.post(`/api/users/bookmarks/${userID}`, {user: userData.user, limit: PREVIEW_LIMIT})
			.then(res => {
				setBookmarks(res.data.sheets);
				setTotalBookmarks(res.data.total);
				setHasBookmarkLoad(true);
			})
			.catch(err => console.log("Fail to fetch bookmarks", err));
	}, [userID, userData.user]);

	return (
		<div>
			{
				errorMsg.length === 0
					?	<Container>
							{hasUserLoad ? (
								<div>
									<div className="profile-title">
										<img width="150px" height="150px" src={URL_USERICON} alt="" />
										<h1 className="profile-name">{user.name}</h1>
									</div>
							
									<div>
										<div className="profile-header">
											<h5>
												{
													user && userData.user !== undefined && user.name === userData.user.name 
														? "My Uploads" 
														: `${user.name}'s Uploads`
												}
											</h5>
											{
												totalUploads > PREVIEW_LIMIT
													?	<Button color="secondary" className="profile-viewBtn" onClick={viewUpload}>
															View All
														</Button>
													:	<></>
											}
										</div>
										<div className="profile-divider" />
										{
											!hasUploadLoad
												?	<div className="profile-spinner"><Spinner color="warning" /></div>
												: 	<>
														<Gallery
															injectedSheets={uploads}
															hasToolbar={false}
															hasPagination={false}
														/>
														{
															uploads.length === 0 
																? userData.user && userData.user.id === userID
																	? <h5 className="profile-msg">You may start to {createLink} or {uploadLink} your cheatsheet</h5>
																	: <h5 className="profile-msg">This user has yet to upload any cheatsheets</h5>
																: <></>
														}
													</>
										}
									</div>
									
									<div>
										<div className="profile-header">
											<h5>
												{
													user && userData.user !== undefined && user.name === userData.user.name 
														? "My Bookmarks" 
														: `${user.name}'s Bookmarks`
												}
											</h5>
											{
												totalBookmarks > PREVIEW_LIMIT
													?	<Button color="secondary" className="profile-viewBtn" onClick={viewBookmark}>
															View All
														</Button>
													:	<></>
											}							
										</div>
										<div className="profile-divider" />
										{
											!hasBookmarkLoad
												?	<div className="profile-spinner"><Spinner color="warning" /></div>
												: 	<>
														<Gallery
															injectedSheets={bookmarks}
															hasToolbar={false}
															hasPagination={false}
														/>
														{
															bookmarks.length === 0 
																? userData.user && userData.user.id === userID
																	? <h5 className="profile-msg">You may bookmark cheatsheets by pressing {bookmarkIcon} on the card</h5>
																	: <h5 className="profile-msg">This user has yet to bookmark any cheatsheets</h5>
																: <></>
														}
													</>
										}
									</div>
									
									<div>
										<SuggestionGallery align="horizontal" limit={3} filter={[]}/>
									</div>
								</div>
							) : (
								<div></div>
							)}
						</Container>
					: 	<Container id="profile-container-error">
							<Card>
								<CardHeader tag="h3">{errorMsg}</CardHeader>
								<CardBody>
									<CardText>
										{
											errorMsg === "No user found" 
												? "The user you trying to view does not exist, please try again later."
												: ""
										}
									</CardText>

									<Button onClick={goHome}>Back to Home</Button>
								</CardBody>
							</Card>
						</Container>
			}
		</div>
	);
}

export default Profile;
