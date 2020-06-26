const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ModuleSchema = new Schema({
    school: {type: mongoose.ObjectId, required: true},
    name:  {type: String, required: true}
});

module.exports = Module = mongoose.model("module", ModuleSchema);

