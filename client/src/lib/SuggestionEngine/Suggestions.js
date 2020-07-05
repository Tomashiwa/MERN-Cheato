import axios from "axios";

class Suggestions {
	async forUser(user) {
		const res = await axios.get(`/api/suggestions/toUser/${user.id}`);
		if (res.status === 404) {
			console.log(`Error encountered when finding suggestions`);
			console.log(`${res}`);
		} else {
			return res.data;
		}
	}

	async update(user) {
		const similarities = (await axios.get(`/api/similars/toUser/${user.id}`)).data;
		const unvotedSheets = (await axios.get(`/api/cheatsheets/withoutVotes/${user.id}`)).data;

		let suggestions = await Promise.all(
			unvotedSheets.map(async (unvotedSheet) => {
				const upvotedUsers = (
					await axios.get(`/api/cheatsheets/vote/${unvotedSheet._id}?type=upvote`)
				).data;
				const downvotedUsers = (
					await axios.get(`/api/cheatsheets/vote/${unvotedSheet._id}?type=downvote`)
				).data;

				let upvoteSimilarities = 0;
				let downvoteSimilarities = 0;

				upvotedUsers.forEach((upvotedUser) => {
					const similarUser = similarities.find(
						(similarity) => similarity.user === upvotedUser
					);
					upvoteSimilarities += similarUser.index;
				});

				downvotedUsers.forEach((downvotedUser) => {
					const similarUser = similarities.find(
						(similarity) => similarity.user === downvotedUser
					);
					downvoteSimilarities += similarUser.index;
				});

				let probability = 0.0;

				if (upvotedUsers.length + downvotedUsers.length !== 0) {
					probability =
						(upvoteSimilarities - downvoteSimilarities) /
						(upvotedUsers.length + downvotedUsers.length);
				}

				return { id: unvotedSheet._id, probability };
			})
		);

		// Sort by probability of whether the sheet will be liked
		// For sheets that have equal probability, they are randomly ordered
		suggestions.sort((a, b) => {
			if(a.probability < b.probability) {
				return 1;
			} else if(a.probability > b.probability) {
				return -1;
			} else {
				return Math.random() >= 0.5 ? 1 : -1;
			}
		});

		const suggestionRes = await axios.post(`/api/suggestions/toUser/${user.id}`, {
			suggestions,
		});
		if (suggestionRes.status === 404) {
			console.log("Error while submiting suggestions");
			console.log(suggestionRes);
		}
	}

	shuffle(array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}
}

export default Suggestions;
