const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const engine = require("../../client/src/lib/SuggestionEngine/Engine");

const jwtSecret =
	!process.env.NODE_ENV || process.env.NODE_ENV === "development"
		? require("../../config/keys").jwtSecret
		: process.env.JWT_SECRET;

//User model
const User = require("../../models/User");
const { response } = require("express");

// @route GET api/users
// @descr Get all users
// @access Public
// By entering into this file, the path is already in "/api/users". So, only "/" is required
router.get("/", (req, res) => {
	// Mongo query
	User.find()
		.sort({ name: -1 })
		.then((users) => res.json(users));
});

// @route POST api/users
// @descr Create a user
// @access Public
router.post("/register", (req, res) => {
	const { name, password, isAdmin } = req.body;

	if (!name || !password) {
		return res.status(400).json({ msg: "Please provide both name and password." });
	}

	//Check if there's an existing user with that name before creating it
	User.findOne({ name }).then((user) => {
		if (user) {
			return res
				.status(400)
				.json({ msg: "This name is being used, please consider other possible names." });
		}

		const newUser = new User({
			name: req.body.name,
			password: req.body.password,
			bookmarks: [],
			isAdmin: req.body.isAdmin,
			upvotedSheets: [],
			downvotedSheets: []
		});

		//Hashes password and save the user to backend
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if (err) {
					return res.status(400).json({ msg: "Error encountered when hashing password" });
				}

				newUser.password = hash;
				newUser.save().then((user) => {
					jwt.sign({ id: user.id }, jwtSecret, {}, (err, token) => {
						res.json({
							token,
							user: { id: user.id, name: user.name, isAdmin: user.isAdmin },
						});

						engine.update({id: user.id});
					});
				});
			});
		});
	});
});

router.post("/nameAvaliable", (req, res) => {
	const { name } = req.body;

	if (!name) {
		return res
			.status(400)
			.json({ isAvaliable: false, msg: "Please provide a name to verify." });
	}

	User.findOne({ name }).then((user) => {
		if (user) {
			return res.status(400).json({ isAvaliable: false, msg: "Name has being taken." });
		} else {
			res.json({ isAvaliable: true, msg: "" });
		}
	});
});

router.post("/tokenIsValid", (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) {
		return res.json({ isValid: false, msg: "Token not found" });
	}

	const verified = jwt.verify(token, jwtSecret);
	if (!verified) {
		return res.json({ isValid: false, msg: "Invalid Token" });
	}

	User.findById(verified.id).then((user) => {
		if (!user) {
			return res.json({ isValid: false, msg: "No user found with the given id" });
		}

		return res.json({
			isValid: true,
			msg: "Token is valid",
			user: { id: user._id, name: user.name, isAdmin: user.isAdmin },
		});
	});
});

router.get("/:id", (req, res) => {
	User.findById(req.params.id)
		.then((user) => res.json(user))
		.catch((err) =>
			res.status(404).json({ msg: `User with ${req.params.id} cannot be found` })
		);
});

// @route DELETE api/users
// @descr Delete a user
// @access Public
router.delete("/:id", (req, res) => {
	User.findById(req.params.id)
		.then((users) => users.remove().then(() => res.json({ success: true })))
		.catch((err) => res.status(404).json({ success: false }));
});

router.put("/:id", function (req, res, next) {
	User.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(function (user) {
		res.send(user);
	});
});

router.post("/vote/add/:userId", (req, res) => {
	const { sheetId, type } = req.body;

	if (!sheetId || !type) {
		req.status(404).json({ msg: "Please provide both fields for body..." });
	}

	User.findById(req.params.userId).then((user) => {
		if (type === "upvote") {
			let upvotedSheets = user.upvotedSheets;

			upvotedSheets.push(mongoose.Types.ObjectId(sheetId));

			User.updateOne({ _id: req.params.userId }, { upvotedSheets })
				.then((result) => {
					res.json({ upvotedSheets });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		} else if (type === "downvote") {
			let downvotedSheets = user.downvotedSheets;

			downvotedSheets.push(mongoose.Types.ObjectId(sheetId));

			User.updateOne({ _id: req.params.userId }, { downvotedSheets })
				.then((result) => {
					res.json({ downvotedSheets });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		} else {
			res.status(404).json({ msg: "Type undefined..." });
		}
	});
});

router.post("/vote/remove/:userId", (req, res) => {
	const { sheetId, type } = req.body;
	if (!sheetId || !type) {
		req.status(404).json({ msg: "Please provide both fields for body..." });
	}

	User.findById(req.params.userId).then((user) => {
		if (type === "upvote") {
			let upvotedSheets = user.upvotedSheets;
			upvotedSheets.remove(sheetId);

			User.updateOne({ _id: req.params.userId }, { upvotedSheets })
				.then((result) => {
					res.status(200).json({ upvotedSheets });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		} else if (type === "downvote") {
			let downvotedSheets = user.downvotedSheets;
			downvotedSheets.remove(sheetId);

			User.updateOne({ _id: req.params.userId }, { downvotedSheets })
				.then((result) => {
					res.status(200).json({ downvotedSheets });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		} else {
			res.status(404).json({ msg: "Type undefined..." });
		}
	});
});

router.get("/vote/:userId", (req, res) => {
	User.findById(req.params.userId)
		.then((user) => {
			if (req.query.type) {
				res.json(req.query.type === "upvote" ? user.upvotedSheets : user.downvotedSheets);
			} else {
				res.json(user.upvotedSheets.concat(user.downvotedSheets));
			}
		})
		.catch((err) => res.status(404).json({ msg: err.msg }));
});

//So other files can read what's in this file
module.exports = router;
