const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        phone: {
            type: String
        },

        role: {
            type: String,
            required: true
        },

        dailyWage: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
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

module.exports = mongoose.model("Worker", workerSchema);