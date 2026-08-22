const Project = require("../models/Project");

const requireOwnedProject = async (req, res, projectId) => {
    try {
        if (!projectId) {
            res.status(400).json({
                message: "Project ID is required"
            });
            return false;
        }

        const project = await Project.findOne({
            _id: projectId,
            createdBy: req.user.id
        });

        if (!project) {
            res.status(403).json({
                message: "You do not have access to this project"
            });
            return false;
        }

        return true;

    } catch (error) {
        res.status(500).json({
            message: "Failed to verify project access",
            error: error.message
        });
        return false;
    }
};

module.exports = {
    requireOwnedProject
};
