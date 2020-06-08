const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ModuleSchema = new Schema({
    code: {type:String, required: true},
    title:  {type:String, required: true}
});

module.exports = Module = mongoose.model("module", ModuleSchema);

