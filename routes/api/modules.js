const express = require("express");
const router = express.Router();

//Module model
const Module = require("../../models/Module");
const mongoose = require("mongoose");

// @route GET api/modules
// @descr Get all modules
// @access Public
// By entering into this file, the path is already in "/api/modules". So, only "/" is required
router.get("/", (req, res) => {
    // Mongo query
    Module.find()
        .sort({name: 1})
        .then(modules => res.json(modules));
});

// @route GET api/modules/:id
// @descr Get a specific module
// @access Public
router.get("/:id", (req, res) => {
    Module.findById(req.params.id)
        .then(module => res.json(module));
});

router.get("/bySchool/:schoolId", (req, res) => {
    Module.find({school: mongoose.Types.ObjectId(req.params.schoolId)})
        .sort({name: 1})
        .then(modules => res.json(modules))
        .catch(err => {
            console.log("error");
            console.log(err);
            res.status(404).json({msg: err});
        })
})

// @route POST api/modules
// @descr Create a module
// @access Public
router.post("/", (req, res) => {
    const newModule = new Module({
        school: req.body.school,
        name: req.body.name
    });

    //Save to database
    newModule.save()
        .then(item => res.json(item));
});

// @route DELETE api/modules
// @descr Delete a module
// @access Public
router.delete("/:id", (req, res) => {
    Module.findById(req.params.id)
        .then(module => module.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

// @route GET api/schools/searchTerm/limit
// @descr Retrieve a set amount of schools that matches the search term
// @access Public
router.get("/search/:searchTerm/:limit", (req,res) => {
    Module
        .find({$or: [
            {name: {$regex: req.params.searchTerm, $options: "i"}}
        ]})
        .limit(parseInt(req.params.limit))
        .sort({name: -1})
        .then(modules => res.json(modules))
        .catch(err => res.status(404).json({success: false}));
})

//So other files can read what's in this file
module.exports = router;