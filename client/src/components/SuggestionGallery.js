import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import CheatsheetCard from "./CheatsheetCard";

import { suggestTo, random } from "../lib/SuggestionEngine/Api";

import "./css/SuggestionGallery.css";

function SuggestionGallery({ align = "vertical", limit = 3 }) {
	const { userData } = useContext(UserContext);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		if(userData.isLoaded && userData.user) {
			axios.get(`/api/suggestions/toUser/${userData.user.id}/limit/${limit}`)
				.then(results => setSuggestions(results.data))
				.catch(err => console.log(`err`, err));
		} else {
			axios.post(`/api/suggestions/random/${limit}`, userData.user)
				.then(results => setSuggestions(results.data))
				.catch(err => console.log(`err`, err));
		}


		// const fetchSuggestions = async () => {
		// 	if(userData.isLoaded && userData.user) {
		// 		const result = await suggestTo(userData.user);
	
		// 		console.log(`Suggestions for user ${userData.user.name}`);
		// 		console.log(result);
	
		// 		if (result.length > 0) {
		// 			const suggestionIds = result.map((result) => result.id).slice(0, limit);
		// 			const sheetsRes = await Promise.allSettled(
		// 				suggestionIds.map((id) => axios.post(`/api/cheatsheets/${id}`, userData))
		// 			);
		// 			const sheets = sheetsRes.map((res) => res.value.data);	
		// 			setSuggestions(sheets);
		// 		}
		// 	} else {
		// 		const randomSheets = await random(limit);
		// 		setSuggestions(randomSheets);
		// 	}
		// };

		// fetchSuggestions();
	}, [limit, userData]);

	return (
		<div id="suggestion-gallery">
			<h5>Suggestions</h5>
			<div id="suggestion-gallery-line"/>
			<div id={`suggestion-gallery-${align}`}>
				{suggestions.map((suggestion, index) => (
					<CheatsheetCard key={index} sheet={suggestion} />
				))}
			</div>
		</div>
	);
}

export default SuggestionGallery;
