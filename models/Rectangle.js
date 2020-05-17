const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RectangleSchema = new Schema({
    width: {type:Number, required: true},
    height:  {type:Number, required: true},
    x:  {type:Number, default: 0, required: true},
    y:  {type:Number, default: 0, required: true}
});

module.exports = Rectangle = mongoose.model("rectangle", RectangleSchema);