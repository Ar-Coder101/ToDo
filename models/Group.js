const { Schema, model } = require("mongoose")

const GroupSchema = new Schema({
    name: { type: String, required: [true, "Group Name Is Required"] },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    userId: { type: Schema.Types.ObjectId, ref: "User" }
}, {timestamps: true})

module.exports = model("Group", GroupSchema);