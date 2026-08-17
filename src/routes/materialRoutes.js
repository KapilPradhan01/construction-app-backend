const express = require("express");

const {
    createMaterial,
    getProjectMaterials
} = require("../controllers/materialController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createMaterial);

router.get(
    "/project/:projectId",
    protect,
    getProjectMaterials
);

module.exports = router;