const Payment = require("../models/Payment");

const createPayment = async (req, res) => {
    try {
        const {
            projectId,
            amount,
            type,
            category,
            description,
            paymentMethod,
            date,
            reference
        } = req.body;

        const payment = await Payment.create({
            projectId,
            amount,
            type,
            category,
            description,
            paymentMethod,
            date,
            reference,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Payment recorded successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to record payment",
            error: error.message
        });
    }
};

const getProjectPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            projectId: req.params.projectId
        }).sort({ date: -1 });

        const received = payments
            .filter(p => p.type === "received")
            .reduce((sum, p) => sum + p.amount, 0);

        const paid = payments
            .filter(p => p.type === "paid")
            .reduce((sum, p) => sum + p.amount, 0);

        res.json({
            count: payments.length,
            received,
            paid,
            balance: received - paid,
            payments
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch payments",
            error: error.message
        });
    }
};

module.exports = {
    createPayment,
    getProjectPayments
};