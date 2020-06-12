const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CheatsheetSchema = new Schema({
    file: {type: String, required: true},
    user: {type: Number, required: true},
    school: {type: String, required: true},
    module: {type: String, required: true},
    description: {type: String, required: false},
    datetime: {type: Date, required: true},
    rating: {type: Number, required: true},
    comments: {type: Array, required: true},
    isPublic: {type:Boolean, required:true}
});

module.exports = Cheatsheet = mongoose.model("cheatsheet", CheatsheetSchema);