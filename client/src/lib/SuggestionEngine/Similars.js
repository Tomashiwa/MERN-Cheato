import axios from "axios";
import mongoose from "mongoose";

class Similars {
	async byUser(user) {
		const res = await axios.get(`/api/similars/toUser/${user.id}`);
		if (res.status === 404) {
			console.log(`error: ${res}`);
			return res;
		} else {
			console.log(`Similar users to user ${user.id}`);
			console.log(res.data);
			return res.data;
		}
	}

	async update(user) {
		// IDs of all existing users
		const otherUsers = (await axios.get("/api/users/")).data.filter(otherUser => otherUser._id !== user.id);

		console.log("users (excluding self):");
		console.log(otherUsers);

		// Set of IDS for user's upvoted and downvoted sheets
		const upvotedSheets = (await axios.get(`/api/users/vote/${user.id}?type=upvote`)).data;
		const downvotedSheets = (await axios.get(`/api/users/vote/${user.id}?type=downvote`)).data;

		console.log("Upvoted sheets");
		console.log(upvotedSheets);
		console.log("Downvoted sheets");
		console.log(downvotedSheets);

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

		console.log("Other voted users:");
		console.log(otherVotedUsers);

		for (const otherVotedUser of otherVotedUsers) {
			const otherUpvotedSheets = (
				await axios.get(`/api/users/vote/${otherVotedUser}?type=upvote`)
			).data;
			const otherDownvotedSheets = (
				await axios.get(`/api/users/vote/${otherVotedUser}?type=downvote`)
			).data;

			console.log("Other's upvotedSheets");
			console.log(otherUpvotedSheets);
			console.log("Other's downvotedSheets");
			console.log(otherDownvotedSheets);

			// Similarity = (|Upvoted AND O.Upvoted| + |Downvoted AND O.Downvoted| - |Upvoted AND O.Downvoted| - |Downvoted AND O.Upvoted|)
			// 				/ (Upvoted OR O.Upvoted OR Downvoted OR O.Downvoted)

			console.log(
				`(|Upvoted AND O.Upvoted| + |Downvoted AND O.Downvoted| - |Upvoted AND O.Downvoted| - |Downvoted AND O.Upvoted|): ${
					upvotedSheets.filter((sheet) => otherUpvotedSheets.indexOf(sheet) !== -1)
						.length +
					downvotedSheets.filter((sheet) => otherDownvotedSheets.indexOf(sheet) !== -1)
						.length -
					upvotedSheets.filter((sheet) => otherDownvotedSheets.indexOf(sheet) !== -1)
						.length -
					downvotedSheets.filter((sheet) => otherUpvotedSheets.indexOf(sheet) !== -1)
						.length
				}`
			);
			console.log(
				`(Upvoted OR O.Upvoted OR Downvoted OR O.Downvoted): ${
					[
						...new Set(
							upvotedSheets
								.concat(otherUpvotedSheets)
								.concat(downvotedSheets)
								.concat(otherDownvotedSheets)
						),
					].length
				}`
			);

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

			console.log(`Similarity computed: ${similarity}`);

			console.log(`otherVotedUser: ${otherVotedUser}`);
			console.log(`${similarities.map(entry => entry.id).toString()}`);
			console.log(`at: ${similarities.findIndex(entry => otherVotedUser === entry.id)}`);
			const replaceAt = similarities.findIndex(entry => otherVotedUser === entry.id);
			similarities[replaceAt] = {id: otherVotedUser, index: similarity};
		}

		console.log("Similarities to POST");
		console.log({ similarities });

		const similaritiesRes = await axios.post(`/api/similars/toUser/${user.id}`, {
			similarities: similarities.map(entry => {return {user: mongoose.Types.ObjectId(entry.id), index: entry.index}})
		});
		if (similaritiesRes.status === 200) {
			console.log("Similarities saved:");
			console.log(similarities);
		} else {
			console.log("Error in saving similarities:");
			console.log(similaritiesRes);
		}
	}
}

export default Similars;
