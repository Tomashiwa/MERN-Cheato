import React from "react";
import { act } from "react-dom/test-utils";
import mount from "enzyme/build/mount";
import View from "./View";
import UserContext from "../context/UserContext";
import axios from "axios";

// Mock UserContext
const userData = { token: undefined, user: undefined, isLoaded: true };
const setUserData = (newToken, newUser, newIsLoaded) => ({
	token: newToken,
	user: newUser,
	isLoaded: newIsLoaded,
});

// Mock useParam to get sheet ID for viewing
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useParams: () => ({
		id: "123456789",
	}),
	useRouteMatch: () => ({ url: "/api/cheatsheets/123456789" }),
}));

describe("Fetching sheets", () => {
	test("Public sheet", async () => {
		const axiosPostSpy = jest.spyOn(axios, "post").mockResolvedValueOnce({
			status: 200,
			data: {
				comments: [],
				datetime: "2020-06-18T07:39:21.799Z",
				file: "https://cheato.s3.ap-southeast-1.amazonaws.com/123456789.png",
				isAnonymous: false,
				isPublic: true,
				name: "SHEET_NAME",
				module: "123456789",
				school: "123456789",
				rating: 0,
				user: "123456789",
				_id: "123456789",
			},
		});

		const axiosGetSpy = jest
			.spyOn(axios, "get")
			.mockResolvedValueOnce({
				status: 200,
				data: {
					name: "SCHOOL_NAME",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					code: "MODULE_CODE",
					name: "MODULE_NAME",
					school: "123456789",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					bookmarks: [],
					isAdmin: false,
					name: "OWNER_NAME",
					password: "OWNER_PASSWORD",
					_id: "123456789",
				},
			});

		let wrapper;
		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>
			);

			await wrapper.update();
		});

		expect(axiosPostSpy).toBeCalledWith("/api/cheatsheets/123456789", userData.user);
		expect(axiosGetSpy).toBeCalledWith("/api/schools/123456789");
		expect(axiosGetSpy).toBeCalledWith("/api/modules/123456789");
		expect(axiosGetSpy).toBeCalledWith("/api/users/123456789");

		expect(wrapper.html().includes('<div id="view-container" class="container">')).toBe(true);
		expect(wrapper.html().includes("<h2>SHEET_NAME</h2>")).toBe(true);
		expect(wrapper.html().includes("<h5>SCHOOL_NAME - MODULE_NAME</h5>")).toBe(true);
		expect(wrapper.html().includes("<h5>Uploaded by: OWNER_NAME</h5>")).toBe(true);
	});

	test("Accessing private sheet w/ owner", async () => {
		const axiosPostSpy = jest.spyOn(axios, "post").mockResolvedValueOnce({
			status: 200,
			data: {
				comments: [],
				datetime: "2020-06-18T07:39:21.799Z",
				file: "https://cheato.s3.ap-southeast-1.amazonaws.com/123456789.png",
				isAnonymous: false,
				isPublic: false,
				name: "SHEET_NAME",
				module: "123456789",
				school: "123456789",
				rating: 0,
				user: "123456789",
				_id: "123456789",
			},
		});

		const axiosGetSpy = jest
			.spyOn(axios, "get")
			.mockResolvedValueOnce({
				status: 200,
				data: {
					name: "SCHOOL_NAME",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					code: "MODULE_CODE",
					name: "MODULE_NAME",
					school: "123456789",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					bookmarks: [],
					isAdmin: false,
					name: "OWNER_NAME",
					password: "OWNER_PASSWORD",
					_id: "123456789",
				},
			});

		let wrapper;
		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>
			);

			await wrapper.update();
		});

		expect(wrapper.html().includes('<div id="view-container" class="container">')).toBe(true);
		expect(wrapper.html().includes("<h2>SHEET_NAME</h2>")).toBe(true);
		expect(wrapper.html().includes("<h5>SCHOOL_NAME - MODULE_NAME</h5>")).toBe(true);
		expect(wrapper.html().includes("<h5>Uploaded by: OWNER_NAME</h5>")).toBe(true);
	});

	test("Accessing private sheet w/ non-owner", async () => {
		let postError = new Error("This sheet is private");
		postError.status = 404;
		postError.response = { data: { msg: "This cheatsheet is private" } };

		const axiosPostSpy = jest.spyOn(axios, "post").mockRejectedValueOnce(postError);

		const axiosGetSpy = jest
			.spyOn(axios, "get")
			.mockResolvedValueOnce({
				status: 200,
				data: {
					name: "SCHOOL_NAME",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					code: "MODULE_CODE",
					name: "MODULE_NAME",
					school: "123456789",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					bookmarks: [],
					isAdmin: false,
					name: "OWNER_NAME",
					password: "OWNER_PASSWORD",
					_id: "123456789",
				},
			});

		let wrapper;
		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>
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

	test("Sheet not found", async () => {
		let postError = new Error("No cheatsheet founde");
		postError.status = 404;
		postError.response = { data: { msg: "No cheatsheet found" } };

		const axiosPostSpy = jest.spyOn(axios, "post").mockRejectedValueOnce(postError);

		const axiosGetSpy = jest
			.spyOn(axios, "get")
			.mockResolvedValueOnce({
				status: 200,
				data: {
					name: "SCHOOL_NAME",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					code: "MODULE_CODE",
					name: "MODULE_NAME",
					school: "123456789",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					bookmarks: [],
					isAdmin: false,
					name: "OWNER_NAME",
					password: "OWNER_PASSWORD",
					_id: "123456789",
				},
			});

		let wrapper;
		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>
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
		const axiosPostSpy = jest.spyOn(axios, "post").mockResolvedValueOnce({
			status: 200,
			data: {
				comments: [],
				datetime: "2020-06-18T07:39:21.799Z",
				file: "https://cheato.s3.ap-southeast-1.amazonaws.com/123456789.png",
				isAnonymous: true,
				isPublic: true,
				name: "SHEET_NAME",
				module: "123456789",
				school: "123456789",
				rating: 0,
				user: "123456789",
				_id: "123456789",
			},
		});

		const axiosGetSpy = jest
			.spyOn(axios, "get")
			.mockResolvedValueOnce({
				status: 200,
				data: {
					name: "SCHOOL_NAME",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					code: "MODULE_CODE",
					name: "MODULE_NAME",
					school: "123456789",
					_id: "123456789",
				},
			})
			.mockResolvedValueOnce({
				status: 200,
				data: {
					bookmarks: [],
					isAdmin: false,
					name: "OWNER_NAME",
					password: "OWNER_PASSWORD",
					_id: "123456789",
				},
			});

		let wrapper;
		await act(async () => {
			wrapper = await mount(
				<UserContext.Provider value={{ userData, setUserData }}>
					<View />
				</UserContext.Provider>
			);

			await wrapper.update();
		});

		expect(wrapper.html().includes('<div id="view-container" class="container">')).toBe(true);
		expect(wrapper.html().includes("<h2>SHEET_NAME</h2>")).toBe(true);
		expect(wrapper.html().includes("<h5>SCHOOL_NAME - MODULE_NAME</h5>")).toBe(true);
		expect(wrapper.html().includes("<h5>Uploaded by: Anonymous</h5>")).toBe(true);
	});
});
