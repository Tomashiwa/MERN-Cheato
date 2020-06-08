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

// @route POST api/schools
// @descr Create a school
// @access Public
router.post("/", (req, res) => {
    const newSchool = new School({
        name: req.body.name

        // name: req.body.name
        //Date left out, as it has default value of Date.now()
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

//So other files can read what's in this file
module.exports = router;