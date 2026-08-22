const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");
const { requireOwnedProject } = require("../utils/projectAccess");

const markAttendance = async (req, res) => {
    try {
        const { projectId, workerId, date, status, checkIn, checkOut, remarks } = req.body;
        if (!projectId || !workerId || !date) return res.status(400).json({ message: "projectId, workerId and date are required" });
        if (!await requireOwnedProject(req, res, projectId)) return;
        const worker = await Worker.findOne({ _id: workerId, projectId });
        if (!worker) return res.status(400).json({ message: "Worker does not belong to this project" });

        const existing = await Attendance.findOne({ projectId, workerId, date });
        if (existing) {
            existing.status = status || existing.status;
            existing.checkIn = checkIn ?? existing.checkIn;
            existing.checkOut = checkOut ?? existing.checkOut;
            existing.remarks = remarks ?? existing.remarks;
            await existing.save();
            const attendance = await Attendance.findById(existing._id).populate("workerId", "name role dailyWage");
            return res.json({ message: "Attendance updated successfully", attendance });
        }

        const attendance = await Attendance.create({ projectId, workerId, date, status: status || "present", checkIn: checkIn || "", checkOut: checkOut || "", remarks: remarks || "", createdBy: req.user.id });
        const populated = await Attendance.findById(attendance._id).populate("workerId", "name role dailyWage");
        res.status(201).json({ message: "Attendance marked successfully", attendance: populated });
    } catch (error) {
        console.error("Mark attendance error:", error);
        res.status(500).json({ message: "Failed to mark attendance", error: error.message });
    }
};

const getProjectAttendance = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const attendance = await Attendance.find({ projectId: req.params.projectId }).populate("workerId", "name role dailyWage").sort({ date: -1, createdAt: -1 });
        res.json({ count: attendance.length, attendance });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: "Attendance record not found" });
        if (!await requireOwnedProject(req, res, attendance.projectId)) return;
        if (req.body.workerId && req.body.workerId !== attendance.workerId.toString()) {
            const worker = await Worker.findOne({ _id: req.body.workerId, projectId: attendance.projectId });
            if (!worker) return res.status(400).json({ message: "Worker does not belong to this project" });
            attendance.workerId = req.body.workerId;
        }
        ["date", "status", "checkIn", "checkOut", "remarks"].forEach(field => {
            if (req.body[field] !== undefined) attendance[field] = req.body[field];
        });
        await attendance.save();
        const updated = await Attendance.findById(attendance._id).populate("workerId", "name role dailyWage");
        res.json({ message: "Attendance updated successfully", attendance: updated });
    } catch (error) {
        res.status(500).json({ message: "Failed to update attendance", error: error.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: "Attendance record not found" });
        if (!await requireOwnedProject(req, res, attendance.projectId)) return;
        await Attendance.deleteOne({ _id: attendance._id });
        res.json({ message: "Attendance deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete attendance", error: error.message });
    }
};

const getProjectLaborCost = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const attendance = await Attendance.find({ projectId: req.params.projectId }).populate("workerId", "name role dailyWage");
        const workerMap = {};
        attendance.forEach(record => {
            if (!record.workerId) return;
            const workerId = record.workerId._id.toString();
            if (!workerMap[workerId]) workerMap[workerId] = { workerId, name: record.workerId.name, role: record.workerId.role, dailyWage: record.workerId.dailyWage, presentDays: 0, halfDays: 0, absentDays: 0, earnedAmount: 0 };
            const worker = workerMap[workerId];
            if (record.status === "present") { worker.presentDays += 1; worker.earnedAmount += worker.dailyWage; }
            else if (record.status === "half_day") { worker.halfDays += 1; worker.earnedAmount += worker.dailyWage * 0.5; }
            else if (record.status === "absent") worker.absentDays += 1;
        });
        const workers = Object.values(workerMap);
        res.json({ projectId: req.params.projectId, totalLaborCost: workers.reduce((sum, worker) => sum + worker.earnedAmount, 0), workers });
    } catch (error) {
        res.status(500).json({ message: "Failed to calculate labor cost", error: error.message });
    }
};

module.exports = { markAttendance, getProjectAttendance, getProjectLaborCost, updateAttendance, deleteAttendance };