const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["present", "absent", "half_day"],
            default: "present"
        },

        checkIn: {
            type: String,
            default: ""
        },

        checkOut: {
            type: String,
            default: ""
        },

        remarks: {
            type: String,
            default: ""
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

attendanceSchema.index(
    {
        projectId: 1,
        workerId: 1,
        date: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Attendance", attendanceSchema);