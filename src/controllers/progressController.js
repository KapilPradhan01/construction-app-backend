const Project = require("../models/Project");
const { requireOwnedProject } = require("../utils/projectAccess");

const updateProgress = async (req, res) => {
    try {
        const { progress, status } = req.body;
        if (progress !== undefined && (progress < 0 || progress > 100)) return res.status(400).json({ message: "Progress must be between 0 and 100" });
        const project = await requireOwnedProject(req, res, req.params.projectId);
        if (!project) return;
        if (progress !== undefined) project.progress = progress;
        if (status !== undefined) project.status = status;
        await project.save();
        res.json({ message: "Project progress updated successfully", project });
    } catch (error) { res.status(500).json({ message: "Failed to update project progress", error: error.message }); }
};

module.exports = { updateProgress };