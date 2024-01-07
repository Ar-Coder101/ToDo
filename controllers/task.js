const Group = require("../models/Group");
const Task = require("../models/Task");
const errorModel = require("../utils/errorModel");
const { isMongoId } = require("validator");

// Get Tasks
exports.getAllTasks = async (req, res, next) => {
    const groupId = req.params.groupId;
    try {
        const tasks = await Task.find({ groupId });
        res.status(200).json(tasks);
    } catch (error) { next(error) }
}

// Create Task
exports.createTask = async (req, res, next) => {
    const { content, groupId } = req.body;
    if (!content || !groupId) return next(errorModel(400, "Content and GroupId are required"));
    if (!isMongoId(groupId)) return next(errorModel(400, "Invalid GroupId"));

    try {
        const group = await Group.findById(groupId);
        if (!group) return next(errorModel(404, "Group not found"));

        const task = await Task.create({ content, groupId })
        group.tasks.push(task._id);
        group.save();

        res.status(201).json(task);
    } catch (error) { next(error) }
}

// Edit Task
exports.editTask = async (req, res, next) => {
    const taskId = req.params.taskId;
    if (!taskId) return next(errorModel(400, "TaskId is required"));
    if (!isMongoId(taskId)) return next(errorModel(400, "Invalid TaskId"));

    const { content, finished } = req.body;
    if (!content && finished === undefined) return next(errorModel(400, "Content or Finished is required"));

    try {
        const task = await Task.findById(taskId)
        if (!task) return next(errorModel(400, "Task not found"));
        if (content) task.content = content;
        if (finished !== undefined) {
            if (typeof finished !== "boolean") return next(errorModel(400, "Finished must be boolean"));
            task.finished = finished;
        }

        await task.save();
        res.status(200).json(task);
    } catch (error) { next(error) }

}

// Delete Task
exports.deleteTask = async (req, res, next) => {
    const taskId = req.params.taskId
    if (!isMongoId(taskId)) return next(errorModel(400, "Invalid TaskId"));

    try {
        const task = await Task.findById(taskId);
        if (!task) return next(errorModel(404, "Task not found"));

        const group = await Group.findById(task.groupId);
        group.tasks.pull(taskId);
        await group.save();
        await task.deleteOne();

        res.status(200).json({ msg: "Task deleted successfully" });
    } catch (error) { next(error) }
}