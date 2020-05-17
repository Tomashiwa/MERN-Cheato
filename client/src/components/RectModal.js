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
	const [length, setLength] = useState(0);
	const [width, setWidth] = useState(0);

	const toggle = () => setModal(!modal);
	const onChangeLength = e => setLength(e.target.value);
	const onChangeWidth = e => setWidth(e.target.value);

	const onSubmit = e => {
		e.preventDefault();
		const newRect = {length: length, width: width};

		addRect(newRect);
		setModal(false);
		setLength(0);
		setWidth(0);
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
							<Label for="rect">Length</Label>					
							<Input
								type="number"
								name="length"
								id="rect-length"
								placeholder="0"
								onChange={onChangeLength}/>
							<br></br>
							<Label for="rect">Width</Label>					
							<Input
								type="number"
								name="width"
								id="rect-width"
								placeholder="0"
								onChange={onChangeWidth}/>
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