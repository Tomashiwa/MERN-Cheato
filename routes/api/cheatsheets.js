const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const engine = require("../../client/src/lib/SuggestionEngine/Engine");

//Cheatsheet model
const Cheatsheet = require("../../models/Cheatsheet");
const User = require("../../models/User");
const School = require("../../models/School");
const Module = require("../../models/Module");

const ObjectId = require("mongoose").Types.ObjectId;
// @route GET api/cheatsheets
// @descr Get all cheatsheets
// @access Public
// By entering into this file, the path is already in "/api/cheatsheets". So, only "/" is required
router.get("/", (req, res) => {
	// Mongo query
	Cheatsheet.find()
		.sort({ datetime: -1 })
		.then((cheatsheets) => res.json(cheatsheets));
});

// @route POST api/cheatsheets/
// @descr Get cheatsheets viewable by the user
// @access Public
router.post("/", (req, res) => {
	if (!req.body.id) {
		Cheatsheet.find({ isPublic: true })
			.sort({ datetime: -1 })
			.then((cheatsheets) => res.json(cheatsheets));
	} else {
		const { id, isAdmin } = req.body;

		if (isAdmin) {
			Cheatsheet.find()
				.sort({ datetime: -1 })
				.then((cheatsheets) => res.json(cheatsheets));
		} else {
			Cheatsheet.find({ $or: [{ user: new ObjectId(id) }, { isPublic: true }] })
				.sort({ datetime: -1 })
				.then((cheatsheets) => res.json(cheatsheets));
		}
	}
});

router.post("/sheetCount", (req, res) => {
	let filter = {};
	if (req.body.filter.school && req.body.filter.module) {
		filter = {
			$and: [
				{ school: mongoose.Types.ObjectId(req.body.filter.school) },
				{ module: mongoose.Types.ObjectId(req.body.filter.module) },
			],
		};
	} else if (req.body.filter.school) {
		filter = { school: mongoose.Types.ObjectId(req.body.filter.school) };
	} else if (req.body.filter.module) {
		filter = { module: mongoose.Types.ObjectId(req.body.filter.module) };
	}

	if (!req.body.user) {
		Cheatsheet.countDocuments({ $and: [{ isPublic: true }, filter] }, (err, count) => {
			res.status(200).json({ count });
		});
	} else {
		const { id, isAdmin } = req.body.user;

		if (isAdmin) {
			Cheatsheet.countDocuments(filter, (err, count) => {
				res.status(200).json({ count });
			});
		} else {
			Cheatsheet.countDocuments(
				{
					$or: [
						{ $and: [{ user: new ObjectId(id) }, filter] },
						{ $and: [{ isPublic: true }, filter] },
					],
				},
				(err, count) => {
					res.status(200).json({ count });
				}
			);
		}
	}
});

router.post("/page/:pageId", (req, res) => {
	if (!req.params.pageId) {
		res.status(404).json({ msg: "Please provide a page id" });
	} else {
		let filter = {};
		if (req.body.filter.school && req.body.filter.module) {
			filter = {
				$and: [
					{ school: mongoose.Types.ObjectId(req.body.filter.school) },
					{ module: mongoose.Types.ObjectId(req.body.filter.module) },
				],
			};
		} else if (req.body.filter.school) {
			filter = { school: mongoose.Types.ObjectId(req.body.filter.school) };
		} else if (req.body.filter.module) {
			filter = { module: mongoose.Types.ObjectId(req.body.filter.module) };
		}
		
		if (!req.body.user) {
			filter = { isPublic: true, ...filter };
		} else {
			const { id, isAdmin } = req.body.user;
			if(!isAdmin) {
				filter = {
					$or: [
						{ user: new ObjectId(id), ...filter },
						{ isPublic: true, ...filter },
					],
				};
			}
		}

		const sortBy = req.body.sortBy === "dateTime" ? { datetime: -1 } : { rating: -1 };

		Cheatsheet.find(filter)
			.sort(sortBy)
			.skip((req.params.pageId - 1) * req.body.itemsPerPage)
			.limit(req.body.itemsPerPage)
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
			});
	}
});

// @route POST api/cheatsheets
// @descr Create a cheatsheet
// @access Public
router.post("/add", (req, res) => {
	const newCheatsheet = new Cheatsheet({
		file: req.body.file,
		thumbnail: req.body.thumbnail,
		user: req.body.user,
		name: req.body.name,
		school: req.body.school,
		module: req.body.module,
		description: req.body.description,
		datetime: req.body.datetime,
		rating: req.body.rating,
		comments: req.body.comments,
		isPublic: req.body.isPublic,
		isAnonymous: req.body.isAnonymous,
	});

	//Save to database
	newCheatsheet.save().then((item) => res.json(item));
});

