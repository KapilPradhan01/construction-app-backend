const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        category: {
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

        date: {
            type: Date,
            required: true
        },

        paidBy: {
            type: String
        },

        paymentStatus: {
            type: String,
            enum: ["paid", "pending"],
            default: "paid"
        },

        receiptUrl: {
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

module.exports = mongoose.model("Expense", expenseSchema);