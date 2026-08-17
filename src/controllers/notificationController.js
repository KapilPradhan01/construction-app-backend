const Notification = require("../models/Notification");

const createNotification = async (req, res) => {
    try {
        const {
            projectId,
            title,
            message,
            type
        } = req.body;

        const notification = await Notification.create({
            projectId,
            title,
            message,
            type,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create notification",
            error: error.message
        });
    }
};

const getNotifications = async (req, res) => {
    try {
        const filter = {};

        if (req.query.projectId) {
            filter.projectId = req.query.projectId;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 });

        const unreadCount = notifications.filter(
            notification => !notification.isRead
        ).length;

        res.json({
            count: notifications.length,
            unreadCount,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update notification",
            error: error.message
        });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead
};