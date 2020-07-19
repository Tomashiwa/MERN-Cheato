import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import Rating from "../components/Rating";
import BookmarkButton from "../components/BookmarkButton";

import Card from "reactstrap/lib/Card";
import CardImg from "reactstrap/lib/CardImg";
import Button from "reactstrap/lib/Button";
import CardHeader from "reactstrap/lib/CardHeader";

import "./css/CheatsheetCard.css";

function CheatsheetCard({ sheet }) {
	const history = useHistory();

	const viewCheatsheet = () => {
		history.push(`/view/${sheet.id}`);
	};

	const viewAuthor = () => {
		history.push(`/profile/${sheet.author}`);
	};

	return (
		<div className="sheetCard">
			<Card>
				<CardHeader className="sheetCard-header">
					<div className="sheetCard-info">
						<div className="sheetCard-name">{sheet.name}</div>
						{sheet.authorName ? (
							<Button
								className="sheetCard-author"
								color="link"
								size="sm"
								onClick={viewAuthor}
							>
								{sheet.authorName}
							</Button>
						) : (
							<></>
						)}
					</div>

					<Rating sheet={sheet} />
				</CardHeader>
				<CardImg top onClick={viewCheatsheet} src={sheet.thumbnail} alt="Card image cap" />
				<div className="sheetCard-bookmarkBtn">
					<BookmarkButton sheet={sheet} />
				</div>
				{/* {
					userData.isLoaded && userData.user !== undefined
						?	<div className="sheetCard-bookmarkBtn">
								<BookmarkButton sheet={sheet} />
							</div>
						:	<></>
				} */}
			</Card>
		</div>
	);
}

export default CheatsheetCard;
