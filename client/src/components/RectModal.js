import React, { Component } from 'react';
// import axios from "axios";

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

class ItemModal extends Component {
	state = { 
		modal: false,
		length: 0,
		width: 0
	}

	toggle = () => this.setState({modal: !this.state.modal});

	onChange = e => {
		this.setState({[e.target.name]: e.target.value});
	}

	onSubmit = e => {
		e.preventDefault();

		const newRect = {
			length: this.state.length,
			width: this.state.width
		}

		this.props.addRect(newRect);

		this.setState({
			modal: false,
			length: 0,
			width: 0
		});
	}

	render() { 
		return (
			<div>
				<Button
					color="dark"
					style={{marginBottom: "2rem"}}
					onClick={this.toggle}
				>
					Add Rect
				</Button>

				<Modal
					isOpen={this.state.modal}
					toggle={this.toggle}
				>
					<ModalHeader toggle={this.toggle}>Add to Rectangle List</ModalHeader>
					<ModalBody>
						<Form onSubmit={this.onSubmit}>
							<FormGroup>
								<Label for="rect">New rectangle's dimension</Label>
								<br></br>
								<Label for="rect">Length</Label>					
								<Input
									type="number"
									name="length"
									id="rect"
									placeholder="0"
									onChange={this.onChange}/>
								<br></br>
								<Label for="rect">Width</Label>					
								<Input
									type="number"
									name="width"
									id="rect"
									placeholder="0"
									onChange={this.onChange}/>
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
		);
	}
}
 
export default ItemModal;