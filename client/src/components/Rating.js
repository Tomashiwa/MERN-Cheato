import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";

import Tooltip from "reactstrap/lib/Tooltip";

import "./css/Rating.css";

import { vote, unvote } from "../lib/SuggestionEngine/Api";

function Rating({ sheet }) {
	const { userData } = useContext(UserContext);

	const [isUpToggled, setIsUpToggled] = useState(false);
	const [isDownToggled, setIsDownToggled] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [isUpHover, setIsUpHover] = useState(false);
	const [isDownHover, setIsDownHover] = useState(false);

	const [voteCount, setVoteCount] = useState(sheet.rating);

	const toggleUpHover = () => setIsUpHover(!isUpHover);
	const toggleDownHover = () => setIsDownHover(!isDownHover);

	useEffect(() => {
		if (userData.user !== undefined && sheet.upvotedUsers.includes(userData.user.id)) {
			setIsUpToggled(true);
			setIsDownToggled(false);
		} else if (userData.user !== undefined && sheet.downvotedUsers.includes(userData.user.id)) {
			setIsUpToggled(false);
			setIsDownToggled(true);
		} else {
			setIsUpToggled(false);
			setIsDownToggled(false);
		}
		setVoteCount(sheet.rating);
	}, [sheet, userData.user]);

	const upvote = () => {
		setIsLoading(true);

		axios.post(`/api/cheatsheets/${sheet.id}`, userData).then((res) => {
			const fetchedSheet = res.data;
			const upvotedUsers = fetchedSheet.upvotedUsers;
			const downvotedUsers = fetchedSheet.downvotedUsers;

			if (upvotedUsers.find((id) => id === userData.user.id)) {
				// User placed a upvote previously, canceling the upvote... (-1)
				unvote("upvote", userData.user, sheet, () => {
					setVoteCount(upvotedUsers.length - downvotedUsers.length - 1);
					setIsLoading(false);
				});
			} else if (downvotedUsers.find((id) => id === userData.user.id)) {
				// User placed a downvote previously, canceling that downvote and adding upvote (+2)
				unvote("downvote", userData.user, sheet, () => {
					vote("upvote", userData.user, sheet, () => {
						setVoteCount(upvotedUsers.length - downvotedUsers.length + 2);
						setIsLoading(false);
					});
				});
			} else {
				// User has yet to place a vote, upvoting... (+1)
				vote("upvote", userData.user, sheet, () => {
					setVoteCount(upvotedUsers.length - downvotedUsers.length + 1);
					setIsLoading(false);
				});
			}
		});

		setIsUpToggled(!isUpToggled);
		setIsDownToggled(false);
	};

	const downvote = () => {
		setIsLoading(true);

		axios.post(`/api/cheatsheets/${sheet.id}`, userData).then((res) => {
			const fetchedSheet = res.data;
			const upvotedUsers = fetchedSheet.upvotedUsers;
			const downvotedUsers = fetchedSheet.downvotedUsers;

			if (downvotedUsers.find((id) => id === userData.user.id)) {
				// User placed a downvote previously, canceling that downvote (+1)
				unvote("downvote", userData.user, sheet, () => {
					setVoteCount(upvotedUsers.length - downvotedUsers.length + 1);
					setIsLoading(false);
				});
			} else if (upvotedUsers.find((id) => id === userData.user.id)) {
				// User placed a upvote previously, canceling the upvote and placing an downvote (-2)
				unvote("upvote", userData.user, sheet, () => {
					vote("downvote", userData.user, sheet, () => {
						setVoteCount(upvotedUsers.length - downvotedUsers.length - 2);
						setIsLoading(false);
					});
				});
			} else {
				// User has yet to place a vote, downvoting... (-1)
				vote("downvote", userData.user, sheet, () => {
					setVoteCount(upvotedUsers.length - downvotedUsers.length - 1);
					setIsLoading(false);
				});
			}
		});

		setIsDownToggled(!isDownToggled);
		setIsUpToggled(false);
	};

	return (
		<div className="rating-container">
			<div className="rating-btns">
				<button
					className="rating-btn"
					id={`rating-up-${sheet.id}`}
					type="button"
					onClick={upvote}
					disabled={isLoading || userData.user === undefined}
				>
					{isUpToggled ? (
						<div className="rating-up rating-icon-toggled" />
					) : (
						<div className="rating-up rating-icon" />
					)}
				</button>
				{
					document.querySelector(`#rating-up-${sheet.id}`)
						?	<Tooltip
								target={`rating-up-${sheet.id}`}
								placement="right"
								isOpen={isUpHover}
								autohide={false}
								toggle={toggleUpHover}
							> 
								{isUpToggled ? "Unvote" : "Upvote"}
							</Tooltip>
						:	<></>
				}

				<button
					className="rating-btn"
					id={`rating-down-${sheet.id}`}
					type="button"
					onClick={downvote}
					disabled={isLoading || userData.user === undefined}
				>
					{isDownToggled ? (
						<div className="rating-down rating-icon-toggled" />
					) : (
						<div className="rating-down rating-icon" />
					)}
				</button>
				{
					document.querySelector(`#rating-down-${sheet.id}`)
						? 	<Tooltip
								target={`rating-down-${sheet.id}`}
								placement="right"
								isOpen={isDownHover}
								autohide={false}
								toggle={toggleDownHover}
							> 
								{isDownToggled ? "Unvote" : "Downvote"}
							</Tooltip>
						: 	<></>
				}
			</div>
			<div className="rating-counter">{voteCount}</div>
		</div>
	);
}

export default Rating;
