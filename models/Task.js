const { Schema, model } = require("mongoose")

const TaskSchema = new Schema({
    content: { type: String, required: [true, "Content Is Required"] },
    finished: { type: Boolean, default: false },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" }
}, { timestamps: true })

module.exports = model("Task", TaskSchema);