import React, { useState, useEffect } from "react";
import { invalidSymbols } from "../misc/InvalidSymbols.js";
import axios from "axios";
import { Form, FormGroup, Label, Input, FormFeedback, FormText } from "reactstrap";
import CreatableSelect from "react-select/creatable";
import "./css/UploadForm.css";

function UploadForm({ form, setForm, setBlob, isAnonymous }) {
	const [schools, setSchools] = useState([]);
	const [modules, setModules] = useState([]);

	const [schoolOptions, setSchoolOptions] = useState([]);
	const [moduleOptions, setModuleOptions] = useState([]);

	const [nameState, setNameState] = useState({ valid: false, invalid: false });
	const [schState, setSchState] = useState({
		isLoading: false,
		isDisabled: false,
		selected: null,
	});
	const [modState, setModState] = useState({
		isLoading: false,
		isDisabled: false,
		selected: null,
	});

    // Test if name contains symbols that prevent a file from saving successfully
	const hasInvalidSymbols = (str) => {
		let isInvalid = false;
		for (let symbol of invalidSymbols) {
			if (str.includes(symbol)) {
				isInvalid = true;
				break;
			}
		}
		return isInvalid;
	};

    // Fetching schools and modules from server
	const fetchSchs = async (callback) => {
		try {
			const result = await axios.get("/api/schools");
			setSchools(result.data);
			callback();
		} catch (err) {
			console.log(`Fail to fetch schools: ${err}`);
		}
	};

	const fetchMods = async (callback) => {
		try {
			const result = await axios.get("/api/modules");
			setModules(result.data);
			callback();
		} catch (err) {
			console.log(`Fail to fetch modules: ${err}`);
		}
	};

	useEffect(() => {
		const fetchSchsAndMods = async () => {
			await fetchSchs();
			await fetchMods();
		};
		fetchSchsAndMods();
	}, []);

	// Create options based on fetched schools and modules
	useEffect(() => {
		setSchoolOptions(
			schools.map((school) => {
				return { label: school.name, value: school._id };
			})
		);
		setModuleOptions(
			modules
				.filter(
					(module) =>
						module.school &&
						schState.selected &&
						module.school === schState.selected.value
				)
				.map((module) => {
					return { label: `${module.code} - ${module.name}`, value: module._id };
				})
		);
	}, [schools, modules, schState.selected]);

	// Verify the name and save it to the form
    const saveName = (e) => setForm({ ...form, ...{ name: e.target.value } });

	const checkName = (e) => {
		const isValid = e.target.value.length && !hasInvalidSymbols(e.target.value);
		const isInvalid = e.target.value.length && hasInvalidSymbols(e.target.value);

		if (nameState.valid !== isValid || nameState.invalid !== isInvalid) {
			setNameState({ valid: isValid, invalid: isInvalid });
		}
	};

	// Saving the description to the form
    const saveDesc = (e) => setForm({ ...form, ...{ description: e.target.value } });

	// Saving the isPublic to the form
    const saveIsPublic = (e) => setForm({ ...form, ...{ isPublic: e.target.checked } });

    useEffect(() => {
        const isPublicInput = document.querySelector("#uploadform-input-public");
        
        if(isPublicInput && isAnonymous && !form.isPublic) {
			isPublicInput.setAttribute("checked", isAnonymous);
			isPublicInput.setAttribute("disabled", isAnonymous);
			setForm({ ...form, ...{ isPublic: true } });
		}
	}, [form, setForm, isAnonymous]);

	// Save image input as blob
	const saveFileAsBlob = (e) => {
		const file = e.target.files[0];
		setBlob(file);
	};

	// Save a selected school to the form
	const saveSchool = (option) => {
		if (option) {
			setSchState({
				...schState,
				...{ selected: { label: option.label, value: option.value } },
			});
			setModState({ ...modState, ...{ selected: null } });
			setForm({ ...form, ...{ school: option.value } });
		}
	};

	// Save a selected module to the form
	const saveModule = (option) => {
		if (option) {
			setModState({
				...modState,
				...{ selected: { label: option.label, value: option.value } },
			});
			setForm({ ...form, ...{ module: option.value } });
		}
	};

	// Add new school to the backend
	const addSchool = (value) => {
		const newSchool = { name: value };

		setSchState({ ...schState, ...{ isDisabled: true, isLoading: true } });

		axios
			.post("/api/schools", newSchool)
			.then((res) => {
				fetchSchs(() => {
					setSchState({
						isDisabled: false,
						isLoading: false,
						selected: { label: value, value: value },
					});
					setForm({ ...form, ...{ school: value } });
				});
			})
			.catch((err) => console.log(`Fail to add school: ${err}`));
	};

	// Add new module to the backend
	const addModule = (value) => {
		const newModule = { school: schState.selected.value, code: value, name: value };

		setModState({ ...modState, ...{ isDisabled: true, isLoading: true } });

		axios
			.post("/api/modules", newModule)
			.then((res) => {
				fetchMods(() => {
					setModState({
						isDisabled: false,
						isLoading: false,
						selected: { label: value, value: value },
					});
					setForm({ ...form, ...{ module: value } });
				});
			})
			.catch((err) => console.log(`Fail to add mod: ${err}`));
	};

	return (
		<Form id="form-upload">
			<FormGroup>
				<Label>File</Label>
				<Input
					id="uploadform-input-file"
					type="file"
					accept="image/*"
					onChange={saveFileAsBlob}
				/>
				<FormText>Choose an image file to be uploaded.</FormText>
			</FormGroup>
			<FormGroup>
				<Label>Name</Label>
				<Input
					id="uploadform-input-name"
					onInput={checkName}
					onChange={saveName}
					valid={nameState.valid ? true : false}
					invalid={nameState.invalid ? true : false}
				/>
				<FormFeedback invalid="true">Name cannot contains an invalid symbol.</FormFeedback>
				<FormText>Enter the name of your cheatsheet.</FormText>
			</FormGroup>
			<FormGroup>
				<Label>School</Label>
				<CreatableSelect
					id="uploadform-input-school"
					isClearable
					isDisabled={schState.isDisabled}
					isLoading={schState.isLoading}
					onChange={saveSchool}
					onCreateOption={addSchool}
					options={schoolOptions}
					value={schState.selected}
				/>
				<FormText>School that your cheatsheet is for.</FormText>
			</FormGroup>
			<FormGroup>
				<Label>Module</Label>
				<CreatableSelect
					id="uploadform-input-module"
					isClearable
					isDisabled={modState.isDisabled || schState.selected === null}
					isLoading={modState.isLoading}
					onChange={saveModule}
					onCreateOption={addModule}
					options={moduleOptions}
					value={modState.selected}
				/>
				<FormText>Module that your cheatsheet is for.</FormText>
			</FormGroup>
			<FormGroup>
				<Label>Description</Label>
				<Input id="uploadform-input-desc" type="textarea" onChange={saveDesc} />
				<FormText>Information that may help readers understand your cheatsheet.</FormText>
			</FormGroup>
			<FormGroup check>
				<Label check>
					<Input id="uploadform-input-public" type="checkbox" onChange={saveIsPublic}/> Share with public
				</Label>
			</FormGroup>
		</Form>
	);
}

export default UploadForm;
