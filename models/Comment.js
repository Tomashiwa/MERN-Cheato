const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    user: {type:String, required: true},
    datetime:  {type:Date, required: true},
    cheatsheet:  {type: mongoose.ObjectId, required: true},
    body:  {type:String, required: true}
});

module.exports = Comment = mongoose.model("comment", CommentSchema);


