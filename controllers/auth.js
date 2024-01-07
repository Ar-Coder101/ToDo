const User = require("../models/User");
const errorModel = require("../utils/errorModel");
const sendEmail = require("../utils/sendEmail")

const { isEmail, isStrongPassword } = require("validator")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const tokenGenerator = (payload, expireDate = "1d") => {
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: expireDate });
    return token;
}
const codeGenerator = () => {
    let code = "";
    for (let i = 0; i < 6; i++)
        code += Math.floor(Math.random() * 10);
    return code;
}

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(errorModel(400, "Email and Password is required"));

    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email address"));
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 and contain at least one upprecase and lowercase letters and numbers and symbol"));

    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        const isValidPass = await bcrypt.compare(password, user.password)
        if (!isValidPass) return next(errorModel(401, "Email or Password may be wrong"));

        const token = tokenGenerator({ _id: user._id })

        const { password: pass, __v, resetPass, ...other } = user._doc
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return next(errorModel(400, "Name, Email and Password is required"));

    if (name.lenght < 2 || name.lenght > 20) return next(errorModel(400, "Name must be more than 2 and less than 20 characters"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email address"));
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 and contain at least one upprecase and lowercase letters and numbers and symbol"));


    try {
        const exist = await User.findOne({ email });
        if (exist) return next(errorModel(400, "User already exists"));

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash })

        const token = tokenGenerator({ _id: user._id })
        res.status(201).json({ _id: user._id, name, email, token });
    } catch (error) { next(error) }
}

// Get Forget Password Code
exports.getCode = async (req, res, next) => {
    const email = req.body.email;
    if (!email || !isEmail(email)) return next(errorModel(400, "Please enter a valid email"));

    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));
        const code = codeGenerator();
        await sendEmail(user.email, "Forget Password", `Reset Code Is: ${code}`)

        user.resetPass.code = code;
        user.resetPass.expiresAt = Date.now() + 60 * 1000 * 1000;
        await user.save();

        res.status(200).json({ msg: `Email Sent To ${user.email}` })
    } catch (error) { next(error) }
}

// Verify Forget Password Code
exports.verifyCode = async (req, res, next) => {
    const { email, code } = req.body;
    if (!email || !code) return next(errorModel(400, "Email and Code are required"));

    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        if (user.resetPass.code !== code) return next(errorModel(400, "Invalid Code"));
        if (user.resetPass.expiresAt < Date.now()) {
            user.resetPass.code = null;
            user.resetPass.expiresAt = null;
            await user.save();
            return next(errorModel(400, "Code Expired"));
        }

        const token = tokenGenerator({ email, code });
        res.status(200).json({token});
    } catch (error) { next(error) }
}

// Reset Password
exports.resetPass = async (req, res, next) => {
    const { token, password } = req.body;
    if (!token || !password) return next(errorModel(400, "Token and Password is required"));

    try {
        const { email, code } = jwt.verify(token, process.env.SECRET);

        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        if (user.resetPass.code !== code) return next(errorModel(400, "Invalid Code"));
        if (user.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code Expired"));
        
        const hash = await bcrypt.hash(password, 10);
        user.password = hash;
        user.resetPass.code = null;
        user.resetPass.expiresAt = null;
        await user.save();
        
        res.status(200).json({msg: "Password Updated"});
    } catch (error) { next(error) }
}