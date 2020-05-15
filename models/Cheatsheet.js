const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CheatsheetSchema = new Schema({
    name: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

module.exports = Cheatsheet = mongoose.model("cheatsheet", CheatsheetSchema);