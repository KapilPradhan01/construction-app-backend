const express = require("express");

const {
    createTask,
    getProjectTasks,
    updateTask
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTask);

router.get(
    "/project/:projectId",
    protect,
    getProjectTasks
);

router.put(
    "/:id",
    protect,
    updateTask
);

module.exports = router;