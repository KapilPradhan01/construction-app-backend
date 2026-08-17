const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        type: {
            type: String,
            enum: ["received", "paid"],
            required: true
        },

        category: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "bank_transfer", "cheque", "other"],
            default: "cash"
        },

        date: {
            type: Date,
            required: true
        },

        reference: {
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

module.exports = mongoose.model("Payment", paymentSchema);