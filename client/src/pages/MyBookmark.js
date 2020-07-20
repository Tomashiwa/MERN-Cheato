import React, { useState, useEffect, useContext } from "react";
import axios from "axios";

import Container from "reactstrap/lib/Container";

import Gallery from "../components/Gallery";
import UserContext from "../context/UserContext";

import { useParams } from "react-router-dom";

import "./css/My.css";

function MyBookmark() {
	const { userData } = useContext(UserContext);
	const { userID } = useParams();

	const [bookmarks, setBookmarks] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [name, setName] = useState("");

	useEffect(() => {
		axios
			.post(`/api/users/bookmarks/${userID}`, { user: userData.user })
			.then((res) => {
				setBookmarks(res.data.sheets);
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
			<h3>{userData.user && userData.user.id === userID ? `My Bookmarks` : `${name ? name + "'s ": ""}Bookmarks`}</h3>
			<div className="my-divider" />
			{isLoaded ? (
				<Gallery injectedSheets={bookmarks} hasToolbar={false} hasPagination={true} />
			) : (
				<div></div>
			)}
		</Container>
	);
}

export default MyBookmark;
