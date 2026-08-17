const express = require("express");

const {
    createExpense,
    getProjectExpenses
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createExpense);

router.get(
    "/project/:projectId",
    protect,
    getProjectExpenses
);

module.exports = router;