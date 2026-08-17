const express = require("express");

const {
    createPayment,
    getProjectPayments
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPayment);

router.get(
    "/project/:projectId",
    protect,
    getProjectPayments
);

module.exports = router;