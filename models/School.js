const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchoolSchema = new Schema({
    name:  {type:String, required: true}
});

module.exports = School = mongoose.model("school", SchoolSchema);

