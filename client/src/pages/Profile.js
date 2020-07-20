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
const PREVIEW_LIMIT = 3;

function Profile() {
	const { userData } = useContext(UserContext);
	const { userID } = useParams();
	const [user, setUser] = useState(null);

	const [isLoaded, setIsLoaded] = useState(false);

	const [uploads, setUploads] = useState([]);
	const [totalUploads, setTotalUploads] = useState(0);

	const [bookmarks, setBookmarks] = useState([]);
	const [totalBookmarks, setTotalBookmarks] = useState(0);

	const history = useHistory();

	const viewBookmark = () => {
		history.push(`/MyBookmark/${userID}`);
	};

	const viewUpload = () => {
		history.push(`/MyUpload/${userID}`);
	};

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
			.post(`/api/users/uploads/${userID}`, {user: userData.user, limit: PREVIEW_LIMIT})
			.then(res => {
				setUploads(res.data.sheets);
				setTotalUploads(res.data.total);
				console.log('uploads:', res.data);
			})
			.catch(err => console.log("Fail to fetch uploads", err));

		axios
			.post(`/api/users/bookmarks/${userID}`, {user: userData.user, limit: PREVIEW_LIMIT})
			.then(res => {
				setBookmarks(res.data.sheets);
				setTotalBookmarks(res.data.total);
				console.log('bookmarks:', res.data);
			})
			.catch(err => console.log("Fail to fetch bookmarks", err));
	}, [userID, userData.user]);

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
									totalUploads > PREVIEW_LIMIT
										?	<Button color="secondary" className="profile-viewBtn" onClick={viewUpload}>
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
									totalBookmarks > PREVIEW_LIMIT
										?	<Button color="secondary" className="profile-viewBtn" onClick={viewBookmark}>
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
							<SuggestionGallery align="horizontal" limit={3} filter={[]}/>
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
