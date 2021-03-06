import React, { useState, useEffect, useContext } from "react";
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

import { useParams, useHistory } from "react-router-dom";

import "./css/My.css";

function MyBookmark() {
	const { userData } = useContext(UserContext);
	const { userID } = useParams();

	const [bookmarks, setBookmarks] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [name, setName] = useState("");

	const [errorMsg, setErrorMsg] = useState("");

	const history = useHistory();

	const goHome = () => history.push("/");

	useEffect(() => {
		axios
			.post(`/api/users/bookmarks/${userID}`, { user: userData.user })
			.then((res) => {
				setBookmarks(res.data.sheets);
                setIsLoaded(true);
			})
			.catch((err) => setErrorMsg(err.response.data.msg));

		if (!userData.user || userData.user.id !== userID) {
			axios
				.get(`/api/users/name/${userID}`)
				.then((res) => {
					setName(res.data.name);
				})
				.catch((err) => console.log("err", err));
		}
	}, [userID, userData]);

	const bookmarkIcon = <img src="https://d2conugba1evp1.cloudfront.net/icons/icon-bookmark.svg" width="24px" height="24px" alt="bookmark"/>;

	return (
		<Container>
			{isLoaded ? (
				<>
					<h3>{userData.user && userData.user.id === userID ? `My Bookmarks` : `${name ? name + "'s ": ""}Bookmarks`}</h3>
					<div className="my-divider" />
					<Gallery injectedSheets={bookmarks} hasToolbar={false} hasPagination={true} />
					{
						bookmarks.length === 0 
							? userData.user && userData.user.id === userID
								? <h5 className="my-msg">You may bookmark cheatsheets by pressing {bookmarkIcon} on the card</h5>
								: <h5 className="my-msg">This user has yet to bookmark any cheatsheets</h5>
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
										? "The bookmarked sheets of this user cannot be found, please try again later."
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

export default MyBookmark;
