const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
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

        type: {
            type: String,
            enum: [
                "contract",
                "invoice",
                "receipt",
                "drawing",
                "photo",
                "other"
            ],
            default: "other"
        },

        fileUrl: {
            type: String
        },

        storagePath: {
            type: String
        },

        fileName: {
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

module.exports = mongoose.model("Document", documentSchema);