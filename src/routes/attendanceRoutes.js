const express = require("express");

const {
    markAttendance,
    getProjectAttendance,
    getProjectLaborCost
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, markAttendance);

router.get(
    "/project/:projectId",
    protect,
    getProjectAttendance
);

router.get(
    "/project/:projectId/labor-cost",
    protect,
    getProjectLaborCost
);

module.exports = router;