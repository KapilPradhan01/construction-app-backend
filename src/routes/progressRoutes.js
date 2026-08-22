const express = require("express");

const {
    updateProjectProgress
} = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.put(
    "/:projectId",
    protect,
    updateProjectProgress
);

module.exports = router;