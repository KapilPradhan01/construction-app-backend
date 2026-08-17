const express = require("express");

const {
    createInvoice,
    getProjectInvoices
} = require("../controllers/invoiceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createInvoice);

router.get(
    "/project/:projectId",
    protect,
    getProjectInvoices
);

module.exports = router;