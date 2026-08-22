const Payment = require("../models/Payment");
const { requireOwnedProject } = require("../utils/projectAccess");

const createPayment = async (req, res) => {
    try {
        const { projectId, amount, type, category, description, paymentMethod, date, reference } = req.body;
        if (!await requireOwnedProject(req, res, projectId)) return;
        const payment = await Payment.create({ projectId, amount, type, category, description, paymentMethod, date, reference, createdBy: req.user.id });
        res.status(201).json({ message: "Payment recorded successfully", payment });
    } catch (error) { res.status(500).json({ message: "Failed to record payment", error: error.message }); }
};

const getProjectPayments = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const payments = await Payment.find({ projectId: req.params.projectId }).sort({ date: -1 });
        const received = payments.filter(p => p.type === "received").reduce((sum, p) => sum + p.amount, 0);
        const paid = payments.filter(p => p.type === "paid").reduce((sum, p) => sum + p.amount, 0);
        res.json({ count: payments.length, received, paid, balance: received - paid, payments });
    } catch (error) { res.status(500).json({ message: "Failed to fetch payments", error: error.message }); }
};

const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        if (!await requireOwnedProject(req, res, payment.projectId)) return;
        ["amount", "type", "category", "description", "paymentMethod", "date", "reference"].forEach(field => {
            if (req.body[field] !== undefined) payment[field] = req.body[field];
        });
        await payment.save();
        res.json({ message: "Payment updated successfully", payment });
    } catch (error) { res.status(500).json({ message: "Failed to update payment", error: error.message }); }
};

const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        if (!await requireOwnedProject(req, res, payment.projectId)) return;
        await Payment.deleteOne({ _id: payment._id });
        res.json({ message: "Payment deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete payment", error: error.message }); }
};

module.exports = { createPayment, getProjectPayments, updatePayment, deletePayment };