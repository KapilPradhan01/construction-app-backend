const Invoice = require("../models/Invoice");

const createInvoice = async (req, res) => {
    try {
        const {
            projectId,
            invoiceNumber,
            clientName,
            description,
            amount,
            dueDate,
            status,
            notes
        } = req.body;

        const invoice = await Invoice.create({
            projectId,
            invoiceNumber,
            clientName,
            description,
            amount,
            dueDate,
            status,
            notes,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Invoice created successfully",
            invoice
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create invoice",
            error: error.message
        });
    }
};

const getProjectInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            projectId: req.params.projectId
        }).sort({ createdAt: -1 });

        const total = invoices.reduce(
            (sum, invoice) => sum + invoice.amount,
            0
        );

        res.json({
            count: invoices.length,
            total,
            invoices
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch invoices",
            error: error.message
        });
    }
};

module.exports = {
    createInvoice,
    getProjectInvoices
};