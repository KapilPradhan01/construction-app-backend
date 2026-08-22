const DailyReport = require("../models/DailyReport");
const { requireOwnedProject } = require("../utils/projectAccess");

const createDailyReport = async (req, res) => {
    try {
        const { projectId, date, workDone, workersPresent, materialsUsed, issues, remarks, photos } = req.body;
        if (!await requireOwnedProject(req, res, projectId)) return;
        const report = await DailyReport.create({ projectId, date, workDone, workersPresent, materialsUsed, issues, remarks, photos, createdBy: req.user.id });
        res.status(201).json({ message: "Daily report created successfully", report });
    } catch (error) { res.status(500).json({ message: "Failed to create daily report", error: error.message }); }
};

const getProjectReports = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const reports = await DailyReport.find({ projectId: req.params.projectId }).sort({ date: -1 });
        res.json({ count: reports.length, reports });
    } catch (error) { res.status(500).json({ message: "Failed to fetch daily reports", error: error.message }); }
};

const updateDailyReport = async (req, res) => {
    try {
        const report = await DailyReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Daily report not found" });
        if (!await requireOwnedProject(req, res, report.projectId)) return;
        ["date", "workDone", "workersPresent", "materialsUsed", "issues", "remarks", "photos"].forEach(field => {
            if (req.body[field] !== undefined) report[field] = req.body[field];
        });
        await report.save();
        res.json({ message: "Daily report updated successfully", report });
    } catch (error) { res.status(500).json({ message: "Failed to update daily report", error: error.message }); }
};

const deleteDailyReport = async (req, res) => {
    try {
        const report = await DailyReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Daily report not found" });
        if (!await requireOwnedProject(req, res, report.projectId)) return;
        await DailyReport.deleteOne({ _id: report._id });
        res.json({ message: "Daily report deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete daily report", error: error.message }); }
};

module.exports = { createDailyReport, getProjectReports, updateDailyReport, deleteDailyReport };