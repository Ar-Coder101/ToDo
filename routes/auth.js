const router = require("express").Router();

const { login, register, getCode, verifyCode, resetPass } = require("../controllers/auth")

// Login
router.post('/login', login);

// Register
router.post('/register', register);

// Get Forget Password Code
router.post("/getCode", getCode);

// Verify Forget Password Code
router.post("/verifyCode", verifyCode);

// Reset Password
router.post("/resetPass", resetPass);


module.exports = router