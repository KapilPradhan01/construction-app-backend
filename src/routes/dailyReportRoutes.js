const express = require("express");

const {
    createDailyReport,
    getProjectReports,
    updateDailyReport,
    deleteDailyReport
} = require("../controllers/dailyReportController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create daily report
router.post(
    "/",
    protect,
    createDailyReport
);


// Get project reports
router.get(
    "/project/:projectId",
    protect,
    getProjectReports
);


// Update daily report
router.put(
    "/:id",
    protect,
    updateDailyReport
);


// Delete daily report
router.delete(
    "/:id",
    protect,
    deleteDailyReport
);


module.exports = router;