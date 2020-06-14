const express = require("express");
const router = express.Router();

//Cheatsheet model
const Cheatsheet = require("../../models/Cheatsheet");

// @route GET api/cheatsheets
// @descr Get all cheatsheets
// @access Public
// By entering into this file, the path is already in "/api/cheatsheets". So, only "/" is required
router.get("/", (req, res) => {
    // Mongo query
    Cheatsheet.find()
        .sort({datetime: -1})
        .then(cheatsheets => res.json(cheatsheets));
});

// @route POST api/cheatsheets
// @descr Create a cheatsheet
// @access Public
router.post("/", (req, res) => {
    const newCheatsheet = new Cheatsheet({
        file: req.body.file,
        user: req.body.user,
        name: req.body.name,
        school: req.body.school,
        module: req.body.module,
        description: req.body.description,
        datetime: req.body.datetime,
        rating: req.body.rating,
        comments: req.body.comments,
        isPublic: req.body.isPublic

        // name: req.body.name
        //Date left out, as it has default value of Date.now()
    });

    //Save to database
    newCheatsheet.save()
        .then(item => res.json(item));
});

// @route DELETE api/cheatsheets
// @descr Delete a cheatsheet
// @access Public
router.delete("/:id", (req, res) => {
    Cheatsheet.findById(req.params.id)
        .then(cheatsheet => cheatsheet.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

// @route GET api/cheatsheets/searchTerm/limit
// @descr Retrieve a set amount of cheatsheets that matches the search term
// @access Public
router.get("/search/:searchTerm/:limit", (req,res) => {
    Cheatsheet
        .find({$or: [
            {name: {$regex: req.params.searchTerm, $options: "i"}},
            // {school: {$regex: req.params.searchTerm, $options: "i"}},
            // {module: {$regex: req.params.searchTerm, $options: "i"}},
            // {description: {$regex: req.params.searchTerm, $options: "i"}},
        ]})
        .limit(parseInt(req.params.limit))
        .sort({name: -1})
        .then(cheatsheets => res.json(cheatsheets))
        .catch(err => res.status(404).json({success: false}));
})

//So other files can read what's in this file
module.exports = router;