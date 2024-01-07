const router = require("express").Router();
const isAuth = require("../utils/isAuth");

const { getAllTasks, createTask, editTask, deleteTask } = require("../controllers/task");

router.use(isAuth);

// Get All Tasks
router.get("/:groupId", getAllTasks)

// Create Task
router.post("/", createTask)

// Edit Task
router.put("/:taskId", editTask)

// Delete Task
router.delete("/:taskId", deleteTask)

module.exports = router;