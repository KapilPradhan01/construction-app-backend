const express = require("express");

const {
    markAttendance,
    getProjectAttendance,
    updateAttendance,
    deleteAttendance,
    getProjectLaborCost,
    getWorkerSalaryDetails
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

router.put(
    "/:id",
    protect,
    updateAttendance
);

router.delete(
    "/:id",
    protect,
    deleteAttendance
);

// Get individual worker salary details

router.get(
    "/project/:projectId/worker/:workerId/salary",
    protect,
    getWorkerSalaryDetails
);

module.exports = router;