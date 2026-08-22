const express = require("express");

const {
    createWorker,
    getProjectWorkers,
    updateWorker,
    deleteWorker
} = require("../controllers/workerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create worker
router.post(
    "/",
    protect,
    createWorker
);


// Get project workers
router.get(
    "/project/:projectId",
    protect,
    getProjectWorkers
);


// Update worker
router.put(
    "/:id",
    protect,
    updateWorker
);


// Delete worker
router.delete(
    "/:id",
    protect,
    deleteWorker
);


module.exports = router;