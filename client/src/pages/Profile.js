import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

import Button from "reactstrap/lib/Button";
import Container from "reactstrap/lib/Container";

import Gallery from "../components/Gallery";
import SuggestionGallery from "../components/SuggestionGallery";
import UserContext from "../context/UserContext";

import "./css/Profile.css";

const URL_USERICON = "https://d2conugba1evp1.cloudfront.net/icons/icon-user.svg";

function Profile() {
	const { userData } = useContext(UserContext);
	const { userID } = useParams();
	const [user, setUser] = useState(null);

	const [isLoaded, setIsLoaded] = useState(false);

	const [uploads, setUploads] = useState([]);
	const [bookmarks, setBookmarks] = useState([]);

	const cheatsheetObjectArray = [];

	const history = useHistory();

	const viewBookmark = () => {
		history.push(`/MyBookmark/${userID}`);
	};

	const viewUpload = () => {
		history.push(`/MyUpload/${userID}`);
	};

	useEffect(() => {
		console.log("Rerender");
	})

	useEffect(() => {
		axios
			.get(`/api/users/profile/${userID}`)
			.then((res) => {
				setUser(res.data);
				setIsLoaded(true);
			})
			.catch((err) => {
				console.log(`Fail to fetch user data: ${err}`);
			});
	}, [userID]);

	useEffect(() => {
		axios
			.get(`/api/cheatsheets/byUser/${userID}`)
			.then((res) => {
				setUploads(res.data);
				// console.log('res.data.slice(0,3):', res.data.slice(0,3));
				// setUploads(res.data.slice(0, 3));
			})
			.catch((err) => {
				console.log(`Fail to fetch cheatsheets: ${err}`);
			});
	}, [userID]);

	// useEffect(() => {
	// 	if (user !== null) {
	// 		console.log(`user bookmarks:`, user.bookmarks);
	// 		setBookmarks(user.bookmarks);
	// 	}
	// }, [user]);

	// useEffect(() => {
	// 	if (bookmarks !== null) {
	// 		for (var i = 0; i < bookmarks.length; i++) {
	// 			axios
	// 				.post(`/api/cheatsheets/${user.bookmarks[i]}`, userData.user)
	// 				.then((res) => {
	// 					cheatsheetObjectArray.push(res.data);
	// 					setBookmarks(cheatsheetObjectArray);
	// 				})
	// 				.catch((err) => {
	// 					console.log(`Fail to fetch cheatsheets: ${err}`);
	// 				});
	// 		}
	// 	}
	// }, [user.bookmarks, userData]);

	return (
		<div>
			<Container>
				{isLoaded ? (
					<div>
						<div className="profile-title">
							<img top width="150px" height="150px" src={URL_USERICON} alt="" />
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
									uploads.length > 3
										?	<Button color="info" id="viewUpload" onClick={viewUpload}>
												View All
											</Button>
										:	<></>
								}
							</div>
							<div className="profile-divider" />
							{
								uploads.length > 0
									?<Gallery
										injectedSheets={uploads.slice(0,3)}
										hasToolbar={false}
										hasPagination={false}
									/>
									: 	<div className="profile-notFound">
											<h5>No uploads found</h5>
										</div>
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
									bookmarks.length > 3
										?	<Button color="info" id="viewBookmark" onClick={viewBookmark}>
												View All
											</Button>
										:	<></>
								}							
							</div>
							<div className="profile-divider" />
							{
								bookmarks.length > 0
									?<Gallery
										injectedSheets={bookmarks}
										hasToolbar={false}
										hasPagination={false}
									/>
									: 	<div className="profile-notFound">
											<h5>No bookmarks found</h5>
										</div>
							}
						</div>

						<div>
							<SuggestionGallery align="horizontal" limit={3}/>
						</div>
					</div>
				) : (
					<div></div>
				)}
			</Container>
		</div>
	);
}

export default Profile;
