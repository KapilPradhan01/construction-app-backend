const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        clientName: {
            type: String,
            required: true,
            trim: true
        },

        clientPhone: {
            type: String
        },

        location: {
            type: String,
            required: true
        },

        budget: {
            type: Number,
            required: true,
            min: 0
        },

        startDate: {
            type: Date,
            required: true
        },

        expectedEndDate: {
            type: Date
        },

        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        status: {
            type: String,
            enum: ["planning", "in_progress", "completed", "on_hold"],
            default: "planning"
        },

        description: {
            type: String
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

module.exports = mongoose.model("Project", projectSchema);