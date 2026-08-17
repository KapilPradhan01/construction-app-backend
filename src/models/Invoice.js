const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        invoiceNumber: {
            type: String,
            required: true
        },

        clientName: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        dueDate: {
            type: Date
        },

        status: {
            type: String,
            enum: ["draft", "pending", "paid", "overdue"],
            default: "pending"
        },

        notes: {
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

module.exports = mongoose.model("Invoice", invoiceSchema);