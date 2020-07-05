const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Suggestion = require("../../models/Suggestion");

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

router.get("/toUser/:userId", (req, res) => {
	Suggestion.findOne({ user: mongoose.Types.ObjectId(req.params.userId) })
		.then((result) => {
			res.json(result.suggestions);
		})
		.catch((err) => {
			res.status(404).json({ msg: err.msg });
		});
});

module.exports = router;
