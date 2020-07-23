import CommentCard from "../components/CommentCard";
import { Button, Comment, Form, Header } from "semantic-ui-react";

import "./css/_CommentGallery.scss";

const URL_USERICON = "https://d2conugba1evp1.cloudfront.net/icons/icon-user.svg";

function CommentGallery({ sheetID }) {
	const { userData } = useContext(UserContext);

	const [comments, setComments] = useState(null);
	const [body, setBody] = useState("");
	const [isStale, setIsStale] = useState(false);

	function isCommentPresent() {
		return comments !== null && comments.length !== 0;
	}

	useEffect(() => {
		axios
			.get(`/api/comments/bySheet/${sheetID}`)
			.then((res) => {
				setComments(res.data);
			})
			.catch((err) => {
				console.log(`Fail to fetch comments: ${err}`);
			});
	}, [isStale, sheetID]);

	const saveBody = (e) => {
		setBody(e.target.value);
	};



	const submitComment = () => {
		const newComment = {
			user: userData.user.name,
			datetime: Date.now(),
			cheatsheet: mongoose.Types.ObjectId(sheetID),
			body: body,
		};

		axios
			.post("/api/comments", newComment)
			.then((res) => {
				setIsStale(!isStale);
				document.querySelector("#CommentText").value = "";
			})
			.catch((err) => console.log`(Error: ${err})`);


	};

	return (
		<div id="CommentGallery">
			<div className="semantic-ui">
				{userData.user !== undefined ? (
					<Form>
						<Form.TextArea id="CommentText" onChange={saveBody} />
						<Button
							id="submitBtn"
							content="Submit Comment"
							icon="edit"
							primary
							onClick={submitComment}
						/>
					</Form>
				) : (
						<></>
					)}
				<Comment.Group>
					<Header as="h3" dividing>
						Comments
					</Header>
					{isCommentPresent() ? (
						comments.map((word, index) => (
							<CommentCard
								key={index}
								comment={word}
								isStale={isStale}
								setIsStale={setIsStale}
							/>
						))
					) : (
							<div></div>
						)}
				</Comment.Group>
			</div>
		</div>
	);
}
export default CommentGallery;
