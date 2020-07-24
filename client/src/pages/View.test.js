import React from "react";
import { act } from "react-dom/test-utils";
import mount from "enzyme/build/mount";
import View from "./View";
import UserContext from "../context/UserContext";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

// Mock UserContext
const userData = { token: undefined, user: undefined, isLoaded: true };
const setUserData = (newToken, newUser, newIsLoaded) => ({
	token: newToken,
	user: newUser,
	isLoaded: newIsLoaded,
});

// Mock useParam to get sheet ID for viewing
jest.mock("react-router-dom/cjs/react-router-dom.min", () => ({
	...jest.requireActual("react-router-dom/cjs/react-router-dom.min"),
	useParams: () => ({
		id: "123456789",
	}),
	useRouteMatch: () => ({ url: "/api/cheatsheets/view/123456789" }),
}));

jest.mock("axios");

let postError = new Error("Suggestions cannot be found");
postError.status = 404;
postError.response = { data: { msg: "Suggestions cannot be found" } };

let getError = new Error("Comments cannot be found");
getError.status = 404;
getError.response = { data: { msg: "Comments cannot be found" } };

describe("Fetching sheets", () => {
	test("View sheet when logged in", async () => {
		axios.post
			.mockResolvedValueOnce({
				status: 200,
				data: {
					id: "123456789",
					name: "SHEET_NAME",
					file: "https://cheato.s3.ap-southeast-1.amazonaws.com/123456789.png",
					author: "123456789",
					authorName: "AUTHOR_NAME",
					school: "SCHOOL_NAME",
					module: "MODULE_NAME",
					description: "SHEET_DESCRIPTION",
					upvotedUsers: [],
					downvotedUsers: [],
					rating: 0,
					hasBookmarked: false,
				},
			})
			.mockRejectedValueOnce(postError);

		axios.get.mockRejectedValueOnce(getError);

		const div = document.createElement("div");
		document.body.appendChild(div);

		let wrapper;

		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>,
				{ attachTo: div }
			);

			await wrapper.update();
		});

		expect(wrapper.html().includes('<div id="view-container" class="container">')).toBe(true);
		expect(wrapper.html().includes("<h2>SHEET_NAME</h2>")).toBe(true);
		expect(wrapper.html().includes("<h5>SCHOOL_NAME - MODULE_NAME</h5>")).toBe(true);
		expect(
			wrapper
				.html()
				.includes(
					'<button type="button" id="view-author" class="btn btn-link">AUTHOR_NAME</button>'
				)
		).toBe(true);
	});

	test("Viewing inaccessible sheet", async () => {
		let inaccessibleErr = new Error("This cheatsheet is private");
		inaccessibleErr.status = 404;
		inaccessibleErr.response = { data: { msg: "This cheatsheet is private" } };

		axios.post.mockRejectedValueOnce(inaccessibleErr);

		axios.get.mockRejectedValueOnce(getError);

		const div = document.createElement("div");
		document.body.appendChild(div);

		let wrapper;

		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>,
				{ attachTo: div }
			);

			await wrapper.update();
		});

		expect(wrapper.html().includes('<div id="view-container-error" class="container">')).toBe(
			true
		);
		expect(
			wrapper.html().includes('<h3 class="card-header">This cheatsheet is private</h3>')
		).toBe(true);
		expect(
			wrapper
				.html()
				.includes(
					`<p class="card-text">If you are the owner of this sheet, please try again after logging in <a href="/login">here</a>.</p>`
				)
		).toBe(true);
	});

	test("View sheet that does not exist", async () => {
		let postError = new Error("No cheatsheet founde");
		postError.status = 404;
		postError.response = { data: { msg: "No cheatsheet found" } };

		// const axiosPostSpy = jest.spyOn(axios, "post")
		axios.post.mockRejectedValueOnce(postError);

		const div = document.createElement("div");
		document.body.appendChild(div);

		let wrapper;

		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>,
				{ attachTo: div }
			);

			await wrapper.update();
		});

		expect(wrapper.html().includes('<div id="view-container-error" class="container">')).toBe(
			true
		);
		expect(wrapper.html().includes('<h3 class="card-header">No cheatsheet found</h3>')).toBe(
			true
		);
		expect(
			wrapper
				.html()
				.includes(
					`<p class="card-text">The cheatsheet you trying to acccess does not exist. You may try to find it in the search bar above.</p>`
				)
		).toBe(true);
	});

	test("Anonymous sheet", async () => {
		let getError = new Error("Comments cannot be found");
		getError.status = 404;
		getError.response = { data: { msg: "Comments cannot be found" } };

		axios.post
			.mockResolvedValueOnce({
				status: 200,
				data: {
					id: "123456789",
					name: "SHEET_NAME",
					file: "https://cheato.s3.ap-southeast-1.amazonaws.com/123456789.png",
					author: "",
					authorName: "ANONYMOUS",
					school: "SCHOOL_NAME",
					module: "MODULE_NAME",
					description: "SHEET_DESCRIPTION",
					upvotedUsers: [],
					downvotedUsers: [],
					rating: 0,
					hasBookmarked: false,
				},
			})
			.mockRejectedValueOnce(postError);

		axios.get.mockRejectedValueOnce(getError);

		const div = document.createElement("div");
		document.body.appendChild(div);

		let wrapper;

		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>,
				{ attachTo: div }
			);

			await wrapper.update();
		});

		expect(wrapper.html().includes('<div id="view-container" class="container">')).toBe(true);
		expect(wrapper.html().includes("<h2>SHEET_NAME</h2>")).toBe(true);
		expect(wrapper.html().includes("<h5>SCHOOL_NAME - MODULE_NAME</h5>")).toBe(true);
		expect(
			wrapper
				.html()
				.includes(
					'<button type="button" id="view-author" class="btn btn-link">ANONYMOUS</button>'
				)
		).toBe(true);
	});
});
