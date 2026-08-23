const Project = require("../models/Project");

const updateProgress = async (req, res) => {
    console.log("🔥 NEW updateProgress CONTROLLER IS RUNNING");
    console.log("Project ID:", req.params.projectId);
    console.log("Body:", req.body);

    try {
        const { progress, status } = req.body;

        // Validate progress
        if (progress === undefined) {
            return res.status(400).json({
                message: "Progress is required"
            });
        }

        // Validate status
        const allowedStatuses = [
            "planning",
            "in_progress",
            "completed",
            "on_hold"
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid project status"
            });
        }

        // Validate progress range
        if (progress < 0 || progress > 100) {
            return res.status(400).json({
                message: "Progress must be between 0 and 100"
            });
        }

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.projectId,
                createdBy: req.user.id
            },
            {
                $set: {
                    progress: Number(progress),
                    ...(status !== undefined && { status })
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

        res.status(200).json({
            message: "Project progress updated successfully",
            project
        });

    } catch (error) {
        console.error("Update progress error:", error);

        res.status(500).json({
            message: "Failed to update project progress",
            error: error.message
        });
    }
};

module.exports = {
    updateProgress
};