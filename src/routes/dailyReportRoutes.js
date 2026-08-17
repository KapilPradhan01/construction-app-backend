const express = require("express");

const {
    createDailyReport,
    getProjectReports
} = require("../controllers/dailyReportController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createDailyReport);

router.get(
    "/project/:projectId",
    protect,
    getProjectReports
);

module.exports = router;