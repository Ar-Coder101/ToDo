const router = require("express").Router();
const isAuth = require("../utils/isAuth");

const { getGroups, createGroup, editGroup, deleteGroup } = require("../controllers/group");

router.use(isAuth);

// Get All Groups
router.get('/all', getGroups)

// Create Group
router.post("/", createGroup)

// Edit Group
router.put("/:groupId", editGroup)

// Delete Group
router.delete("/:groupId", deleteGroup)

module.exports = router;