const express = require("express");
const router = express.Router();

//School model
const School = require("../../models/School");

// @route GET api/schools
// @descr Get all schools
// @access Public
// By entering into this file, the path is already in "/api/schools". So, only "/" is required
router.get("/", (req, res) => {
    // Mongo query
    School.find()
        .sort({name: -1})
        .then(schools => res.json(schools));
});

// @route GET api/schools/:id
// @descr Get a specific school
// @access Public
router.get("/:id", (req, res) => {
    School.findById(req.params.id)
        .then(school => res.json(school));
});

// @route POST api/schools
// @descr Create a school
// @access Public
router.post("/", (req, res) => {
    const newSchool = new School({
        name: req.body.name
    });

    //Save to database
    newSchool.save()
        .then(item => res.json(item));
});

// @route DELETE api/schools
// @descr Delete a school
// @access Public
router.delete("/:id", (req, res) => {
    School.findById(req.params.id)
        .then(school => school.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

// @route GET api/schools/searchTerm/limit
// @descr Retrieve a set amount of schools that matches the search term
// @access Public
router.get("/search/:searchTerm/:limit", (req,res) => {
    School
        .find({$or: [
            {name: {$regex: req.params.searchTerm, $options: "i"}}
        ]})
        .limit(parseInt(req.params.limit))
        .sort({name: -1})
        .then(schools => res.json(schools))
        .catch(err => res.status(404).json({success: false}));
})

//So other files can read what's in this file
module.exports = router;