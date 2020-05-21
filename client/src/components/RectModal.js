import React, { useReducer } from 'react'

import {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	Form,
	FormGroup,
	Label,
	Input
} from "reactstrap";

function RectModal({addRect}) {
	const initialState = {
		modal: false,
		width: 0,
		height: 0,
		x: 0,
		y: 0
	};

	const reducer = (state, action) => {
		switch(action.attribute) {
			case "modal":
				return {...state, ...{modal: !state.modal}};
			case "width":
				return {...state, ...{width: action.value}}
			case "height":
				return {...state, ...{height: action.value}}
			case "x":
				return {...state, ...{x: action.value}}
			case "y":
				return {...state, ...{y: action.value}}
			case "reset":
				return initialState;
			default:
				return state;
		}
	}

	const [state, dispatch] = useReducer(reducer, initialState);
	const toggle = () => dispatch({attribute: "modal", value: !state.modal});

	const onSubmit = e => {
		e.preventDefault();
		const newRect = {
			width: state.width,
			height: state.height,
			x: state.x,
			y: state.y
		};
		addRect(newRect);
		dispatch({attribute: "reset", value: 0});
	}

	//inline events are used as useEffect and useLayoutEffect did not work with toggleable DOM element (ie. Modal) 
	return (
		<div>
			<Button
				color="dark"
				style={{marginBottom: "32px"}}
				onClick={toggle}
			>
				Add Rect
			</Button>
			<Modal
				isOpen={state.modal}
				toggle={toggle}
			>
				<ModalHeader toggle={toggle}>Add to Rectangle List</ModalHeader>
				<ModalBody>
					<Form id="rect-form" onSubmit={onSubmit}>
						<FormGroup>
							<Label for="rect">New rectangle's dimension</Label>
							<br></br>
							<Label for="rect">Width</Label>					
							<Input
								type="number"
								name="width"
								id="rect-width"
								placeholder="0"
								onChange={e => dispatch({attribute: "width", value: e.target.value})}/>
							<br></br>
							<Label for="rect">Height</Label>					
							<Input
								type="number"
								name="height"
								id="rect-height"
								placeholder="0"
								onChange={e => dispatch({attribute: "height", value: e.target.value})}/>
							<br></br>
							<Label for="rect">X</Label>					
							<Input
								type="number"
								name="x"
								id="rect-x"
								placeholder="0"
								onChange={e => dispatch({attribute: "x", value: e.target.value})}/>
							<br></br>
							<Label for="rect">Y</Label>					
							<Input
								type="number"
								name="y"
								id="rect-y"
								placeholder="0"
								onChange={e => dispatch({attribute: "y", value: e.target.value})}/>
							<Button 
								color="dark" 
								style={{marginTop: "32px"}}
								block
							>
								Add rectangle
							</Button>                              
						</FormGroup>
					</Form>
				</ModalBody>
			</Modal>
		</div>
	)
}

export default RectModal;