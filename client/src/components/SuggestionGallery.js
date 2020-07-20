import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

import Container from "reactstrap/lib/Container";

import UserContext from "../context/UserContext";
import CheatsheetCard from "./CheatsheetCard";

import "./css/SuggestionGallery.css";

function SuggestionGallery({ align = "vertical", limit = 3, filter = [] }) {
	const { userData } = useContext(UserContext);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		if(userData.isLoaded && userData.user) {
			axios.post(`/api/suggestions/toUser/${userData.user.id}/limit/${limit + 1}`, userData.user)
				.then(results => {
					let givenSuggestions = results.data
						.filter(suggestion => !filter.includes(suggestion.id))
						.slice(0, limit);
					setSuggestions(givenSuggestions);
				})
				.catch(err => console.log(`err`, err));
		} else {
			axios.post(`/api/suggestions/random/${limit + 1}`, userData.user)
				.then(results => {
					let givenSuggestions = results.data
						.filter(suggestion => !filter.includes(suggestion.id))
						.slice(0, limit);
					setSuggestions(givenSuggestions)
				})
				.catch(err => console.log(`err`, err));
		}
	}, [limit, filter, userData]);

	return (
		<Container id="suggestion-gallery">
			{
				suggestions.length > 0
				?	<div> 
						<h5>Suggestions</h5>
							<div id="suggestion-gallery-line"/>
							<div id={`suggestion-gallery-${align}`}>
							{suggestions.map((suggestion, index) => (
								<CheatsheetCard key={index} sheet={suggestion} />
							))}
						</div>
					</div>
				: 	<></>
			}
		</Container>
	);
}

export default SuggestionGallery;
