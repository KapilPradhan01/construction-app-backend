const Invoice = require("../models/Invoice");
const { requireOwnedProject } = require("../utils/projectAccess");

const createInvoice = async (req, res) => {
    try {
        const { projectId, invoiceNumber, clientName, description, amount, dueDate, status, notes } = req.body;
        if (!await requireOwnedProject(req, res, projectId)) return;
        const invoice = await Invoice.create({ projectId, invoiceNumber, clientName, description, amount, dueDate, status, notes, createdBy: req.user.id });
        res.status(201).json({ message: "Invoice created successfully", invoice });
    } catch (error) { res.status(500).json({ message: "Failed to create invoice", error: error.message }); }
};

const getProjectInvoices = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const invoices = await Invoice.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
        const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        res.json({ count: invoices.length, total, invoices });
    } catch (error) { res.status(500).json({ message: "Failed to fetch invoices", error: error.message }); }
};

const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        if (!await requireOwnedProject(req, res, invoice.projectId)) return;
        ["invoiceNumber", "clientName", "description", "amount", "dueDate", "status", "notes"].forEach(field => {
            if (req.body[field] !== undefined) invoice[field] = req.body[field];
        });
        await invoice.save();
        res.json({ message: "Invoice updated successfully", invoice });
    } catch (error) { res.status(500).json({ message: "Failed to update invoice", error: error.message }); }
};

const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        if (!await requireOwnedProject(req, res, invoice.projectId)) return;
        await Invoice.deleteOne({ _id: invoice._id });
        res.json({ message: "Invoice deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete invoice", error: error.message }); }
};

module.exports = { createInvoice, getProjectInvoices, updateInvoice, deleteInvoice };