const Expense = require("../models/Expense");
const { requireOwnedProject } = require("../utils/projectAccess");

const createExpense = async (req, res) => {
    try {
        const { projectId, category, description, amount, date, paidBy, paymentStatus, receiptUrl } = req.body;
        if (!await requireOwnedProject(req, res, projectId)) return;
        const expense = await Expense.create({ projectId, category, description, amount, date, paidBy, paymentStatus, receiptUrl, createdBy: req.user.id });
        res.status(201).json({ message: "Expense created successfully", expense });
    } catch (error) { res.status(500).json({ message: "Failed to create expense", error: error.message }); }
};

const getProjectExpenses = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const expenses = await Expense.find({ projectId: req.params.projectId }).sort({ date: -1 });
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const paid = expenses.filter(e => e.paymentStatus === "paid").reduce((sum, e) => sum + e.amount, 0);
        const pending = expenses.filter(e => e.paymentStatus === "pending").reduce((sum, e) => sum + e.amount, 0);
        res.json({ count: expenses.length, total, paid, pending, expenses });
    } catch (error) { res.status(500).json({ message: "Failed to fetch expenses", error: error.message }); }
};

const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        if (!await requireOwnedProject(req, res, expense.projectId)) return;
        ["category", "description", "amount", "date", "paidBy", "paymentStatus", "receiptUrl"].forEach(field => {
            if (req.body[field] !== undefined) expense[field] = req.body[field];
        });
        await expense.save();
        res.json({ message: "Expense updated successfully", expense });
    } catch (error) { res.status(500).json({ message: "Failed to update expense", error: error.message }); }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        if (!await requireOwnedProject(req, res, expense.projectId)) return;
        await Expense.deleteOne({ _id: expense._id });
        res.json({ message: "Expense deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete expense", error: error.message }); }
};

module.exports = { createExpense, getProjectExpenses, updateExpense, deleteExpense };