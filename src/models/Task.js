const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending"
        },

        dueDate: {
            type: Date
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);