import React from "react";
import { shallow } from "enzyme";
import Home from "./Home";

it("Should have span", () => {
    const wrapper = shallow(<Home />);
    const span = wrapper.find("span"); 
    const result = span.text();
    
    // expect(result).toBe("Span testing");
    expect(wrapper.find("span").length).toBe(1);
})