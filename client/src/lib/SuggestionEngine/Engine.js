const axios = require("axios");
const mongoose = require("mongoose");

const url =
	process.env.NODE_ENV !== "production"
		? "http://localhost:5000"
		: "https://stormy-journey-99385.herokuapp.com";

const updateSimilars = async (user) => {
	// IDs of all existing users
	const otherUsers = (
		await axios.get(`${url}/api/users/`).catch((err) => console.log("err", err))
	).data.filter((otherUser) => otherUser._id !== user.id);

	// Set of IDS for user's upvoted and downvoted sheets
	const upvotedSheets = (await axios.get(`${url}/api/users/vote/${user.id}?type=upvote`)).data;
	const downvotedSheets = (await axios.get(`${url}/api/users/vote/${user.id}?type=downvote`))
		.data;

	let similarities = otherUsers.map((otherUser) => {
		return { id: otherUser._id, index: 0.0 };
	});

	// Array of IDs for other others that voted for the same cheatsheets as the user
	let otherVotedUsers = [];
	(
		await Promise.all(
			(await axios.get(`${url}/api/users/vote/${user.id}`)).data.map((sheet) =>
				axios.get(`${url}/api/cheatsheets/vote/${sheet}`)
			)
		)
	).forEach((res) => {
		res.data.forEach((id) => {
			if (otherVotedUsers.indexOf(id) === -1 && id !== user.id) {
				otherVotedUsers.push(id);
			}
		});
	});

	for (const otherVotedUser of otherVotedUsers) {
		const otherUpvotedSheets = (
			await axios.get(`${url}/api/users/vote/${otherVotedUser}?type=upvote`)
		).data;
		const otherDownvotedSheets = (
			await axios.get(`${url}/api/users/vote/${otherVotedUser}?type=downvote`)
		).data;

		const similarity =
			(upvotedSheets.filter((sheet) => otherUpvotedSheets.indexOf(sheet) !== -1).length +
				downvotedSheets.filter((sheet) => otherDownvotedSheets.indexOf(sheet) !== -1)
					.length -
				upvotedSheets.filter((sheet) => otherDownvotedSheets.indexOf(sheet) !== -1).length -
				downvotedSheets.filter((sheet) => otherUpvotedSheets.indexOf(sheet) !== -1)
					.length) /
			[
				...new Set(
					upvotedSheets
						.concat(otherUpvotedSheets)
						.concat(downvotedSheets)
						.concat(otherDownvotedSheets)
				),
			].length;

		const replaceAt = similarities.findIndex((entry) => otherVotedUser === entry.id);
		similarities[replaceAt] = { id: otherVotedUser, index: similarity };
	}

	const similaritiesRes = await axios.post(`${url}/api/similars/toUser/${user.id}`, {
		similarities: similarities.map((entry) => {
			return { user: mongoose.Types.ObjectId(entry.id), index: entry.index };
		}),
	});
	if (similaritiesRes.status === 200) {
	} else {
		console.log("Error in saving similarities:");
		console.log(similaritiesRes);
	}
};

const updateSuggestions = async (user) => {
	const similarities = (await axios.get(`${url}/api/similars/toUser/${user.id}`)).data;
	const unvotedSheets = (await axios.get(`${url}/api/cheatsheets/withoutVotes/${user.id}`)).data;

	let suggestions = await Promise.all(
		unvotedSheets.map(async (unvotedSheet) => {
			const upvotedUsers = (
				await axios.get(`${url}/api/cheatsheets/vote/${unvotedSheet._id}?type=upvote`)
			).data;
			const downvotedUsers = (
				await axios.get(`${url}/api/cheatsheets/vote/${unvotedSheet._id}?type=downvote`)
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
		if (a.probability < b.probability) {
			return 1;
		} else if (a.probability > b.probability) {
			return -1;
		} else {
			return Math.random() >= 0.5 ? 1 : -1;
		}
	});

	const suggestionRes = await axios.post(`${url}/api/suggestions/toUser/${user.id}`, {
		suggestions,
	});
	if (suggestionRes.status === 404) {
		console.log("Error while submiting suggestions");
		console.log(suggestionRes);
	}
};

module.exports = {
	update: async (user) => {
		console.log("Updating engine...");

		await updateSimilars(user);
		console.log("Similars updated");

		await updateSuggestions(user);
		console.log("Suggestions updated");
	},
};
