const User = require("../models/User");
const jwt = require("jsonwebtoken");
const errorModel = require("./errorModel");

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer")) return next(errorModel(401, "Invalid authorization"));

    try {
        const token = authorization.split(" ")[1];
        const { _id } = jwt.verify(token, process.env.SECRET);

        const user = await User.findById(_id);
        if (!user) return next(errorModel(404, "User Not Found"));

        req.user = user;
        next();
    } catch (error) { next(error) }
}