// @route POST api/cheatsheets/:id
// @descr Retrieving a specific cheatsheet with authentication
// @access Public
router.post("/:id", (req, res) => {
	if (!req.body.id) {
		Cheatsheet.findById(req.params.id)
			.then((cheatsheet) => {
				if (cheatsheet.isPublic) {
					res.json(cheatsheet);
				} else {
					res.status(404).json({ msg: `This cheatsheet is private` });
				}
			})
			.catch((err) => res.status(404).json({ msg: `No cheatsheet found` }));
	} else {
		const { id, isAdmin } = req.body;

		if (isAdmin) {
			Cheatsheet.findById(req.params.id)
				.then((cheatsheet) => res.json(cheatsheet))
				.catch((err) => res.status(404).json({ msg: `No cheatsheet found` }));
		} else {
			Cheatsheet.findById(req.params.id)
				.then((cheatsheet) => {
					if (cheatsheet.user.toString() === id || cheatsheet.isPublic) {
						res.json(cheatsheet);
					} else {
						res.status(404).json({ msg: `This cheatsheet is private` });
					}
				})
				.catch((err) => res.status(404).json({ msg: `No cheatsheet found` }));
		}
	}
});

// @route DELETE api/cheatsheets
// @descr Delete a cheatsheet
// @access Public
router.delete("/:id", (req, res) => {
	Cheatsheet.findById(req.params.id)
		.then((cheatsheet) => cheatsheet.remove().then(() => res.json({ success: true })))
		.catch((err) => res.status(404).json({ success: false }));
});

// @route GET api/cheatsheets/searchTerm/limit
// @descr Retrieve a set amount of cheatsheets that matches the search term
// @access Public
router.get("/search/:searchTerm/:limit", (req, res) => {
	Cheatsheet.find({ $or: [{ name: { $regex: req.params.searchTerm, $options: "i" } }] })
		.limit(parseInt(req.params.limit))
		.sort({ name: -1 })
		.then((cheatsheets) => res.json(cheatsheets))
		.catch((err) => res.status(404).json({ success: false }));
});

router.put("/:id", function (req, res, next) {
	Cheatsheet.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(function (
		cheatsheet
	) {
		res.send(cheatsheet);
	});
});

