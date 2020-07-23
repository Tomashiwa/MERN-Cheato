import React, { useState, useEffect } from "react";

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
	const [totalPages, setTotalPages] = useState(Math.ceil(totalCount / cheatsheetPerPage));

	const range = () => {
        const buffer = Math.floor(PAGES_PER_VIEW / 2);

        if(totalPages <= 5) {
            return pageBtns;
        } else if(currentPage <= buffer) {
            return pageBtns.slice(0, PAGES_PER_VIEW);
        } else if(currentPage >= totalPages - buffer) {
            return pageBtns.slice(totalPages - (2 * buffer) - 1, totalPages);
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
		setTotalPages(Math.ceil(totalCount / cheatsheetPerPage));
	}, [totalCount, cheatsheetPerPage])

	useEffect(() => {
		const selectPage = (pageNum) => {
			paginate(pageNum);
			resetView();
		};

		let newPageBtns = [];

		for (let i = 1; i <= totalPages; i++) {
			const active = currentPage === i ? "active" : "";
			newPageBtns.push(
				<Button className={`waves-effect ${active}`} key={i} onClick={() => selectPage(i)}>
					{i}
				</Button>
			);
		}

		setPageBtns(newPageBtns);
	}, [currentPage, paginate, totalPages]);

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
