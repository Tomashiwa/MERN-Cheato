const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: { type: String, required: true },
	password: { type: String, required: true },
	bookmarks: { type: Array, required: true },
	isAdmin: { type: Boolean, required: true },
	upvotedSheets: { type: Array, required: true },
	downvotedSheets: { type: Array, required: true },
});

module.exports = User = mongoose.model("user", UserSchema);