router.post("/vote/add/:sheetId", (req, res, next) => {
	const { userId, type } = req.body;

	if (!userId || !type) {
		res.status(404).json({ msg: "Please provide both fields in body..." });
	}

	if (type === "upvote") {
		Cheatsheet.findById(req.params.sheetId).then((cheatsheet) => {
			let upvotedUsers = cheatsheet.upvotedUsers;
			upvotedUsers.push(mongoose.Types.ObjectId(userId));

			Cheatsheet.updateOne(
				{ _id: req.params.sheetId },
				{ upvotedUsers, rating: upvotedUsers.length - cheatsheet.downvotedUsers.length }
			)
				.then((result) => {
					res.status(200).json({
						upvotedUsers,
						rating: upvotedUsers.length - cheatsheet.downvotedUsers.length,
					});
					engine.update({ id: userId });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		});
	} else if (type === "downvote") {
		Cheatsheet.findById(req.params.sheetId).then((cheatsheet) => {
			let downvotedUsers = cheatsheet.downvotedUsers;
			downvotedUsers.push(mongoose.Types.ObjectId(userId));

			Cheatsheet.updateOne(
				{ _id: req.params.sheetId },
				{ downvotedUsers, rating: cheatsheet.upvotedUsers.length - downvotedUsers.length }
			)
				.then((result) => {
					res.status(200).json({
						downvotedUsers,
						rating: cheatsheet.upvotedUsers.length - downvotedUsers.length,
					});
					engine.update({ id: userId });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		});
	} else {
		res.status(400).json({ msg: "Vote type not found..." });
	}
});

router.post("/vote/remove/:sheetId", (req, res, next) => {
	const { userId, type } = req.body;

	if (!userId || !type) {
		res.status(404).json({ msg: "Please provide both fields in body..." });
	}

	if (type === "upvote") {
		Cheatsheet.findById(req.params.sheetId).then((cheatsheet) => {
			let upvotedUsers = cheatsheet.upvotedUsers;
			upvotedUsers.remove(userId);

			Cheatsheet.updateOne(
				{ _id: req.params.sheetId },
				{ upvotedUsers, rating: upvotedUsers.length - cheatsheet.downvotedUsers.length }
			)
				.then((result) => {
					res.status(200).json({
						upvotedUsers,
						rating: upvotedUsers.length - cheatsheet.downvotedUsers.length,
					});
					engine.update({ id: userId });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		});
	} else if (type === "downvote") {
		Cheatsheet.findById(req.params.sheetId).then((cheatsheet) => {
			let downvotedUsers = cheatsheet.downvotedUsers;
			downvotedUsers.remove(userId);

			Cheatsheet.updateOne(
				{ _id: req.params.sheetId },
				{ downvotedUsers, rating: cheatsheet.upvotedUsers.length - downvotedUsers.length }
			)
				.then((result) => {
					res.status(200).json({
						downvotedUsers,
						rating: cheatsheet.upvotedUsers.length - downvotedUsers.length,
					});
					engine.update({ id: userId });
				})
				.catch((err) => res.status(404).json({ msg: err.msg }));
		});
	} else {
		res.status(400).json({ msg: "Vote type not found..." });
	}
});

router.get("/vote/:sheetId", (req, res) => {
	Cheatsheet.findById(req.params.sheetId)
		.then((cheatsheet) => {
			if (req.query.type) {
				res.json(
					req.query.type === "upvote"
						? cheatsheet.upvotedUsers
						: cheatsheet.downvotedUsers
				);
			} else {
				res.json(cheatsheet.upvotedUsers.concat(cheatsheet.downvotedUsers));
			}
		})
		.catch((err) => res.status(404).json({ msg: err.msg }));
});

router.get("/withoutVotes/:userId", (req, res) => {
	Cheatsheet.find({
		$and: [
			{
				isPublic: true,
			},
			{
				user: { $ne: mongoose.Types.ObjectId(req.params.userId) },
			},
			{
				upvotedUsers: {
					$exists: true,
					$not: { $in: [mongoose.Types.ObjectId(req.params.userId)] },
				},
			},
			{
				downvotedUsers: {
					$exists: true,
					$not: { $in: [mongoose.Types.ObjectId(req.params.userId)] },
				},
			},
		],
	})
		.then((unvotedSheets) => res.json(unvotedSheets))
		.catch((err) => res.status(404).json({ msg: err.msg }));
});

router.get("/details/:sheetId", (req, res) => {
	Cheatsheet.findById(req.params.sheetId)
		.then(cheatsheet => {
			const details = {
				name: cheatsheet.name,
				author: cheatsheet.user,
				school: cheatsheet.school,
				module: cheatsheet.module,
				description: cheatsheet.description,
				isPublic: cheatsheet.isPublic,		
			};
			res.status(200).json(details);
		})
		.catch((err) => res.status(404).json({ msg: "No cheatsheet found" }));
})

router.post("/edit/:sheetId", (req, res) => {
	const { user, form } = req.body;

	Cheatsheet.findById(req.params.sheetId).then((sheet) => {
		if (
			sheet.isPublic ||
			user.isAdmin ||
			(!sheet.isPublic && sheet.user.toString() === user.id)
		) {
			Cheatsheet.updateOne({ _id: req.params.sheetId }, form)
				.then((result) => {
					res.json(result);
				})
				.catch((err) => res.status(404).json({ msg: err }));
		} else {
			res.status(404).json({ msg: "User has no rights to edit this cheatsheet..." });
		}
	});
});

router.get("/random", (req, res) => {
	Cheatsheet.countDocuments({}, (err, count) => {
		var random = Math.floor(Math.random() * count);
		Cheatsheet.findOne()
			.skip(random)
			.then((result) => res.json(result))
			.catch((err) => res.status(404).json(err));
	});
});

router.get("/byUser/:userID", (req, res) => {
	Cheatsheet.find({ user: mongoose.Types.ObjectId(req.params.userID) })
		.then((cheatsheet) => res.json(cheatsheet))
		.catch((err) =>
			res.status(404).json({ msg: `Cheatsheet with ${req.params.userID} cannot be found` })
		);
});

router.post("/view/:sheetId", (req, res) => {
	Cheatsheet.findById(req.params.sheetId)
		.then((cheatsheet) => {
			if(!req.body.id && !cheatsheet.isPublic) {
				res.status(404).json({ msg: `This cheatsheet is private` });
			} else if(req.body.id && !cheatsheet.isPublic && cheatsheet.user.toString() !== req.body.id) {
				res.status(404).json({ msg: `This cheatsheet is private` });
			} else {
				let sheet = {
					id: cheatsheet._id,
					name: cheatsheet.name,
					file: cheatsheet.file,
					author: "Anonymous",
					school: "",
					module: "",
					description: cheatsheet.description,
					upvotedUsers: cheatsheet.upvotedUsers,
					downvotedUsers: cheatsheet.downvotedUsers,
					rating: cheatsheet.rating
				};

				let names = [
					School.findById(cheatsheet.school.toString()).exec(),
					Module.findById(cheatsheet.module.toString()).exec()
				];

				if(!cheatsheet.isAnonymous) {
					names.push(User.findById(cheatsheet.user.toString()).exec());
				}

				Promise.all(names)
					.then(results => {
						sheet = {
							...sheet,
							school: results[0].name,
							module: results[1].name,
						};

						if(!cheatsheet.isAnonymous) {
							sheet = {...sheet, author: results[2].name};
						}

						res.status(200).json(sheet);
					});
			}
		})
		.catch((err) => res.status(404).json({ msg: `No cheatsheet found` }));
})

router.get(`/rating/:sheetId`, (req, res) => {
	Cheatsheet.findById(req.params.sheetId)
		.then(sheet => {
			res.status(200).json({rating: sheet.rating});
		})
		.catch((err) => res.status(404).json({ msg: `No cheatsheet found` }));
})

//So other files can read what's in this file
module.exports = router;
