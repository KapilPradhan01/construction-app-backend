const express = require("express");

const {
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create task
router.post(
    "/",
    protect,
    createTask
);


// Get project tasks
router.get(
    "/project/:projectId",
    protect,
    getProjectTasks
);


// Update task
router.put(
    "/:id",
    protect,
    updateTask
);


// Delete task
router.delete(
    "/:id",
    protect,
    deleteTask
);


module.exports = router;