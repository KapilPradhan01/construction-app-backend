const Project = require("../models/Project");

const updateProgress = async (req, res) => {
    try {
        const { progress, status } = req.body;

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.projectId,
                createdBy: req.user.id
            },
            {
                $set: {
                    progress: progress,
                    status: status
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found or not authorized"
            });
        }

        return res.status(200).json({
            message: "Project progress updated successfully",
            project
        });

    } catch (error) {
        console.error("Update project progress error:", error);

        return res.status(500).json({
            message: "Failed to update project progress",
            error: error.message
        });
    }
};

module.exports = {
    updateProgress
};