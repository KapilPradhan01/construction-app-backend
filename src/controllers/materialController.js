const Material = require("../models/Material");
const { requireOwnedProject } = require("../utils/projectAccess");

const createMaterial = async (req, res) => {
    try {
        const {
            projectId,
            name,
            quantity,
            unit,
            price,
            supplier,
            paymentStatus,
            remainingAmount,
            paymentMethod,
            paymentDate,
            date,
            description
        } = req.body;
        if (!await requireOwnedProject(req, res, projectId)) return;
        const material = await Material.create({
            projectId,
            name,
            quantity,
            unit,
            price,
            supplier,
        
            paymentStatus,
            remainingAmount,
            paymentMethod,
            paymentDate,
            date,
            description,
        
            createdBy: req.user.id
        });
        res.status(201).json({ message: "Material created successfully", material });
    } catch (error) { res.status(500).json({ message: "Failed to create material", error: error.message }); }
};

const getProjectMaterials = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const materials = await Material.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
        res.json({ count: materials.length, materials });
    } catch (error) { res.status(500).json({ message: "Failed to fetch materials", error: error.message }); }
};

const updateMaterial = async (req, res) => {

    try {

        const material =
            await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        if (
            !await requireOwnedProject(
                req,
                res,
                material.projectId
            )
        ) return;


        // ================================
        // UPDATE MATERIAL FIELDS
        // ================================

        [
            "name",
            "quantity",
            "unit",
            "price",
            "supplier",
            "paymentStatus",
            "remainingAmount",
            "paymentMethod",
            "paymentDate",
            "date",
            "description"
        ].forEach(field => {

            if (req.body[field] !== undefined) {
                material[field] = req.body[field];
            }

        });


        await material.save();


        res.json({

            message:
                "Material updated successfully",

            material

        });

    } catch (error) {

        res.status(500).json({

            message:
                "Failed to update material",

            error:
                error.message

        });

    }
};

const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: "Material not found" });
        if (!await requireOwnedProject(req, res, material.projectId)) return;
        await Material.deleteOne({ _id: material._id });
        res.json({ message: "Material deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete material", error: error.message }); }
};

module.exports = { createMaterial, getProjectMaterials, updateMaterial, deleteMaterial };