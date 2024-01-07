const Group = require("../models/Group");
const Task = require("../models/Task");

const errorModel = require("../utils/errorModel");
const bcrypt = require("bcrypt");
const { isStrongPassword } = require("validator");


// Edit Profile
exports.editProfile = async (req, res, next) => {
    const user = req.user
    const { name, oldPassword, newPassword } = req.body;
    if (!name && (!oldPassword || !newPassword)) return next(errorModel(400, "Provide at least one filed"));

    try {
        if (name) {
            if (name < 2 || name > 20) return next(errorModel(400, "Name must be between 2 and 20 characters"));
            user.name = name;
        }
        if (oldPassword || newPassword) {
            if (!newPassword || !oldPassword) return next(errorModel(400, "oldPassword and newPaswword are required"));
            if (oldPassword === newPassword) return next(errorModel(400, "Passwords must be different"));
            if (!isStrongPassword(newPassword)) return next(errorModel(400, "Password must be at least 8 and contain at least one upprecase and lowercase letters and numbers and symbol"));
            console.log('pass')
            const hash = await bcrypt.hash(newPassword, 10);
            user.password = hash;
        }
        await user.save();

        res.status(200).json({ msg: "User Updated" });
    } catch (error) { next(error) }
}

// Delete Account
exports.deleteAccount = async (req, res, next) => {
    try {
        const groups = await Group.find({ userId: req.user._id })
        for (let ele of groups) {
            await Task.deleteMany({ groupId: ele._id })
            await ele.deleteOne();
        }
        await req.user.deleteOne();

        res.status(200).json({msg: "User deleted successfully"})
    } catch (error) { next(error) }
}