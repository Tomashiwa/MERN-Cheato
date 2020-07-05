import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import SuggestionContext from "../context/SuggestionContext";

import "./css/Rating.css";

function Rating({ sheet }) {
	const { userData } = useContext(UserContext);
    const { engine } = useContext(SuggestionContext);

	const [isUpToggled, setIsUpToggled] = useState(false);
	const [isDownToggled, setIsDownToggled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

	const [vote, setVote] = useState(sheet.upvotedUsers.length - sheet.downvotedUsers.length);

	useEffect(() => {
        if(userData.user !== undefined) {
            axios.get(`/api/users/${userData.user.id}`).then((res) => {
                const fetchedUser = res.data;

                if(fetchedUser.upvotedSheets.find(id => id === sheet._id)) {
                    setIsUpToggled(true);
                    setIsDownToggled(false);
                } else if(fetchedUser.downvotedSheets.find(id => id === sheet._id)) {
                    setIsUpToggled(false);
                    setIsDownToggled(true);
                }
            });
        }
	}, [sheet, userData]);

	const upvote = () => {
        setIsLoading(true);

        axios.post(`/api/cheatsheets/${sheet._id}`, userData)
            .then(res => {
                const fetchedSheet = res.data;
                const upvotedUsers = fetchedSheet.upvotedUsers;
                const downvotedUsers = fetchedSheet.downvotedUsers;
                
                if(upvotedUsers.find(id => id === userData.user.id)) {
                    // User placed a upvote previously, canceling the upvote... (-1)
                    engine.upvotes.remove(userData.user, sheet, () => {
                        setVote(upvotedUsers.length - downvotedUsers.length - 1);
                        setIsLoading(false);
                    });

                } else if(downvotedUsers.find(id => id === userData.user.id)) {
                    // User placed a downvote previously, canceling that downvote and adding upvote (+2)
                    engine.downvotes.remove(userData.user, sheet, () => {
                        engine.upvotes.add(userData.user, sheet, () => {
                            setVote(upvotedUsers.length - downvotedUsers.length + 2);
                            setIsLoading(false);
                        });
                    });
                } else {
                    // User has yet to place a vote, upvoting... (+1)
                    engine.upvotes.add(userData.user, sheet, () => {
                        setVote(upvotedUsers.length - downvotedUsers.length + 1);
                        setIsLoading(false);
                    })
                }
            });

		setIsUpToggled(!isUpToggled);
		setIsDownToggled(false);
	};

	const downvote = () => {
        setIsLoading(true);

        axios.post(`/api/cheatsheets/${sheet._id}`, userData)
            .then(res => {
                const fetchedSheet = res.data;
                const upvotedUsers = fetchedSheet.upvotedUsers;
                const downvotedUsers = fetchedSheet.downvotedUsers;

                if(downvotedUsers.find(id => id === userData.user.id)) {
                    // User placed a downvote previously, canceling that downvote (+1)
                    engine.downvotes.remove(userData.user, sheet, () => {
                        setVote(upvotedUsers.length - downvotedUsers.length + 1);
                        setIsLoading(false);
                    });

                } else if(upvotedUsers.find(id => id === userData.user.id)) {
                    // User placed a upvote previously, canceling the upvote and placing an downvote (-2)
                    engine.upvotes.remove(userData.user, sheet, () => {
                        engine.downvotes.add(userData.user, sheet, () => {
                            setVote(upvotedUsers.length - downvotedUsers.length - 2);
                            setIsLoading(false);
                        });
                    });
                } else {
                    // User has yet to place a vote, downvoting... (-1)
                    engine.downvotes.add(userData.user, sheet, () => {
                        setVote(upvotedUsers.length - downvotedUsers.length - 1);
                        setIsLoading(false);
                    })
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
