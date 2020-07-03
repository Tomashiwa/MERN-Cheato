const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SuggestionSchema = new Schema({
	user: { type: mongoose.ObjectId, required: true },
	suggestions: { type: Array, required: true },
});

module.exports = Suggestion = mongoose.model("suggestion", SuggestionSchema);
