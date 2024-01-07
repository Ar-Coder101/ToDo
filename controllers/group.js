const Task = require("../models/Task");
const Group = require("../models/Group");
const errorModel = require("../utils/errorModel");
const { isMongoId } = require("validator");

// Get Groups
exports.getGroups = async (req, res, next) => {
    const user = req.user;

    try {
        const groups = await Group.find({ userId: user._id }, ["-__v, -updatedAt"]);

        res.status(200).json(groups);
    } catch (error) { next(error) }
}

// Create Groups
exports.createGroup = async (req, res, next) => {
    const user = req.user;
    const { name } = req.body
    if (!name) return next(errorModel(400, "Group name is required"));

    try {
        const exists = await Group.findOne({ name });
        if (exists) return next(errorModel(400, "Group name already exists"));
        const group = await Group.create({ name, userId: user._id });

        res.status(200).json(group);
    } catch (error) { next(error) }
}

// Edit Group
exports.editGroup = async (req, res, next) => {
    const user = req.user;
    const groupId = req.params.groupId;
    if (!isMongoId(groupId)) return next(errorModel(400, "Invalid group id"))

    const { name } = req.body;
    if (!name) return next(errorModel(400, "Group name is required"));

    try {
        const group = await Group.findById(groupId);
        if (!group) return next(errorModel(400, "Group not found"));

        if (group.userId.toString() !== user._id.toString()) return next(errorModel(401, "Not authorized to edit group"));

        group.name = name;
        await group.save();

        res.status(200).json(group);
    } catch (error) { next(error) }
}

// Delete Group
exports.deleteGroup = async (req, res, next) => {
    const user = req.user;
    const groupId = req.params.groupId;
    if (!isMongoId(groupId)) return next(errorModel(400, "Invalid group id"))

    try {
        const group = await Group.findById(groupId);
        if (!group) return next(errorModel(400, "Group not found"));

        if (group.userId.toString() !== user._id.toString()) return next(errorModel(401, "Not authorized to edit group"));

        await Task.deleteMany({ _id: group.tasks });
        await group.deleteOne();

        res.status(200).json({ msg: "Group deleted successfully" })
    } catch (error) { next(error) }
}