import React, { useState } from 'react'

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
	const [modal, setModal] = useState(false);
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const [x, setX] = useState(0);
	const [y, setY] = useState(0);

	const toggle = () => setModal(!modal);
	const onChangeWidth = e => setWidth(e.target.value);
	const onChangeHeight = e => setHeight(e.target.value);
	const onChangeX = e => setX(e.target.value);
	const onChangeY = e => setY(e.target.value);

	const onSubmit = e => {
		e.preventDefault();
		const newRect = {
			width: width, 
			height: height,
			x: x,
			y: y
		};

		addRect(newRect);
		
		setModal(false);
		setWidth(0);
		setHeight(0);
		setX(0);
		setY(0);
	}

	//inline events are used as useEffect and useLayoutEffect did not work with toggleable DOM element (ie. Modal) 
	return (
		<div>
			<Button
				color="dark"
				style={{marginBottom: "2rem"}}
				onClick={toggle}
			>
				Add Rect
			</Button>
			<Modal
				isOpen={modal}
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
								onChange={onChangeWidth}/>
							<br></br>
							<Label for="rect">Height</Label>					
							<Input
								type="number"
								name="height"
								id="rect-height"
								placeholder="0"
								onChange={onChangeHeight}/>
							<br></br>
							<Label for="rect">X</Label>					
							<Input
								type="number"
								name="x"
								id="rect-x"
								placeholder="0"
								onChange={onChangeX}/>
							<br></br>
							<Label for="rect">Y</Label>					
							<Input
								type="number"
								name="y"
								id="rect-y"
								placeholder="0"
								onChange={onChangeY}/>
							<Button 
								color="dark" 
								style={{marginTop: "2rem"}}
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