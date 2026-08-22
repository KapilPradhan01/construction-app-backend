const express = require("express");

const {
    createPayment,
    getProjectPayments,
    updatePayment,
    deletePayment
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create payment
router.post(
    "/",
    protect,
    createPayment
);


// Get project payments
router.get(
    "/project/:projectId",
    protect,
    getProjectPayments
);


// Update payment
router.put(
    "/:id",
    protect,
    updatePayment
);


// Delete payment
router.delete(
    "/:id",
    protect,
    deletePayment
);


module.exports = router;