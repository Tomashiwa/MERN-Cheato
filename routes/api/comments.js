const express = require("express");
const router = express.Router();

var mongoose = require('mongoose')

//Comment model
const Comment = require("../../models/Comment");

// @route GET api/comments
// @descr Get all comments
// @access Public
// By entering into this file, the path is already in "/api/comments". So, only "/" is required
router.get("/", (req, res) => {
    // Mongo query
    Comment.find()
        .sort({datetime: -1})
        .then(comments => res.json(comments));
});

router.get("/bySheet/:sheetID", (req, res) => {
    Comment.find({cheatsheet:mongoose.Types.ObjectId(req.params.sheetID)})
        .then(comment => res.json(comment))
        .catch(err => res.status(404).json({msg: `Comment with ${req.params.id} cannot be found`}));
})




// @route POST api/comments
// @descr Create a comment
// @access Public
router.post("/", (req, res) => {
    const newComment = new Comment({
        user: req.body.user,
        datetime: req.body.datetime,
        cheatsheet: req.body.cheatsheet,
        body: req.body.body

        // name: req.body.name
        //Date left out, as it has default value of Date.now()
    });

    //Save to database
    newComment.save()
        .then(item => res.json(item));
});

// @route DELETE api/comments
// @descr Delete a comment
// @access Public
router.delete("/:id", (req, res) => {
    Comment.findById(req.params.id)
        .then(comment => comment.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

router.put("/:id", function(req, res, next){
    Comment.findByIdAndUpdate(req.params.id,req.body,{new:true})
       .then(function(comments){
            res.send(comments);
    });
});
//So other files can read what's in this file
module.exports = router;