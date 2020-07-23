import React, { useState as useStateMock } from "react";
import mount from "enzyme/build/mount";
import Register from "./Register";
import UserContext from "../context/UserContext";
import axios from "axios";

import { server, rest } from "../mockServer";

// Mock UserContext
const userData = { token: undefined, user: undefined, isLoaded: false };
const setUserData = (newToken, newUser, newIsLoaded) => ({
	token: newToken,
	user: newUser,
	isLoaded: newIsLoaded,
});

// Mocking history.push
const mockHistoryPush = jest.fn();
jest.mock(`react-router-dom/cjs/react-router-dom.min`, () => ({
	...jest.requireActual(`react-router-dom/cjs/react-router-dom.min`),
	useHistory: () => ({
		push: mockHistoryPush,
	}),
}));

// Mock setState
jest.mock("react", () => ({
	...jest.requireActual("react"),
	useState: jest.fn(),
}));
const setState = jest.fn();
useStateMock.mockImplementation((init) => [init, setState]);

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

test("Redirecting to login page", () => {
	const wrapper = mount(
		<UserContext.Provider value={{ userData, setUserData }}>
			<Register />
		</UserContext.Provider>
	);

	const link = wrapper.find("a");
	expect(link.length).toBe(1);
	expect(link.prop("href")).toBe("/login");
});

test("Successful register", async () => {
	const account = { name: "user123", password: "password", isAdmin: false };

	const wrapper = mount(
		<UserContext.Provider value={{ userData, setUserData }}>
			<Register />
		</UserContext.Provider>,
		{ attachTo: document.getElementById("mockContainer") }
	);

	const nameInput = wrapper.find("#register-input-name").hostNodes().getDOMNode();
	const passInput = wrapper.find("#register-input-pass").hostNodes().getDOMNode();
	const confirmInput = wrapper.find("#register-input-confirmPass").hostNodes().getDOMNode();
	const form = wrapper.find("#register-form").hostNodes();

	nameInput.value = account.name;
	passInput.value = account.password;
	confirmInput.value = account.password;

	const axiosPostSpy = jest.spyOn(axios, "post")
		.mockResolvedValueOnce({
			status: 200,
			data: {
				token: "0123456789",
				user: { id: "abcdefgh", name: account.name, isAdmin: account.isAdmin },
			},
		})
		.mockResolvedValueOnce({
			status: 200,
			data: {
				token: "0123456789",
				user: { id: "abcdefgh", name: account.name, isAdmin: account.isAdmin },
			}
		})

	return form
		.prop("onSubmit")({ preventDefault: jest.fn() })
		.then((res) => {
			expect(mockHistoryPush).toHaveBeenCalledWith("/");
		})
		.catch((err) => {
			console.log(err);
		});
});
