const express = require("express");

const {
    createMaterial,
    getProjectMaterials,
    updateMaterial,
    deleteMaterial
} = require("../controllers/materialController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create material
router.post(
    "/",
    protect,
    createMaterial
);


// Get project materials
router.get(
    "/project/:projectId",
    protect,
    getProjectMaterials
);


// Update material
router.put(
    "/:id",
    protect,
    updateMaterial
);


// Delete material
router.delete(
    "/:id",
    protect,
    deleteMaterial
);


module.exports = router;