import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import CheatsheetCard from "./CheatsheetCard";
import SuggestionContext from "../context/SuggestionContext";

import "./css/SuggestionGallery.css";

function SuggestionGallery({ align = "vertical", limit = 3 }) {
	const { userData } = useContext(UserContext);
	const { engine } = useContext(SuggestionContext);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		const fetchSuggestions = async () => {
			const result = await engine.suggestTo(userData.user);

			console.log(`Suggestions for user ${userData.user.name}`);
			console.log(result);

			if (result.length > 0) {
				const suggestionIds = result.map((result) => result.id).slice(0, limit);
				const sheetsRes = await Promise.allSettled(
					suggestionIds.map((id) => axios.post(`/api/cheatsheets/${id}`, userData))
				);
				const sheets = sheetsRes.map((res) => res.value.data);

				console.log("Suggestions presented:");
				console.log(sheets);

				setSuggestions(sheets);
			}
		};

		fetchSuggestions();
	}, [limit, userData, engine]);

	return (
		<div>
			<div>Suggestions</div>
			<div id={`suggestions-gallery-${align}`}>
				{suggestions.map((suggestion, index) => (
					<CheatsheetCard key={index} sheet={suggestion} />
				))}
			</div>
		</div>
	);
}

export default SuggestionGallery;
