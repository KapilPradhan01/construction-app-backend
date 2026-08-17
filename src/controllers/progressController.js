const Project = require("../models/Project");

const updateProgress = async (req, res) => {
    try {
        const {
            progress,
            status
        } = req.body;

        if (
            progress !== undefined &&
            (progress < 0 || progress > 100)
        ) {
            return res.status(400).json({
                message: "Progress must be between 0 and 100"
            });
        }

        const project = await Project.findByIdAndUpdate(
            req.params.projectId,
            {
                ...(progress !== undefined && { progress }),
                ...(status !== undefined && { status })
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            message: "Project progress updated successfully",
            project
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update project progress",
            error: error.message
        });
    }
};

module.exports = {
    updateProgress
};