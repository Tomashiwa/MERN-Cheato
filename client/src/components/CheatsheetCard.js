import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import Rating from "../components/Rating";
import BookmarkButton from "../components/BookmarkButton";

import Card from "reactstrap/lib/Card";
import CardImg from "reactstrap/lib/CardImg";
import Button from "reactstrap/lib/Button";
import CardHeader from "reactstrap/lib/CardHeader";
import Tooltip from "reactstrap/lib/Tooltip";

import "./css/CheatsheetCard.css";

function CheatsheetCard({ sheet }) {
	const nameRef = useRef(null);
	const [hasElipsis, setHasElipsis] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const history = useHistory();

	const viewCheatsheet = () => {
		history.push(`/view/${sheet.id}`);
	};

	const viewAuthor = () => {
		history.push(`/profile/${sheet.author}`);
	};

	const toggleHover = () => setIsHovered(!isHovered);

	useEffect(() => {
		if(nameRef.current.offsetWidth < nameRef.current.scrollWidth) {
			setHasElipsis(true);
		}
	}, [sheet])

	return (
		<div className="sheetCard">
			<Card>
				<CardHeader className="sheetCard-header">
					<div className="sheetCard-info">
						<div id={`sheetCard-name-${sheet.id}`} ref={nameRef} className="sheetCard-name">{sheet.name}</div>
						{
							hasElipsis && document.querySelector(`#sheetCard-name-${sheet.id}`)
								?	<Tooltip
										target={`sheetCard-name-${sheet.id}`}
										placement="right"
										isOpen={isHovered}
										autohide={false}
										toggle={toggleHover}
									> 
										{nameRef.current.innerText}
									</Tooltip>
								:	<></>
						}
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
				<CardImg className="sheetCard-img" top onClick={viewCheatsheet} src={sheet.thumbnail} alt="Card image cap" />
				<div className="sheetCard-bookmarkBtn">
					<BookmarkButton sheet={sheet} />
				</div>
			</Card>
		</div>
	);
}

export default CheatsheetCard;
