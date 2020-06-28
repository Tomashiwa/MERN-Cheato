import React from "react";

import userIcon from "../icons/icon-user.svg";
import { Comment } from "semantic-ui-react";
import "./css/CommentCard.css";
import axios from "axios";

function CommentCard({ isStale, setIsStale, comment }) {
	const moment = require("moment");
	const date = comment.datetime;
	const time = moment(date);
	const commentID = comment._id;

	function isCommentPresent() {
		return { comment } !== null;
	}

	const deleteComment = () => {
		axios
			.delete(`/api/comments/${commentID}`)
			.then((e) => setIsStale(!isStale))
			.catch((err) => {
				console.log(`Fail to delete: ${err}`);
			});
	};

	return (
		<div>
			{isCommentPresent() ? (
				<Comment>
					<Comment.Avatar src={userIcon}></Comment.Avatar>
					<Comment.Content>
						<Comment.Metadata>
							<p>{comment.user}</p>
							<div>{time.format("DD/MM/YY HH:mm")}</div>
						</Comment.Metadata>
						<Comment.Text>{comment.body}</Comment.Text>
						<Comment.Actions>
							<Comment.Action>Edit</Comment.Action>
							<Comment.Action onClick={deleteComment}>Delete</Comment.Action>
						</Comment.Actions>
					</Comment.Content>
				</Comment>
			) : (
				<div></div>
			)}
		</div>
	);
}

export default CommentCard;
