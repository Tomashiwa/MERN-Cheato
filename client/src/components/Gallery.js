import React, { useState, useEffect, useContext } from "react";
import axios from "axios";

import Container from "reactstrap/lib/Container";

import Select from "react-select";
import { optimizeSelect } from "./OptimizedSelect";
import { createFilter } from "react-select";

import CheatsheetCard from "../components/CheatsheetCard";
import UserContext from "../context/UserContext";
import Pagination from "../components/Pagination";

import "./css/Gallery.css";

export const SORT_OPTIONS = [
	{ label: "Date uploaded", value: "dateTime" },
	{ label: "Rating", value: "rating" },
];

export const SELECT_STYLE = {
	option: (provided, state) => ({
		...provided,
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
	}),
};

export const SHEETS_PER_PAGE = 9;

function Gallery({ hasToolbar = true, hasPagination = true, injectedSheets = undefined }) {
	const { userData } = useContext(UserContext);

	const [sortOrder, setSortOrder] = useState("dateTime");
	const [schFilter, setSchFilter] = useState(null);
	const [modFilter, setModfilter] = useState(null);

	const [sheets, setSheets] = useState([]);

	const [schOpts, setSchOpts] = useState([]);
	const [modOpts, setModOpts] = useState([]);

	const [schLoading, setSchLoading] = useState(false);
	const [modLoading, setModLoading] = useState(false);

	const [prev, setPrev] = useState(true);
	const [next, setNext] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [sheetsCount, setSheetsCount] = useState(0);

	const changeSch = (option) => {
		setCurrentPage(1);
		setSchFilter(option);
		setModfilter(null);
	};
	const changeMod = (option) => {
		setCurrentPage(1);
		setModfilter(option)
	};
	const changeSort = (option) => {
		setCurrentPage(1);
		setSortOrder(option.value)
	};
	const paginate = (pageNum) => setCurrentPage(pageNum);
	const nextPage = () => setCurrentPage(currentPage + 1);
	const previousPage = () => setCurrentPage(currentPage - 1);

	// Fetch school upon page start
	useEffect(() => {
		if(hasToolbar) {
			setSchLoading(true);
			axios
				.get("/api/schools")
				.then((res) => {
					const schools = res.data;
					const options = schools.map((school) => {
						return { label: school.name, value: school._id };
					});
					options.unshift({ label: "Select...", value: null });
	
					setSchOpts(options);
					setSchLoading(false);
				})
				.catch((err) => {
					console.log(`Fail to fetch Schools: ${err}`);
				});
		}
	}, [hasToolbar]);

	// Fetch modules upon selecting a school
	useEffect(() => {
		if (hasToolbar && schFilter && schFilter.value !== null) {
			setModLoading(true);

			axios.get(`/api/modules/bySchool/${schFilter.value}`).then((res) => {
				const modules = res.data;
				const options = modules.map((module) => {
					return { label: module.name, value: module._id };
				});
				options.unshift({ label: "Select...", value: null });
				setModOpts(options);
				setModLoading(false);
			});
		} else {
			setModOpts([]);
		}
	}, [schFilter, hasToolbar]);

	useEffect(() => {
		if(injectedSheets === undefined) {
			let config = {
				user: userData.user !== undefined ? userData.user : null,
				filter: {},
				sortBy: sortOrder,
				itemsPerPage: SHEETS_PER_PAGE
			};

			if(schFilter && schFilter.value) {
				config.filter.school = schFilter.value;
			}

			if(modFilter && modFilter.value) {
				config.filter.module = modFilter.value;
			}
	
			axios.post("/api/cheatsheets/sheetCount", config).then((result) => {
				setSheetsCount(result.data.count);
			});
	
			axios.post(`/api/cheatsheets/page/${currentPage}`, config).then((result) => {
				setSheets(result.data);
			});
		}
	}, [schFilter, modFilter, sortOrder, userData.user, currentPage, injectedSheets]);

	useEffect(() => {
		if (currentPage === 1) {
			setPrev(false);
		} else {
			setPrev(true);
		}
	}, [currentPage]);

	useEffect(() => {
		if (currentPage === Math.ceil(sheetsCount / SHEETS_PER_PAGE)) {
			setNext(false);
		} else if (Math.ceil(sheetsCount / SHEETS_PER_PAGE) === 0) {
			setNext(false);
		} else {
			setNext(true);
		}
	}, [currentPage, sheetsCount]);

	return (
		<div>
			<Container>
				{hasToolbar ? (
					<div id="gallery-toolbar">
						<div className="gallery-tool-group">
							<div className="gallery-tool-label">School</div>
							<Select
								className="gallery-tool-select"
								defaultValue={schOpts[0]}
								options={schOpts}
								isClearable={false}
								isSearchable={false}
								isDisabled={schLoading}
								isLoading={schLoading}
								onChange={changeSch}
								value={schFilter}
								auto
								styles={SELECT_STYLE}
							/>
						</div>
						<div className="gallery-tool-group">
							<div className="gallery-tool-label">Module</div>
							<Select
								className="gallery-tool-select"
								defaultValue={modOpts[0]}
								options={modOpts}
								isDisabled={modOpts.length === 0 || modLoading}
								isClearable={false}
								isSearchable={true}
								isLoading={modLoading}
								value={modFilter}
								onChange={changeMod}
								filterOption={createFilter({ ignoreAccents: false })}
								components={optimizeSelect.components}
								styles={SELECT_STYLE}
							/>
						</div>
						<div className="gallery-tool-group">
							<div className="gallery-tool-label">Sort by</div>
							<Select
								className="gallery-tool-select"
								defaultValue={SORT_OPTIONS[0]}
								options={SORT_OPTIONS}
								isClearable={false}
								isSearchable={false}
								onChange={changeSort}
								styles={SELECT_STYLE}
							/>
						</div>
					</div>
				) : (
					<div></div>
				)}
				<div className="gallery">
					{
						injectedSheets === undefined
							? sheets.map((sheet, index) => (
								<CheatsheetCard key={index} sheet={sheet} />
							))
						: injectedSheets !== undefined && injectedSheets.length > 0
							? injectedSheets.map((sheet, index) => (
								<CheatsheetCard key={index} sheet={sheet} />
							))
						: <h5 id="gallery-nosheets">No sheets found</h5>
					}
				</div>
				{hasPagination && ((injectedSheets !== undefined && injectedSheets.length > 0) || sheetsCount > SHEETS_PER_PAGE) ? (
					<Pagination
						cheatsheetPerPage={SHEETS_PER_PAGE}
						totalCount={sheetsCount}
						paginate={paginate}
						nextPage={nextPage}
						previousPage={previousPage}
						isPrev={prev}
						isNext={next}
						currentPage={currentPage}
					></Pagination>
				) : (
					<div></div>
				)}
			</Container>
		</div>
	);
}

export default Gallery;
