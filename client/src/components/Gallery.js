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

function Gallery() {
    const {userData} = useContext(UserContext);

	const [sortOrder, setSortOrder] = useState("dateTime");
	const [schFilter, setSchFilter] = useState("");
	const [modFilter, setModfilter] = useState("");

	const [sheets, setSheets] = useState([]);
	const [displaySheets, setDisplaySheets] = useState([]);

	const [schOpts, setSchOpts] = useState([]);
	const [modOpts, setModOpts] = useState([]);

	useEffect(() => {
		const postConfig = { headers: { "Content-Type": "application/json" } };

		const userInfo = userData.user !== undefined ? userData.user : null;

		axios.post("/api/cheatsheets", userInfo, postConfig).then((res) => {
			setSheets(res.data);
			setDisplaySheets(res.data);
		});

		axios
			.get("/api/schools")
			.then((res) => {
				const schools = res.data;
				const options = schools.map((school) => {
					return { label: school.name, value: school._id };
				});
				options.unshift({ label: "Select...", value: "" });

				setSchOpts(options);
			})
			.catch((err) => {
				console.log(`Fail to fetch Schools: ${err}`);
			});
	}, []);

	useEffect(() => {
		console.log(`By school: ${schFilter}`);

		if (schFilter.length > 0) {
			axios.get(`/api/modules/bySchool/${schFilter}`).then((res) => {
				const modules = res.data;
				const options = modules.map((module) => {
					return { label: module.name, value: module._id };
				});
				options.unshift({ label: "Select...", value: "" });
				setModOpts(options);
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

		if (schFilter.length > 0) {
			sortedSheets = sortedSheets.filter((sheet) => sheet.school === schFilter);
		}

		if (modFilter.length > 0) {
			sortedSheets = sortedSheets.filter((sheet) => sheet.module === modFilter);
		}

		setDisplaySheets(sortedSheets);
	}, [sortOrder, schFilter, modFilter, sheets]);

	const changeSort = (option) => {
		setSortOrder(option.value);
	};

	const changeSch = (option) => {
		setSchFilter(option.value);
		setModfilter("");
	};

	const changeMod = (option) => {
		setModfilter(option.value);
	};

	return (
		<div>
			<Container>
				<h3>Browse Cheatsheets</h3>

				<div id="gallery-toolbar">
					<div className="gallery-tool-group">
						<div className="gallery-tool-label">School</div>
						<Select
							className="gallery-tool-select"
							defaultValue={schOpts[0]}
							options={schOpts}
							isClearable={false}
							isSearchable={false}
							onChange={changeSch}
							auto
						/>
					</div>
					<div className="gallery-tool-group">
						<div className="gallery-tool-label">Module</div>
						<Select
							className="gallery-tool-select"
							defaultValue={modOpts[0]}
							options={modOpts}
							isDisabled={modOpts.length === 0}
							isClearable={false}
							isSearchable={true}
							onChange={changeMod}
							filterOption={createFilter({ ignoreAccents: false })}
							components={optimizeSelect.components}
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
						/>
					</div>
				</div>

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
