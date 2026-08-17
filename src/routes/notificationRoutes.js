const express = require("express");

const {
    createNotification,
    getNotifications,
    markAsRead
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createNotification);

router.get(
    "/",
    protect,
    getNotifications
);

router.put(
    "/:id/read",
    protect,
    markAsRead
);

module.exports = router;