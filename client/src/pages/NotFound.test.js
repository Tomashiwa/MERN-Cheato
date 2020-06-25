import React from "react";
import NotFound from "./NotFound";
import { CardHeader, CardText, Button } from "reactstrap";
import mount from "enzyme/build/mount";

// Page not found Header
test("Header exists and is correct", () => {
	const wrapper = mount(<NotFound />);

	const header = wrapper.find(CardHeader);
	expect(header.length).toBe(1);

	const text = header.text();
	expect(text).toBe("Page not found");
});

// Message in the Card
test("Message exists and is correct", () => {
	const wrapper = mount(<NotFound />);

	const cardText = wrapper.find(CardText);
	expect(cardText.length).toBe(1);

	const text = cardText.text();
	expect(text).toBe(
		"The page you trying to acccess does not exist. Please try again or return to home."
	);
});

// Does clicking back-to-home button goes to home page
const mockHistoryPush = jest.fn();

jest.mock(`react-router-dom`, () => ({
	...jest.requireActual("react-router-dom"),
	useHistory: () => ({
		push: mockHistoryPush,
	}),
}));

test("Back-to-home button goes to home page", () => {
	const wrapper = mount(<NotFound />);

	const button = wrapper.find(Button);
	expect(button.length).toBe(1);

	button.simulate("click");
	expect(mockHistoryPush).toHaveBeenCalledWith("/");
});
