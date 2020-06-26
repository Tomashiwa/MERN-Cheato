import React from "react";
import mount from "enzyme/build/mount";
import UserContext from "../context/UserContext";
import { act } from "react-dom/test-utils";
import Upload from "./Upload";
import axios from "axios";
import { when } from "jest-when";

// Mock UserContext
const userData = { token: undefined, user: undefined, isLoaded: true };
const setUserData = (newToken, newUser, newIsLoaded) => ({
	token: newToken,
	user: newUser,
	isLoaded: newIsLoaded,
});

// Mock container
beforeEach(() => {
	const div = document.createElement("div");
	div.setAttribute("id", "mockContainer");
	document.body.appendChild(div);
});

afterEach(() => {
	const div = document.getElementById("mockContainer");
	if (div) {
		document.body.removeChild(div);
	}
});

// Creating new school and module
test("Filling upload form and accessing previewer", async () => {
	const axiosGetSpy = jest
		.spyOn(axios, "get")
		.mockResolvedValueOnce({
			status: 200,
			data: [
				{ _id: "1", name: "SCHOOL_1" },
				{ _id: "2", name: "SCHOOL_2" },
				{ _id: "3", name: "SCHOOL_3" },
			],
		})
		.mockResolvedValueOnce({
			status: 200,
			data: [
				{ _id: "1", name: "MODULE_1", school: "1" },
				{ _id: "2", name: "MODULE_2", school: "1" },
				{ _id: "3", name: "MODULE_3", school: "1" },
			],
		});

	const newSelectedSchool = {
		isDisabled: false,
		isLoading: false,
		selected: { label: "SCHOOL_1", value: "1" },
	};
	const newSelectedModule = {
		isDisabled: false,
		isLoading: false,
		selected: { label: "MODULE_1", value: "1" },
	};

	const newSchoolOptions = [
		{ label: "SCHOOL_1", value: "1" },
		{ label: "SCHOOL_2", value: "2" },
		{ label: "SCHOOL_3", value: "3" },
	];
	const newModuleOptions = [
		{ label: "MODULE_1", value: "1" },
		{ label: "MODULE_2", value: "2" },
		{ label: "MODULE_3", value: "3" },
	];

	const stateSetter = jest.fn();
	const useStateSpy = jest.spyOn(React, "useState");
	when(useStateSpy)
		.calledWith(newSelectedSchool)
		.mockImplementation((stateValue) => [(stateValue = newSelectedSchool), stateSetter]);
	when(useStateSpy)
		.calledWith(newSelectedModule)
		.mockImplementation((stateValue) => [(stateValue = newSelectedModule), stateSetter]);

	when(useStateSpy)
		.calledWith(newSchoolOptions)
		.mockImplementation((stateValue) => [(stateValue = newSchoolOptions), stateSetter]);
	when(useStateSpy)
		.calledWith(newModuleOptions)
		.mockImplementation((stateValue) => [(stateValue = newModuleOptions), stateSetter]);

	let wrapper,
		schoolSelector,
		schoolInput,
		schoolOption,
		moduleSelector,
		moduleInput,
		moduleOption,
		nameInput,
		fileInput;

	await act(async () => {
		wrapper = await mount(
			<UserContext.Provider value={{ userData, setUserData }}>
				<Upload />
			</UserContext.Provider>,
			{ attachTo: document.getElementById("mockContainer") }
		);
		await wrapper.update();
	});

	await act(async () => {
		schoolSelector = wrapper.find("#uploadform-input-school").hostNodes();
		schoolInput = schoolSelector.find("input");

		await schoolInput.simulate("focus");
		await schoolInput.prop("onChange")({ currentTarget: { value: "SCHOOL_1" } });
		await wrapper.update();
	});

	await act(async () => {
		schoolOption = wrapper.find("#react-select-2-option-0").hostNodes();

		await schoolOption.prop("onClick")();
		await wrapper.update();
	});

	await act(async () => {
		moduleSelector = wrapper.find("#uploadform-input-module").hostNodes();
		moduleInput = moduleSelector.find("input");

		await moduleSelector.simulate("focus");
		await moduleInput.prop("onChange")({ currentTarget: { value: "MODULE_1" } });
		await wrapper.update();
	});

	await act(async () => {
		moduleOption = wrapper.find("#react-select-3-option-0").hostNodes();

		await moduleOption.prop("onClick")();
		await wrapper.update();
	});

	await act(async () => {
		nameInput = wrapper.find("#uploadform-input-name").hostNodes();

		await nameInput.simulate("focus");
		await nameInput.simulate("change", { target: { value: "SHEET_NAME" } });
		await wrapper.update();
	});

	await act(async () => {
		fileInput = wrapper.find("#uploadform-input-file").hostNodes();

		await fileInput.simulate("change", {
			target: {
				files: [new File([""], "UPLOADED_IMAGE", { type: "image/jpeg" })],
			},
		});
	});

	await wrapper.update();

	expect(axiosGetSpy).toBeCalledWith("/api/schools");
	expect(axiosGetSpy).toBeCalledWith("/api/modules");

	expect(schoolSelector.html().includes("SCHOOL_1")).toBe(true);
	expect(moduleSelector.html().includes("MODULE_1")).toBe(true);

	expect(wrapper.find("#upload-btn-next").hostNodes().prop("disabled")).toBe(false);
});
