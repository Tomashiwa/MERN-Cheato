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
const Cheatsheet = require("../../models/Cheatsheet");
const { Mongoose } = require("mongoose");

// @route GET api/users
// @descr Get all users
// @access Public
// By entering into this file, the path is already in "/api/users". So, only "/" is required
router.get("/", (req, res) => {
	// Mongo query
	User.find()
		.sort({ name: -1 })
		.then((users) => res.status(200).json(users));
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
						res.status(200).json({
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
			res.status(200).json({ isAvaliable: true, msg: "" });
		}
	});
});

router.post("/tokenIsValid", (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) {
		return res.status(200).json({ isValid: false, msg: "Token not found" });
	}

	const verified = jwt.verify(token, jwtSecret);
	if (!verified) {
		return res.status(200).json({ isValid: false, msg: "Invalid Token" });
	}

	User.findById(verified.id).then((user) => {
		if (!user) {
			return res.status(200).json({ isValid: false, msg: "No user found with the given id" });
		}

		return res.status(200).json({
			isValid: true,
			msg: "Token is valid",
			user: { id: user._id, name: user.name, isAdmin: user.isAdmin },
		});
	});
});

router.get("/:id", (req, res) => {
	User.findById(req.params.id)
		.then((user) => res.status(200).json(user))
		.catch((err) =>
			res.status(404).json({ msg: `User with ${req.params.id} cannot be found` })
		);
});

// @route DELETE api/users
// @descr Delete a user
// @access Public
router.delete("/:id", (req, res) => {
	User.findById(req.params.id)
		.then((users) => users.remove().then(() => res.status(200).json({ success: true })))
		.catch((err) => res.status(404).json({ success: false }));
});

router.put("/:id", function (req, res, next) {
	User.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(function (user) {
		res.status(200).send(user);
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
					res.status(200).json({ upvotedSheets });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		} else if (type === "downvote") {
			let downvotedSheets = user.downvotedSheets;

			downvotedSheets.push(mongoose.Types.ObjectId(sheetId));

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
				res.status(200).json(req.query.type === "upvote" ? user.upvotedSheets : user.downvotedSheets);
			} else {
				res.status(200).json(user.upvotedSheets.concat(user.downvotedSheets));
			}
		})
		.catch((err) => res.status(404).json({ msg: err.msg }));
});

router.get("/:userId/hasBookmarked/:sheetId", (req, res) => {
	User.findById(req.params.userId)
		.then(user => {
			res.status(200).json({hasBookmarked: user.bookmarks.includes(req.params.sheetId)});
		})
		.catch(err => res.status(404).json({msg: err.msg}));
})

router.get("/:userId/hasVoted/:sheetId", (req, res) => {
	User.findById(req.params.userId)
		.then(user => {
			let result = {hasVoted: false, type: "none"};

			if(user.upvotedSheets.includes(req.params.sheetId)) {
				result = {...result, hasVoted: true, type: "upvote"};
			} else if(user.downvotedSheets.includes(req.params.sheetId)) {
				result = {...result, hasVoted: true, type: "downvote"};
			}

			res.status(200).json(result);
		})
		.catch(err => res.status(404).json({msg: err.msg}));
})

router.get("/profile/:userId", (req, res) => {
	User.findById(req.params.userId)
		.then(user => {
			const profile = {
				name: user.name,
				bookmarks: user.bookmarks,
				upvotedSheets: user.upvotedSheets,
				downvotedSheets: user.downvotedSheets
			}

			res.status(200).json(profile);
		})
		.catch(err => res.status(404).json({msg: "No user found"}));
})

