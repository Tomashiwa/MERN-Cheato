const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RectangleSchema = new Schema({
    width: {type:Number, required: true},
    height:  {type:Number, required: true},
    pos_x:  {type:Number, default: 0, required: true},
    pos_y:  {type:Number, default: 0, required: true}
});

module.exports = Rectangle = mongoose.model("rectangle", RectangleSchema);