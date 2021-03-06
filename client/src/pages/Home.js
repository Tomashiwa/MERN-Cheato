import React from "react";

import Container from "reactstrap/lib/Container";
import Gallery from "../components/Gallery";

import "./css/Home.css";

function Home() {
	return (
		<div>
			<Container>
				<h3>Browse Cheatsheets</h3>
				<div className="home-divider" />
				<Gallery />
			</Container>
		</div>
	);
}

export default Home;
