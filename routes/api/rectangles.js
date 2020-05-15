const express = require("express");
const router = express.Router();

//Rectangle model
const Rectangle = require("../../models/Rectangle");

// @route GET api/rectangles
// @descr Get all rectangles
// @access Public
// By entering into this file, the path is already in "/api/rectangles". So, only "/" is required
router.get("/", (req, res) => {
    // Mongo query
    Rectangle.find()
        .then(rectangles => res.json(rectangles));
});

// @route POST api/rectangles
// @descr Create a rectangle
// @access Public
router.post("/", (req, res) => {
    const newRectangle = new Rectangle({
        length: req.body.length,
        width:  req.body.width,
        pos_x:  req.body.pos_x,
        pos_y:  req.body.pos_y
    });

    //Save to database
    newRectangle.save()
        .then(rect => res.json(rect));
});

// @route DELETE api/rectangles
// @descr Delete a rectangle
// @access Public
router.delete("/:id", (req, res) => {
    Rectangle.findById(req.params.id)
        .then(rect => rect.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

//So other files can read what's in this file
module.exports = router;