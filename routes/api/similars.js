const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Similar = require("../../models/Similar");

router.post("/toUser/:userId", (req, res) => {
	if (!req.body.similarities) {
		res.status(404).json({ msg: "Similarity indices not found..." });
	}

	const { similarities } = req.body;

	Similar.updateOne(
		{ user: mongoose.Types.ObjectId(req.params.userId) },
		{ $set: { similarities } },
		{ upsert: true }
	)
		.then((result) => res.json(similarities))
		.catch((err) => res.status(404).json({ msg: err.msg }));
});

router.get("/toUser/:userId", (req, res) => {
	Similar.findOne({ user: mongoose.Types.ObjectId(req.params.userId) })
		.then(result => res.json(result.similarities))
		.catch((err) => {
			res.status(404).json({ msg: err.msg });
		});
});

module.exports = router;
