import React, { useState, useEffect, useContext } from "react";

import Gallery from "../components/Gallery";

import axios from "axios";

import UserContext from "../context/UserContext";

import { useParams } from "react-router-dom";

function MyBookmark() {
	const { userID } = useParams();
	const { userData } = useContext(UserContext);

	const [user, setUser] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [bookmarked, setBookmarked] = useState(null);
	const [display, setDisplay] = useState(null);

	const cheatsheetObjectArray = [];

	useEffect(() => {
		if (userData.isLoaded && userData.token !== undefined) {
			console.log("hi");
			axios
				.get(`/api/users/${userID}`)
				.then((res) => {
					setUser(res.data);
				})
				.catch((err) => {
					console.log(`Fail to fetch user data: ${err}`);
				});
		}
	}, [userData, userID]);

	useEffect(() => {
		if (user !== null) {
			setBookmarked(user.bookmarks);
		}
	}, [user]);

	useEffect(() => {
		if (bookmarked !== null) {
			for (var i = 0; i < bookmarked.length; i++) {
				axios
					.post(`/api/cheatsheets/${bookmarked[i]}`, userData.user)
					.then((res) => {
						cheatsheetObjectArray.push(res.data);
						setDisplay(cheatsheetObjectArray);
						setIsLoaded(true);
					})
					.catch((err) => {
						console.log(`Fail to fetch cheatsheets: ${err}`);
					});
			}
		}
	}, [bookmarked, userData]);

	return (
		<div>
			{isLoaded ? (
				<Gallery
					injectedSheets={display}
					title={userData.user.id === userID ? "My Bookmarks" : `${user.name}'s Bookmarks`}
					hasToolbar={false}
					hasPagination={false}
				/>
			) : (
				<div></div>
			)}
		</div>
	);
}

export default MyBookmark;
