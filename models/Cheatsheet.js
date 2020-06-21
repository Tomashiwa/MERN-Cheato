const mongoose = require("mongoose");
const { mongo } = require("mongoose");
const Schema = mongoose.Schema;

const CheatsheetSchema = new Schema({
    file: {type: String, required: true},
    name: {type: String, required: true},
    user: {type: mongoose.ObjectId, required: true},
    school: {type: mongoose.ObjectId, required: true},
    module: {type: mongoose.ObjectId, required: true},
    description: {type: String, required: false},
    datetime: {type: Date, required: true},
    rating: {type: Number, required: true},
    comments: {type: Array, required: true},
    isPublic: {type: Boolean, required: true},
    isAnonymous: {type: Boolean, required: true}
});

module.exports = Cheatsheet = mongoose.model("cheatsheet", CheatsheetSchema);