const express = require("express");

const {
    createWorker,
    getProjectWorkers
} = require("../controllers/workerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createWorker);

router.get(
    "/project/:projectId",
    protect,
    getProjectWorkers
);

module.exports = router;