router.post("/uploads/:userId", (req, res) => {
	if(!mongoose.Types.ObjectId.isValid(req.params.userId)) {
		res.status(404).json({msg: "User ID is invalid"});
		return;
	}

	let sheetsQuery = Cheatsheet.find(req.body.user && req.body.user.id === req.params.userId
			? {user: mongoose.Types.ObjectId(req.params.userId)}
			: {user: mongoose.Types.ObjectId(req.params.userId), isPublic: true})

	if(req.body.limit) {
		sheetsQuery = sheetsQuery.limit(req.body.limit);
	}

	sheetsQuery
		.sort({ datetime: -1 })
		.then(cheatsheets => {
			let sheets = cheatsheets.map((cheatsheet) => {
				return {
					id: cheatsheet._id,
					name: cheatsheet.name,
					author: cheatsheet.user,
					authorName: "",
					thumbnail: cheatsheet.thumbnail,
					upvotedUsers: cheatsheet.upvotedUsers,
					downvotedUsers: cheatsheet.downvotedUsers,
					rating: cheatsheet.rating,
					hasBookmarked: false
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

					let countQuery = Cheatsheet.countDocuments(req.body.user && req.body.user.id === req.params.userId
						? {user: mongoose.Types.ObjectId(req.params.userId)}
						: {user: mongoose.Types.ObjectId(req.params.userId), isPublic: true});

					countQuery.then(total => {
						if(req.body.user) {
							User.findById(req.body.user.id)
								.then(user => {
									sheets = sheets.map(sheet => {
										return {...sheet, hasBookmarked: user.bookmarks.includes(sheet.id)}
									})
									res.status(200).json({sheets, total});
								})
								.catch(err => res.status(404).json({msg: "User cannot be found"}));
						} else {
							res.status(200).json({sheets, total});
						}
					})
					.catch(err => res.status(404).json({msg: "Problem encountered when finding user's cheatsheets"}));
				})
				.catch(err => {
					res.status(404).json({msg: "Problem encountered when finding cheatsheets' author"})
				});
		})
		.catch(err => res.status(404).json({msg: "Problem encountered when finding user's cheatsheets"}));
})

router.post("/bookmarks/:userId", (req, res) => {
	if(!mongoose.Types.ObjectId.isValid(req.params.userId)) {
		res.status(404).json({msg: "User ID is invalid"});
		return;
	}

	User.findById(req.params.userId)
		.then(user => {
			const bookmarkIds = user.bookmarks.map(id => mongoose.Types.ObjectId(id));
			let query = Cheatsheet.find({_id: {$in: bookmarkIds}});

			if(req.body.limit) {
				query = query.limit(req.body.limit);
			}

			query
				.sort({ datetime: -1 })
				.then(cheatsheets => {
					let sheets = cheatsheets.map((cheatsheet) => {
						return {
							id: cheatsheet._id,
							name: cheatsheet.name,
							author: cheatsheet.user,
							authorName: "",
							thumbnail: cheatsheet.thumbnail,
							upvotedUsers: cheatsheet.upvotedUsers,
							downvotedUsers: cheatsheet.downvotedUsers,
							rating: cheatsheet.rating,
							hasBookmarked: false
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
		
							let countQuery = Cheatsheet.countDocuments({_id: {$in: bookmarkIds}});

							countQuery.then(total => {
								if(req.body.user) {
									User.findById(req.body.user.id)
										.then(user => {
											sheets = sheets.map(sheet => {
												return {...sheet, hasBookmarked: user.bookmarks.includes(sheet.id)}
											})
											res.status(200).json({sheets, total});
										})
										.catch(err => console.log("Problem encountered when checking whether is bookmarked"));
								} else {
									res.status(200).json({sheets, total});
								}
							})
							.catch(err => console.log("Problem encountered when counting amount of bookmarked sheets"));
						})
						.catch(err => console.log("Problem encountered when finding authors"));
				})
				.catch(err => res.status(404).json({msg: "Bookmarks cannot be found"}));
		})
		.catch(err => res.status(404).json({msg: "This user cannot be found"}));

})

router.get("/name/:userId", (req, res) => {
	User.findById(req.params.userId)
		.then(user => res.status(200).json({name: user.name}))
		.catch(err => console.log("err", err));
})

//So other files can read what's in this file
module.exports = router;