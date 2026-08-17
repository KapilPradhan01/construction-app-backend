const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        workDone: {
            type: String,
            required: true
        },

        workersPresent: {
            type: Number,
            default: 0
        },

        materialsUsed: {
            type: String
        },

        issues: {
            type: String
        },

        remarks: {
            type: String
        },

        photos: [{
            type: String
        }],

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

module.exports = mongoose.model("DailyReport", dailyReportSchema);