const router = require("express").Router();
const isAuth = require("../utils/isAuth");

const { editProfile, deleteAccount } = require("../controllers/user");

router.use(isAuth);

// Edit Profile
router.put("/", editProfile)

// Delete Account
router.delete('/', deleteAccount)

module.exports = router;