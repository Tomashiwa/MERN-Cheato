import React, { useState, useEffect } from "react";
import axios from "axios";

import Col from "reactstrap/lib/Col";
import Form from "reactstrap/lib/Form";
import FormGroup from "reactstrap/lib/FormGroup";
import Label from "reactstrap/lib/Label";
import Input from "reactstrap/lib/Input";
import FormFeedback from "reactstrap/lib/FormFeedback";
import FormText from "reactstrap/lib/FormText";

import { createFilter } from "react-select"
import {optimizeSelect} from "./OptimizedSelect";
import CreatableSelect from "react-select/creatable";

import { invalidSymbols } from "../misc/InvalidSymbols.js";

import "./css/UploadForm.css";

export const SELECT_STYLE = {
	option: (provided, state) => ({
		...provided,
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
	}),
};

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
	const fetchSchs = callback => {
        axios.get("/api/schools")
            .then(res => {
                setSchools(res.data);
                callback();
            })
            .catch(err => {
                console.log(`Fail to fetch Schools: ${err}`);
            });
    }

    const fetchModsBySchool = (schoolId, callback) => {
		axios
			.get(`/api/modules/bySchool/${schoolId}`)
			.then((result) => {
				setModules(result.data);
				callback();
			})
			.catch((err) => console.log("err", err));
	};

	useEffect(() => {
        fetchSchs();
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
					return { label: `${module.name}`, value: module._id };
				})
		);
	}, [schools, modules, schState.selected]);

	useEffect(() => {
		if(!modState.isSynced && form.school.length > 0 && form.module.length === 0) {
            fetchModsBySchool(form.school, () => {
				setModState({ isLoading: false, isDisabled: false, isSynced: true, selected: null });
			});
		}
    }, [modState, form.module, form.school]);

	// Verify the name and save it to the form
	const checkName = (e) => {
		const isValid = e.target.value.length && !hasInvalidSymbols(e.target.value);
		const isInvalid = e.target.value.length && hasInvalidSymbols(e.target.value);
		
		if (nameState.valid !== isValid || nameState.invalid !== isInvalid) {
			setNameState({ valid: isValid, invalid: isInvalid });
		}
	};
	
	const saveName = (e) => setForm({ ...form, ...{ name: e.target.value } });

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
			setModState({
				...modState,
				...{ isDisabled: true, isLoading: true, isSynced: false, selected: null },
			});
			setForm({ ...form, ...{ school: option.value, module: "" } });
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
						selected: { label: res.data.name, value: res.data._id },
					});
					setForm({ ...form, ...{ school: res.data._id } });
				});
			})
			.catch((err) => console.log(`Fail to add school: ${err}`));
	};

	// Add new module to the backend
	const addModule = (value) => {
		const newModule = { school: schState.selected.value, name: value };

		setModState({ ...modState, ...{ isDisabled: true, isLoading: true, isSynced: false } });

		axios
			.post("/api/modules", newModule)
			.then((res) => {
				fetchModsBySchool(schState.selected.value, () => {
					setModState({
						isDisabled: false,
						isLoading: false,
						isSynced: true,
						selected: { label: res.data.name, value: res.data._id },
					});
					setForm({ ...form, ...{ module: res.data._id } });
				});
			})
			.catch((err) => console.log(`Fail to add mod: ${err}`));
	};

	return (
		<Form id="form-upload">
			<FormGroup row>
				<Label sm={2}>File</Label>
				<Col sm={10}>
					<Input
						id="uploadform-input-file"
						type="file"
						accept="image/*"
						onChange={saveFileAsBlob}
					/>
					<FormText>Choose an image file to be uploaded.</FormText>
				</Col>
			</FormGroup>
			<FormGroup row>
				<Label sm={2}>Name</Label>
				<Col sm={10}>
					<Input
						id="uploadform-input-name"
						onInput={checkName}
						onChange={saveName}
						valid={nameState.valid ? true : false}
						invalid={nameState.invalid ? true : false}
					/>
					<FormFeedback invalid="true">Name cannot contains an invalid symbol.</FormFeedback>
					<FormText>Enter the name of your cheatsheet.</FormText>
				</Col>
			</FormGroup>
			<FormGroup row>
				<Label sm={2}>School</Label>
				<Col sm={10}>
					<CreatableSelect
						id="uploadform-input-school"
						isClearable
						isDisabled={schState.isDisabled}
						isLoading={schState.isLoading}
						onChange={saveSchool}
						onCreateOption={addSchool}
						options={schoolOptions}
						value={schState.selected}
						filterOption={createFilter({ignoreAccents: false})}
						components={optimizeSelect.components}
						styles={SELECT_STYLE}
					/>
					<FormText>Select a school that your cheatsheet is for. If none was found, you may enter your school name to create it.</FormText>
				</Col>
			</FormGroup>
			<FormGroup row>
				<Label sm={2}>Module</Label>
				<Col sm={10}>
					<CreatableSelect
						id="uploadform-input-module"
						isClearable
						isDisabled={modState.isDisabled || schState.selected === null}
						isLoading={modState.isLoading}
						onChange={saveModule}
						onCreateOption={addModule}
						options={moduleOptions}
						value={modState.selected}
						filterOption={createFilter({ignoreAccents: false})}
						components={optimizeSelect.components}
						styles={SELECT_STYLE}
					/>
					<FormText>Select a module that your cheatshet is for. If none was found, you may enter your module name to create it.</FormText>
				</Col>
			</FormGroup>
			<FormGroup row>
				<Label sm={2}>Description</Label>
				<Col sm={10}>
					<Input id="uploadform-input-desc" type="textarea" onChange={saveDesc} />
					<FormText>Information that may help others understand your cheatsheet.</FormText>
				</Col>
			</FormGroup>
			<FormGroup row check>
				<Label sm={10} check>
					<Input id="uploadform-input-public" type="checkbox" onChange={!isAnonymous ? saveIsPublic : ()=>{}}/> Share with public
				</Label>
			</FormGroup>
		</Form>
	);
}

export default UploadForm;
