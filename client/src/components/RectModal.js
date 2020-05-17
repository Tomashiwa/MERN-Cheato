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

	const toggle = () => setModal(!modal);
	const onChangeWidth = e => setWidth(e.target.value);
	const onChangeHeight = e => setHeight(e.target.value);

	const onSubmit = e => {
		e.preventDefault();
		const newRect = {width: width, height: height};

		addRect(newRect);
		setModal(false);
		setWidth(0);
		setHeight(0);
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