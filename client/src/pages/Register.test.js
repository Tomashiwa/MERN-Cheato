import React, { useState as useStateMock } from "react";
import mount from "enzyme/build/mount";
import Register from "./Register";
import UserContext from "../context/UserContext";

import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
	rest.post("/api/users/register", (req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ msg: "Register successful" }));
	}),
	rest.post("/api/auth", (req, res, ctx) => {
		return res(ctx.status(200), ctx.json({msg: "Auto-login successful"}));
	})
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

const userData = { token: undefined, user: undefined, isLoaded: false };
const setUserData = (newToken, newUser, newIsLoaded) => ({
	token: newToken,
	user: newUser,
	isLoaded: newIsLoaded,
});

// Login here link
test("Link to login page", () => {
	const wrapper = mount(
		<UserContext.Provider value={{ userData, setUserData }}>
			<Register />
		</UserContext.Provider>
	);

	const link = wrapper.find("a");
	expect(link.length).toBe(1);
	expect(link.prop("href")).toBe("/login");
});

// Successful registration

// Mocking history.push
const mockHistoryPush = jest.fn();

jest.mock(`react-router-dom`, () => ({
	...jest.requireActual("react-router-dom"),
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

test("Register successfully", async () => {
	const account = { username: "user123", password: "password" };

	const wrapper = mount(
		<UserContext.Provider value={{ userData, setUserData }}>
			<Register />
		</UserContext.Provider>,
		{ attachTo: document.body }
	);

	const nameInput = wrapper
		.find("#register-input-name")
		.hostNodes()
		.getDOMNode();
	const passInput = wrapper
		.find("#register-input-pass")
		.hostNodes()
		.getDOMNode();
	const confirmInput = wrapper
		.find("#register-input-confirmPass")
		.hostNodes()
		.getDOMNode();
	const form = wrapper.find("#register-form").hostNodes();

	nameInput.value = account.username;
	passInput.value = account.password;
	confirmInput.value = account.password;

	console.log(
		`name: ${nameInput.value}, pass: ${passInput.value}, confirm: ${confirmInput.value}`
	);
	console.log("Start submit");

	return form
		.prop("onSubmit")({ preventDefault: jest.fn() })
		.then((res) => {
			console.log("Finish Submit");
			console.log(res);
			expect(mockHistoryPush).toHaveBeenCalledWith("/");
		})
		.catch((err) => {
			console.log(err);
		});
});
