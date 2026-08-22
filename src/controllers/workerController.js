const Worker = require("../models/Worker");
const { requireOwnedProject } = require("../utils/projectAccess");

const createWorker = async (req, res) => {
    try {
        const { projectId, name, phone, role, dailyWage, status } = req.body;
        if (!await requireOwnedProject(req, res, projectId)) return;
        const worker = await Worker.create({ projectId, name, phone, role, dailyWage, status, createdBy: req.user.id });
        res.status(201).json({ message: "Worker created successfully", worker });
    } catch (error) {
        res.status(500).json({ message: "Failed to create worker", error: error.message });
    }
};

const getProjectWorkers = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const workers = await Worker.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
        res.json({ count: workers.length, workers });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch workers", error: error.message });
    }
};

const updateWorker = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (!worker) return res.status(404).json({ message: "Worker not found" });
        if (!await requireOwnedProject(req, res, worker.projectId)) return;
        ["name", "phone", "role", "dailyWage", "status"].forEach(field => {
            if (req.body[field] !== undefined) worker[field] = req.body[field];
        });
        await worker.save();
        res.json({ message: "Worker updated successfully", worker });
    } catch (error) {
        res.status(500).json({ message: "Failed to update worker", error: error.message });
    }
};

const deleteWorker = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (!worker) return res.status(404).json({ message: "Worker not found" });
        if (!await requireOwnedProject(req, res, worker.projectId)) return;
        await Worker.deleteOne({ _id: worker._id });
        res.json({ message: "Worker deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete worker", error: error.message });
    }
};

module.exports = { createWorker, getProjectWorkers, updateWorker, deleteWorker };