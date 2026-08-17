const Material = require("../models/Material");

const createMaterial = async (req, res) => {
    try {
        const {
            projectId,
            name,
            quantity,
            unit,
            price,
            supplier
        } = req.body;

        const material = await Material.create({
            projectId,
            name,
            quantity,
            unit,
            price,
            supplier,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Material created successfully",
            material
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create material",
            error: error.message
        });
    }
};

const getProjectMaterials = async (req, res) => {
    try {
        const materials = await Material.find({
            projectId: req.params.projectId
        }).sort({ createdAt: -1 });

        res.json({
            count: materials.length,
            materials
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch materials",
            error: error.message
        });
    }
};

module.exports = {
    createMaterial,
    getProjectMaterials
};