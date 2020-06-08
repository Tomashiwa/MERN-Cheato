const express = require("express");
const router = express.Router();

//User model
const User = require("../../models/User");

// @route GET api/users
// @descr Get all users
// @access Public
// By entering into this file, the path is already in "/api/users". So, only "/" is required
router.get("/", (req, res) => {
    // Mongo query
    User.find()
        .sort({name: -1})
        .then(users => res.json(users));
});

// @route POST api/users
// @descr Create a user
// @access Public
router.post("/", (req, res) => {
    const newUser = new User({
        username: req.body.username,
        name: req.body.name,
        password: req.body.password,
        bookmarks: req.body.bookmarks,
        type: req.body.type

        // name: req.body.name
        //Date left out, as it has default value of Date.now()
    });

    //Save to database
    newUser.save()
        .then(item => res.json(item));
});

// @route DELETE api/users
// @descr Delete a user
// @access Public
router.delete("/:id", (req, res) => {
    User.findById(req.params.id)
        .then(users => users.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

//So other files can read what's in this file
module.exports = router;