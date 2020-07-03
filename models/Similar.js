const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SimilarSchema = new Schema({
	user: { type: mongoose.ObjectId, required: true },
	similarities: { type: Array, required: true }
});

module.exports = Similar = mongoose.model("similar", SimilarSchema);
