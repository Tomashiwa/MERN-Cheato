import React from "react";
import mount from "enzyme/build/mount";
import UserContext from "../context/UserContext";
import Login from "./Login";
import axios from "axios";

import { server, rest } from "../mockServer";

// Mock UserContext
const userData = { token: undefined, user: undefined, isLoaded: false };
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

// Mocking history.push
const mockHistoryPush = jest.fn();
jest.mock(`react-router-dom/cjs/react-router-dom.min`, () => ({
	...jest.requireActual("react-router-dom/cjs/react-router-dom.min"),
	useHistory: () => ({
		push: mockHistoryPush,
	}),
}));

test("Redirecting to register page", () => {
	const wrapper = mount(
		<UserContext.Provider value={{ userData, setUserData }}>
			<Login />
		</UserContext.Provider>
	);

	const link = wrapper.find("a");
	expect(link.length).toBe(1);
	expect(link.prop("href")).toBe("/register");
});

test("Successful login", async () => {
	const account = { name: "user123", password: "password", isAdmin: false };

	const wrapper = mount(
		<UserContext.Provider value={{ userData, setUserData }}>
			<Login />
		</UserContext.Provider>,
		{ attachTo: document.getElementById("mockContainer") }
	);

	const nameInput = wrapper.find("#login-input-name").hostNodes().getDOMNode();
	const passInput = wrapper.find("#login-input-pass").hostNodes().getDOMNode();
	const form = wrapper.find("#login-form").hostNodes();

	nameInput.value = account.username;
	passInput.value = account.password;

	const axiosPostSpy = jest.spyOn(axios, "post")
		.mockResolvedValueOnce({
			status: 200,
			data: {
				token: "0123456789",
				user: { id: "abcdefgh", name: account.name, isAdmin: account.isAdmin },
			}
		});

	return form
		.prop("onSubmit")({ preventDefault: jest.fn() })
		.then((res) => {
			expect(mockHistoryPush).toHaveBeenCalledWith("/");
		})
		.catch((err) => {
			console.log(err);
		});
});
