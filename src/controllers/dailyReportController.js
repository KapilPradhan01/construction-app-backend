const DailyReport = require("../models/DailyReport");

const createDailyReport = async (req, res) => {
    try {
        const {
            projectId,
            date,
            workDone,
            workersPresent,
            materialsUsed,
            issues,
            remarks,
            photos
        } = req.body;

        const report = await DailyReport.create({
            projectId,
            date,
            workDone,
            workersPresent,
            materialsUsed,
            issues,
            remarks,
            photos,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Daily report created successfully",
            report
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create daily report",
            error: error.message
        });
    }
};

const getProjectReports = async (req, res) => {
    try {
        const reports = await DailyReport.find({
            projectId: req.params.projectId
        }).sort({ date: -1 });

        res.json({
            count: reports.length,
            reports
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch daily reports",
            error: error.message
        });
    }
};

module.exports = {
    createDailyReport,
    getProjectReports
};