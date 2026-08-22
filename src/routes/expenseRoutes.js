const express = require("express");

const {
    createExpense,
    getProjectExpenses,
    updateExpense,
    deleteExpense
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create expense
router.post(
    "/",
    protect,
    createExpense
);


// Get project expenses
router.get(
    "/project/:projectId",
    protect,
    getProjectExpenses
);


// Update expense
router.put(
    "/:id",
    protect,
    updateExpense
);


// Delete expense
router.delete(
    "/:id",
    protect,
    deleteExpense
);


module.exports = router;