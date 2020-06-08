const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type:String, required: true},
    name:  {type:String, required: true},
    password:  {type:String, required: true},
    bookmarks: {type:Array, required:true},
    type:  {type:String, required: true}
});

module.exports = User = mongoose.model("user", UserSchema);

