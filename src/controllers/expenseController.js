const Expense = require("../models/Expense");

const createExpense = async (req, res) => {
    try {
        const {
            projectId,
            category,
            description,
            amount,
            date,
            paidBy,
            paymentStatus,
            receiptUrl
        } = req.body;

        const expense = await Expense.create({
            projectId,
            category,
            description,
            amount,
            date,
            paidBy,
            paymentStatus,
            receiptUrl,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Expense created successfully",
            expense
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create expense",
            error: error.message
        });
    }
};

const getProjectExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            projectId: req.params.projectId
        }).sort({ date: -1 });

        const total = expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        res.json({
            count: expenses.length,
            total,
            expenses
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch expenses",
            error: error.message
        });
    }
};

module.exports = {
    createExpense,
    getProjectExpenses
};