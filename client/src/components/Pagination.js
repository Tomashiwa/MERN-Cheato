import React, { useState, useRef, useEffect } from "react";

import Button from "reactstrap/lib/Button";
import ButtonGroup from "reactstrap/lib/ButtonGroup";

import "./css/Pagination.css";

export const PAGES_PER_VIEW = 5;

function Pagination({
	currentPage,
	cheatsheetPerPage,
	totalCount,
	paginate,
	nextPage,
	previousPage,
	isPrev,
	isNext,
}) {
	const [pageBtns, setPageBtns] = useState([]);
	const totalPagesRef = useRef(Math.ceil(totalCount / cheatsheetPerPage));

	const range = () => {
        const buffer = Math.floor(PAGES_PER_VIEW / 2);

        if(totalPagesRef.current <= 5) {
            return pageBtns;
        } else if(currentPage <= buffer) {
            return pageBtns.slice(0, PAGES_PER_VIEW);
        } else if(currentPage >= totalPagesRef.current - buffer) {
            return pageBtns.slice(totalPagesRef.current - (2 * buffer) - 1, totalPagesRef.current);
        } else {
            return pageBtns.slice(currentPage - buffer - 1, currentPage + buffer);
        }
	};

	const resetView = () => window.scrollTo(0, 0);
	const previous = () => {
		previousPage();
		resetView();
	};
	const next = () => {
		nextPage();
		resetView();
	};

	useEffect(() => {
		const selectPage = (pageNum) => {
			paginate(pageNum);
			resetView();
		};

		let newPageBtns = [];

		for (let i = 1; i <= totalPagesRef.current; i++) {
			const active = currentPage === i ? "active" : "";
			newPageBtns.push(
				<Button className={`waves-effect ${active}`} key={i} onClick={() => selectPage(i)}>
					{i}
				</Button>
			);
		}

		setPageBtns(newPageBtns);
	}, [currentPage, paginate]);

	return (
		<nav>
			<ul className="pagination justify-content-center">
				<ButtonGroup>
					{isPrev ? (
						<Button variant="light" className="page" onClick={() => previous()}>
							Prev
						</Button>
					) : (
						<div></div>
					)}

                    {range(pageBtns)}

					{isNext ? (
						<Button variant="light" className="page" onClick={() => next()}>
							Next
						</Button>
					) : (
						<div></div>
					)}
				</ButtonGroup>
			</ul>
		</nav>
	);
}

export default Pagination;
