const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CheatsheetSchema = new Schema({
    user: {type: Number, required: true},
    school: {type: String, required: true},
    module: {type: String, required: true},
    description: {type: String, required: true},
    datetime: {type: Date, required: true},
    rating: {type: Number, required: true},
    comments: {type: Number, required: true}
    
    // name: {type: String, required: true},
    // date: {type: Date, default: Date.now}
});

module.exports = Cheatsheet = mongoose.model("cheatsheet", CheatsheetSchema);