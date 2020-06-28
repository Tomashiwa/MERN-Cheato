import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";

import "./css/Rating.css";

function Rating({ sheet }) {
	const { userData } = useContext(UserContext);

	const [isUpToggled, setIsUpToggled] = useState(false);
	const [isDownToggled, setIsDownToggled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

	const [vote, setVote] = useState(sheet.rating);

	useEffect(() => {
		setVote(sheet.rating);

        if(userData.user !== undefined) {
            axios.get(`/api/users/${userData.user.id}`).then((res) => {
                const fetchedUser = res.data;
                const result = fetchedUser.rated.find((ratedSheet) => ratedSheet.id === sheet._id);
                setIsUpToggled(result !== undefined && result.type === "upvote");
                setIsDownToggled(result !== undefined && result.type === "downvote");
            });
        }
	}, [sheet, userData]);

	const upvote = () => {
		const userID = userData.user.id;
		const upvoteCheck = { id: sheet._id, type: "upvote" };
		const increasedVote = vote + 1;
		const decreasedVote = vote - 1;
        
        setIsLoading(true);

        axios.get(`/api/users/${userID}`)
            .then(res => {
                const fetchedUser = res.data;
                const ratedResult = fetchedUser.rated.find(ratedSheet => ratedSheet.id === sheet._id);

                let ratedArr = fetchedUser.rated.slice(0, fetchedUser.rated.length);

                if(ratedResult !== undefined && ratedResult.type === "downvote") {
                    // User placed a downvote previously, canceling that downvote and adding upvote (+2)
                    ratedArr = ratedArr.filter(ratedSheet => !ratedSheet.id === sheet._id);
                    ratedArr.push(upvoteCheck);

                    axios
                        .put(`/api/cheatsheets/${sheet._id}`, {
                            rating: increasedVote + 1,
                        })
                        .then((res) => {
                            setVote(increasedVote + 1);
                            axios
                                .put(`/api/users/${userID}`, {
                                    rated: ratedArr,
                                })
                                .then(res => {
                                    setIsLoading(false);
                                })
                                .catch((err) => {
                                    console.log(`Fail to upvote: ${err}`);
                                    setIsLoading(false);
                                });
                        });
                } else if(ratedResult !== undefined && ratedResult.type === "upvote") {
                    // User placed a upvote previously, canceling the upvote... (-1)
                    ratedArr = ratedArr.filter(ratedSheet => !ratedSheet.id === sheet._id);

                    axios
                        .put(`/api/cheatsheets/${sheet._id}`, {
                            rating: decreasedVote,
                        })
                        .then((res) => {
                            setVote(decreasedVote);
                            axios
                                .put(`/api/users/${userID}`, {
                                    rated: ratedArr,
                                })
                                .then(res => {
                                    setIsLoading(false);
                                })
                                .catch((err) => {
                                    console.log(`Fail to upvote: ${err}`);
                                    setIsLoading(false);
                                });
                        });
                } else {
                    // User has yet to place a vote, upvoting... (+1)
                    ratedArr.push(upvoteCheck);

                    axios
                        .put(`/api/cheatsheets/${sheet._id}`, {
                            rating: increasedVote,
                        })
                        .then((res) => {
                            setVote(increasedVote);
                            axios
                                .put(`/api/users/${userID}`, {
                                    rated: ratedArr,
                                })
                                .then(res => {
                                    setIsLoading(false);
                                })
                                .catch((err) => {
                                    console.log(`Fail to upvote: ${err}`);
                                    setIsLoading(false);
                                });
                        });
                }
            });

		setIsUpToggled(!isUpToggled);
		setIsDownToggled(false);
	};

	const downvote = () => {
		const userID = userData.user.id;
		const downvoteCheck = { id: sheet._id, type: "downvote" };
		const increasedVote = vote + 1;
		const decreasedVote = vote - 1;

        setIsLoading(true);

		axios.get(`/api/users/${userID}`)
            .then(res => {
                const fetchedUser = res.data;
                const ratedResult = fetchedUser.rated.find(ratedSheet => ratedSheet.id === sheet._id);

                let ratedArr = fetchedUser.rated.slice(0, fetchedUser.rated.length);

                if(ratedResult !== undefined && ratedResult.type === "downvote") {
                    // User placed a downvote previously, canceling that downvote (+1)
                    ratedArr = ratedArr.filter(ratedSheet => !ratedSheet.id === sheet._id);

                    axios
                        .put(`/api/cheatsheets/${sheet._id}`, {
                            rating: increasedVote,
                        })
                        .then((res) => {
                            setVote(increasedVote);
                            axios
                                .put(`/api/users/${userID}`, {
                                    rated: ratedArr,
                                })
                                .then(res => {
                                    setIsLoading(false);
                                })
                                .catch((err) => {
                                    console.log(`Fail to downvote: ${err}`);
                                    setIsLoading(false);
                                });
                        });
                } else if(ratedResult !== undefined && ratedResult.type === "upvote") {
                    // User placed a upvote previously, canceling the upvote and placing an downvote (-2)
                    ratedArr = ratedArr.filter(ratedSheet => !ratedSheet.id === sheet._id);
                    ratedArr.push(downvoteCheck);

                    axios
                        .put(`/api/cheatsheets/${sheet._id}`, {
                            rating: decreasedVote - 1,
                        })
                        .then((res) => {
                            setVote(decreasedVote - 1);
                            axios
                                .put(`/api/users/${userID}`, {
                                    rated: ratedArr,
                                })
                                .then(res => {
                                    setIsLoading(false);
                                })
                                .catch((err) => {
                                    console.log(`Fail to downvote: ${err}`);
                                    setIsLoading(false);
                                });
                        });
                } else {
                    // User has yet to place a vote, downvoting... (-1)
                    ratedArr.push(downvoteCheck);

                    axios
                        .put(`/api/cheatsheets/${sheet._id}`, {
                            rating: decreasedVote,
                        })
                        .then((res) => {
                            setVote(decreasedVote);
                            axios
                                .put(`/api/users/${userID}`, {
                                    rated: ratedArr,
                                })
                                .then(res => {
                                    setIsLoading(false);
                                })
                                .catch((err) => {
                                    console.log(`Fail to downvote: ${err}`);
                                    setIsLoading(false);
                                });
                        });
                }
            });

		setIsDownToggled(!isDownToggled);
		setIsUpToggled(false);
	};

	return (
		<div id="rating-container">
			<div id="rating-btns">
				<button className="rating-btn" type="button" onClick={upvote} disabled={isLoading || userData.user === undefined}>
					{isUpToggled ? (
						<div id="rating-up" className="rating-icon-toggled"></div>
					) : (
						<div id="rating-up" className="rating-icon"></div>
					)}
				</button>
				<button className="rating-btn" type="button" onClick={downvote} disabled={isLoading || userData.user === undefined}>
					{isDownToggled ? (
						<div id="rating-down" className="rating-icon-toggled"></div>
					) : (
						<div id="rating-down" className="rating-icon"></div>
					)}
				</button>
			</div>
			<div id="rating-counter">{vote}</div>
		</div>
	);
}

export default Rating;
