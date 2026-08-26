const express = require("express");

const {
    createAdvance,
    getWorkerAdvances,
    updateAdvance,
    deleteAdvance
} = require("../controllers/advanceController");

const protect =
    require("../middleware/authMiddleware");

const router =
    express.Router();


// =====================================================
// CREATE ADVANCE
// =====================================================

router.post(
    "/",
    protect,
    createAdvance
);


// =====================================================
// GET WORKER ADVANCES
// =====================================================

router.get(
    "/project/:projectId/worker/:workerId",
    protect,
    getWorkerAdvances
);


// =====================================================
// UPDATE ADVANCE
// =====================================================

router.put(
    "/:id",
    protect,
    updateAdvance
);


// =====================================================
// DELETE ADVANCE
// =====================================================

router.delete(
    "/:id",
    protect,
    deleteAdvance
);


module.exports = router;