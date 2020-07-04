import React, { useState, useEffect } from "react";
import { Form, FormGroup, Label, Input, FormFeedback, FormText } from "reactstrap";
import CreatableSelect from "react-select/creatable";
import Col from "reactstrap/lib/Col";
import { createFilter } from "react-select";
import { optimizeSelect } from "./OptimizedSelect";
import axios from "axios";
import { invalidSymbols } from "../misc/InvalidSymbols.js";

export const SELECT_STYLE = {
	option: (provided, state) => ({
		...provided,
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
	}),
};

function EditForm({ form, setForm, isAnonymous }) {
    const [nameState, setNameState] = useState({ valid: false, invalid: false });
    
	const [schools, setSchools] = useState([]);
	const [modules, setModules] = useState([]);
	const [schoolOptions, setSchoolOptions] = useState([]);
	const [moduleOptions, setModuleOptions] = useState([]);
	const [schState, setSchState] = useState({
		isLoading: false,
        isDisabled: false,
        isSynced: false,
		selected: null,
	});
	const [modState, setModState] = useState({
		isLoading: false,
        isDisabled: false,
        isSynced: false,
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
					return { label: `${module.name}`, value: module._id };
				})
		);
	}, [schools, modules, schState.selected]);

    useEffect(() => {
        if(!schState.isSynced && schoolOptions.length > 0 && form.school.length > 0) {
			console.log("Sync school options with form school");
			const selectedSchool = schoolOptions.find((option) => option.value === form.school);
			setSchState({ isLoading: false, isDisabled: false, isSynced: true, selected: selectedSchool });
        }
    }, [schState.isSynced, schoolOptions, form.school]);

    useEffect(() => {
		if (!modState.isSynced && moduleOptions.length > 0 && form.module.length > 0) {
			console.log("Sync module options with form module");
			const selectedModule = moduleOptions.find((option) => option.value === form.module);
			setModState({ isLoading: false, isDisabled: false, isSynced: true, selected: selectedModule });
		}
    }, [modState.isSynced, moduleOptions, form.module])

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

	// Save a selected school to the form
	const saveSchool = (option) => {
		if (option) {
			setSchState({
				...schState,
				...{ selected: { label: option.label, value: option.value } },
			});
			setModState({ ...modState, ...{ selected: null } });
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

		setModState({ ...modState, ...{ isDisabled: true, isLoading: true } });

		axios
			.post("/api/modules", newModule)
			.then((res) => {
				fetchMods(() => {
					setModState({
						isDisabled: false,
						isLoading: false,
						selected: { label: res.data.name, value: res.data._id },
					});
					setForm({ ...form, ...{ module: res.data._id } });
				});
			})
			.catch((err) => console.log(`Fail to add mod: ${err}`));
	};

	useEffect(() => {
		const isPublicInput = document.querySelector("#uploadform-input-public");

		if (isPublicInput && isAnonymous && !form.isPublic) {
			isPublicInput.setAttribute("checked", isAnonymous);
			isPublicInput.setAttribute("disabled", isAnonymous);
			setForm({ ...form, ...{ isPublic: true } });
		}
	}, [form, setForm, isAnonymous]);

	return (
		<Form id="form-edit">
			<FormGroup row>
				<Label sm={2}>Name</Label>
				<Col sm={10}>
					<Input
						id="editform-input-name"
						onInput={checkName}
						onChange={saveName}
						value={form.name}
						valid={nameState.valid ? true : false}
						invalid={nameState.invalid ? true : false}
					/>
					<FormFeedback invalid="true">
						Name cannot contains an invalid symbol.
					</FormFeedback>
					<FormText>Enter the name of your cheatsheet.</FormText>
				</Col>
			</FormGroup>
			<FormGroup row>
				<Label sm={2}>School</Label>
				<Col sm={10}>
					<CreatableSelect
						id="editform-input-school"
						isClearable
						isDisabled={schState.isDisabled || !schState.isSynced}
						isLoading={schState.isLoading || !schState.isSynced}
						onChange={saveSchool}
						onCreateOption={addSchool}
						options={schoolOptions}
						value={schState.selected}
						filterOption={createFilter({ ignoreAccents: false })}
						components={optimizeSelect.components}
						styles={SELECT_STYLE}
					/>
					<FormText>
						Select a school that your cheatsheet is for. If none was found, you may
						enter your school name to create it.
					</FormText>
				</Col>
			</FormGroup>
			<FormGroup row>
				<Label sm={2}>Module</Label>
				<Col sm={10}>
					<CreatableSelect
						id="editform-input-module"
						isClearable
						isDisabled={modState.isDisabled || schState.selected === null || !modState.isSynced}
						isLoading={modState.isLoading || !modState.isSynced}
						onChange={saveModule}
						onCreateOption={addModule}
						options={moduleOptions}
						value={modState.selected}
						filterOption={createFilter({ ignoreAccents: false })}
						components={optimizeSelect.components}
						styles={SELECT_STYLE}
					/>
					<FormText>
						Select a module that your cheatshet is for. If none was found, you may enter
						your module name to create it.
					</FormText>
				</Col>
			</FormGroup>
			<FormGroup row>
				<Label sm={2}>Description</Label>
				<Col sm={10}>
					<Input
						id="editform-input-desc"
						type="textarea"
						value={form.description}
						onChange={saveDesc}
					/>
					<FormText>
						Information that may help others understand your cheatsheet.
					</FormText>
				</Col>
			</FormGroup>
			<FormGroup row check>
				<Label sm={10} check>
					<Input
						id="editform-input-public"
						type="checkbox"
						checked={form.isPublic}
						// value={form.isPublic.toString()}
						onChange={!isAnonymous ? saveIsPublic : () => {}}
					/>{" "}
					Share with public
				</Label>
			</FormGroup>
		</Form>
	);
}

export default EditForm;
