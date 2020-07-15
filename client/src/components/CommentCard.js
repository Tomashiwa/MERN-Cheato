import React, { useContext, useState, useEffect, useRef } from "react";
import dayjs from "dayjs";

import { Comment, Form, Button } from "semantic-ui-react";

import UserContext from "../context/UserContext";
import "./css/CommentCard.css";

const URL_USERICON = "https://d2conugba1evp1.cloudfront.net/icons/icon-user.svg";

function CommentCard({ isStale, setIsStale, comment }) {
	const { userData } = useContext(UserContext);

	const commentIDRef = useRef(comment._id);
	const timestampRef = useRef(dayjs(comment.datetime).format("DD/MM/YY HH:mm"));
	
	const [isVisible, setIsVisible] = useState(false);
	const [body, setBody] = useState("");

	const isMatchingUser =
		userData.isLoaded && userData.user && userData.user.name === comment.user;

	function isCommentPresent() {
		return { comment } !== null;
	}

	const deleteComment = () => {
		import("axios").then((axios) => {
			axios
				.delete(`/api/comments/${commentIDRef.current}`)
				.then((e) => setIsStale(!isStale))
				.catch((err) => {
					console.log(`Fail to delete: ${err}`);
				});
		});
	};

	const showTextbox = () => {
		setIsVisible(true);
	};

	useEffect(() => {
		if (isVisible) {
			document.querySelector("#OriginalText").value = comment.body;
		}
	}, [isVisible, comment.body]);

	const saveBody = (e) => {
		setBody(e.target.value);
	};

	const editComment = () => {
		const editedComment = body;

		import("axios").then((axios) => {
			axios
				.put(`/api/comments/${comment._id}`, { body: editedComment })
				.then((res) => {
					setIsVisible(false);
					setIsStale(!isStale);
				})
				.catch((err) => {
					console.log(`Fail to edit comment: ${err}`);
				});
		});
	};

	return (
		<div>
			{isCommentPresent() ? (
				!isVisible ? (
					<Comment>
						<Comment.Avatar src={URL_USERICON}></Comment.Avatar>
						<Comment.Content>
							<Comment.Metadata>
								<p>{comment.user}</p>
								<div>{timestampRef.current}</div>
							</Comment.Metadata>
							<Comment.Text>{comment.body}</Comment.Text>
							{isMatchingUser ? (
								<Comment.Actions>
									<Comment.Action onClick={showTextbox}>Edit</Comment.Action>
									<Comment.Action onClick={deleteComment}>Delete</Comment.Action>
								</Comment.Actions>
							) : (
								<div> </div>
							)}
						</Comment.Content>
					</Comment>
				) : (
					<div>
						<Form>
							<Form.TextArea id="OriginalText" onChange={saveBody} />
							<Button
								id="submitBtn"
								content="Edit Comment"
								labelPosition="left"
								icon="edit"
								primary
								onClick={editComment}
							/>
						</Form>
					</div>
				)
			) : (
				<div></div>
			)}
		</div>
	);
}

export default CommentCard;
