const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Suggestion = require("../../models/Suggestion");
const Cheatsheet = require("../../models/Cheatsheet");

router.post("/toUser/:userId", (req, res) => {
	if (!req.body.suggestions) {
		res.status(404).json({ msg: "Suggestions not found..." });
	}

	const { suggestions } = req.body;

	Suggestion.updateOne(
		{ user: mongoose.Types.ObjectId(req.params.userId) },
		{ $set: { suggestions } },
		{ upsert: true }
	)
		.then((result) => res.json(suggestions))
		.catch((err) => res.status(404).json({ msg: err.msg }));
});

router.get("/toUser/:userId/limit/:limit", (req, res) => {
	Suggestion.findOne({ user: mongoose.Types.ObjectId(req.params.userId) })
		.then((result) => {
			const suggestions = result.suggestions.slice(0, req.params.limit);
			const sheetRequests = suggestions.map(suggestion => Cheatsheet.findById(suggestion.id).exec());

			Promise.all(sheetRequests)
				.then(results => {
					const cheatsheets = results;

					const sheets = cheatsheets.map(cheatsheet => {
						return {
							id: cheatsheet._id,
							name: cheatsheet.name,
							author: cheatsheet.user,
							authorName: "",
							thumbnail: cheatsheet.thumbnail,
							upvotedUsers: cheatsheet.upvotedUsers,
							downvotedUsers: cheatsheet.downvotedUsers,
							rating: cheatsheet.rating
						};
					});

					let authors = cheatsheets
						.filter(cheatsheet => !cheatsheet.isAnonymous)
						.map(cheatsheet => cheatsheet.user.toString());
					authors = [...new Set(authors)];

					Promise.all(authors.map(author => User.findById(author).exec()))
						.then(results => {
							sheets.forEach(sheet => {
								const at = results.findIndex(res => {
									return res._id.toString() === sheet.author.toString();
								});

								if(at >= 0) {
									sheet.authorName = results[at].name;
								}
							})
							res.status(200).json(sheets);
						})
						.catch(err => console.log("err", err));
				})
		})
		.catch((err) => {
			res.status(404).json(err);
		});
});

router.post("/random/:amount", (req, res) => {
	const filter = !req.body.id
		? {isPublic: true}
		: req.body.isAdmin 
			? {}
			: {$or: [{isPublic: true}, {user: mongoose.Types.ObjectId(req.body.id)}]};

	Cheatsheet.countDocuments(filter, (err, count) => {
		const random = Math.floor(Math.random() * count);

		Cheatsheet.find(filter)
			.skip(random)
			.limit(parseInt(req.params.amount))
			.then((cheatsheets) => {
				let sheets = cheatsheets.map((cheatsheet) => {
					return {
						id: cheatsheet._id,
						name: cheatsheet.name,
						author: cheatsheet.user,
						authorName: "",
						thumbnail: cheatsheet.thumbnail,
						upvotedUsers: cheatsheet.upvotedUsers,
						downvotedUsers: cheatsheet.downvotedUsers,
						rating: cheatsheet.rating
					};
				});

				let authors = cheatsheets
					.filter(cheatsheet => !cheatsheet.isAnonymous)
					.map(cheatsheet => cheatsheet.user.toString());
				authors = [...new Set(authors)];

				Promise.all(authors.map(author => User.findById(author).exec()))
					.then(results => {
						sheets.forEach(sheet => {
							const at = results.findIndex(res => {
								return res._id.toString() === sheet.author.toString();
							});

							if(at >= 0) {
								sheet.authorName = results[at].name;
							}
						})

						res.status(200).json(sheets);
					})
					.catch(err => console.log("err", err));
			})
			.catch((err) => res.status(404).json({ msg: err }));
	});
})

module.exports = router;
