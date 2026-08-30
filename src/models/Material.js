const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
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

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        unit: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        supplier: {
            type: String
        },

        // ================================
        // PAYMENT DETAILS
        // ================================

        paymentStatus: {
            type: String,
            enum: ["paid", "pending"],
            default: "pending"
        },

        remainingAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "bank", "other"],
            default: "cash"
        },

        paymentDate: {
            type: String,
            default: ""
        },

        // ================================
        // OTHER DETAILS
        // ================================

        date: {
            type: String,
            default: ""
        },

        description: {
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

module.exports = mongoose.model("Material", materialSchema);