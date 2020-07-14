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



function Gallery({ cheatsheetArray = [], text = "", dropdown = true, numbering = true }) {
	const { userData } = useContext(UserContext);

	const [sortOrder, setSortOrder] = useState("dateTime");
	const [schFilter, setSchFilter] = useState(null);
	const [modFilter, setModfilter] = useState(null);

	const [isLoaded, setIsLoaded] = useState(false);
	const [sheets, setSheets] = useState([]);
	const [displaySheets, setDisplaySheets] = useState([]);

	const [schOpts, setSchOpts] = useState([]);
	const [modOpts, setModOpts] = useState([]);

	const [schLoading, setSchLoading] = useState(false);
	const [modLoading, setModLoading] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const [cheatsheetPerPage, setCheatsheetPerPage] = useState(9);
	const [prev, setPrev] = useState(true);
	const [next, setNext] = useState(true);

	const isText = (text === "");
	const isDropdown = (dropdown === true);
	const isNumbering = (numbering === true);

	const indexOfLastCard = currentPage * cheatsheetPerPage;
	const indexOfFirstCard = indexOfLastCard - cheatsheetPerPage;
	const currentCard = displaySheets.slice(indexOfFirstCard, indexOfLastCard)

	const pageNum = []

	useEffect(() => {
		const postConfig = { headers: { "Content-Type": "application/json" } };
		const userInfo = userData.user !== undefined ? userData.user : null;
		if (cheatsheetArray === null || cheatsheetArray.length === 0) {
			axios.post("/api/cheatsheets", userInfo, postConfig).then((res) => {
				setSheets(res.data);
				setDisplaySheets(res.data);
				setIsLoaded(true);
			});
		} else {
			setSheets(cheatsheetArray);
			setDisplaySheets(cheatsheetArray)
		}

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
	}, [userData.user]);

	useEffect(() => {
		if (schFilter && schFilter.value !== null) {
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
	}, [schFilter]);

	useEffect(() => {
		let sortedSheets = sheets.slice(0, sheets.length);

		if (sortOrder === "dateTime") {
			sortedSheets.sort((a, b) => {
				return new Date(b.date) - new Date(a.date);
			});
		} else if (sortOrder === "rating") {
			sortedSheets.sort((a, b) => (a.rating < b.rating ? 1 : -1));
		}

		if (schFilter && schFilter.value) {
			sortedSheets = sortedSheets.filter((sheet) => sheet.school === schFilter.value);
		}

		if (modFilter && modFilter.value) {
			sortedSheets = sortedSheets.filter((sheet) => sheet.module === modFilter.value);
		}

		setDisplaySheets(sortedSheets);
	}, [sortOrder, schFilter, modFilter, sheets]);

	const changeSort = (option) => {
		setSortOrder(option.value);
	};

	const changeSch = (option) => {
		setSchFilter(option);
		setModfilter(null);
	};

	const changeMod = (option) => {
		setModfilter(option);
	};

	useEffect(() => {
		if (currentPage === 1) {
			setPrev(false);
		} else {
			setPrev(true);
		}
	}, [currentPage])

	useEffect(() => {
		if (currentPage === Math.ceil(displaySheets.length / cheatsheetPerPage)) {
			setNext(false);
		} else {
			setNext(true);
		}
	}, [currentPage])

	const paginate = pageNum => setCurrentPage(pageNum);

	const nextPage = () => setCurrentPage(currentPage + 1);

	const previousPage = () => setCurrentPage(currentPage - 1);

	console.log(currentPage)

	return (
		<div>
			<Container>
				{isText
					? <h3>Browse Cheatsheets</h3>
					: <div>
						<h3>{text}</h3>
					</div>
				}
				{isDropdown
					? <div id="gallery-toolbar">
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
					: <div></div>
				}
				<div className="gallery">
					{currentCard.map((cs, index) => (
						<CheatsheetCard key={index} sheet={cs} />
					))} */}
				</div>
				{isNumbering
					? <Pagination cheatsheetPerPage={cheatsheetPerPage} totalCount={displaySheets.length} paginate={paginate} nextPage={nextPage} previousPage={previousPage} isPrev={prev} isNext={next} currentPage={currentPage}></Pagination>
					: <div></div>
				}
			</Container>
		</div>
	);
}

export default Gallery;
