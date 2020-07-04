import axios from "axios";
import mongoose from "mongoose";

class Similars {
	async byUser(user) {
		const res = await axios.get(`/api/similars/toUser/${user.id}`);
		if (res.status === 404) {
			console.log(`error: ${res}`);
			return res;
		} else {
			return res.data;
		}
	}

	async update(user) {
		// IDs of all existing users
		const otherUsers = (await axios.get("/api/users/")).data.filter(otherUser => otherUser._id !== user.id);

		// Set of IDS for user's upvoted and downvoted sheets
		const upvotedSheets = (await axios.get(`/api/users/vote/${user.id}?type=upvote`)).data;
		const downvotedSheets = (await axios.get(`/api/users/vote/${user.id}?type=downvote`)).data;

		let similarities = otherUsers.map(otherUser => {
			return { id: otherUser._id, index: 0.0 };
		});

		// Array of IDs for other others that voted for the same cheatsheets as the user
		let otherVotedUsers = [];
		(
			await Promise.all(
				(await axios.get(`/api/users/vote/${user.id}`)).data.map((sheet) =>
					axios.get(`/api/cheatsheets/vote/${sheet}`)
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
				await axios.get(`/api/users/vote/${otherVotedUser}?type=upvote`)
			).data;
			const otherDownvotedSheets = (
				await axios.get(`/api/users/vote/${otherVotedUser}?type=downvote`)
			).data;

			const similarity =
				(upvotedSheets.filter((sheet) => otherUpvotedSheets.indexOf(sheet) !== -1).length +
					downvotedSheets.filter((sheet) => otherDownvotedSheets.indexOf(sheet) !== -1)
						.length -
					upvotedSheets.filter((sheet) => otherDownvotedSheets.indexOf(sheet) !== -1)
						.length -
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

			const replaceAt = similarities.findIndex(entry => otherVotedUser === entry.id);
			similarities[replaceAt] = {id: otherVotedUser, index: similarity};
		}

		const similaritiesRes = await axios.post(`/api/similars/toUser/${user.id}`, {
			similarities: similarities.map(entry => {return {user: mongoose.Types.ObjectId(entry.id), index: entry.index}})
		});
		if (similaritiesRes.status === 200) {
		} else {
			console.log("Error in saving similarities:");
			console.log(similaritiesRes);
		}
	}
}

export default Similars;
