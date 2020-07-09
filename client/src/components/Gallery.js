import React, { useState, useEffect, useContext } from "react";

import Select from "react-select";
import { optimizeSelect } from "./OptimizedSelect";
import { createFilter } from "react-select";

import CheatsheetCard from "../components/CheatsheetCard";

import axios from "axios";
import "./css/Gallery.css";
import Container from "reactstrap/lib/Container";
import UserContext from "../context/UserContext";

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

function Gallery({ cheatsheetArray = [], text = "", dropdown = true }) {
	const { userData } = useContext(UserContext);

	const [sortOrder, setSortOrder] = useState("dateTime");
	const [schFilter, setSchFilter] = useState(null);
	const [modFilter, setModfilter] = useState(null);

	const [sheets, setSheets] = useState([]);
	const [displaySheets, setDisplaySheets] = useState([]);

	const [schOpts, setSchOpts] = useState([]);
	const [modOpts, setModOpts] = useState([]);

	const [schLoading, setSchLoading] = useState(false);
	const [modLoading, setModLoading] = useState(false);
	console.log(cheatsheetArray)

	const isText = (text === "");

	const isDropdown = (dropdown === true);
	console.log(isText)

	useEffect(() => {
		const postConfig = { headers: { "Content-Type": "application/json" } };

		const userInfo = userData.user !== undefined ? userData.user : null;
		if (cheatsheetArray === null || cheatsheetArray.length === 0) {
			axios.post("/api/cheatsheets", userInfo, postConfig).then((res) => {
				setSheets(res.data);
				setDisplaySheets(res.data);
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
					{displaySheets.map((cs, index) => (
						<CheatsheetCard key={index} sheet={cs} />
					))}
				</div>
			</Container>
		</div>
	);
}

export default Gallery;
