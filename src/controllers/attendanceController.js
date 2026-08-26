const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");
const Advance = require("../models/Advance");
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

        const projectId = req.params.projectId;

        // =================================================
        // CHECK PROJECT ACCESS
        // =================================================

        if (
            !await requireOwnedProject(
                req,
                res,
                projectId
            )
        ) return;


        // =================================================
        // GET ATTENDANCE
        // =================================================

        const attendance =
            await Attendance.find({
                projectId
            }).populate(
                "workerId",
                "name role dailyWage"
            );


        // =================================================
        // GET ALL ADVANCES FOR PROJECT
        // =================================================

        const advances =
            await Advance.find({
                projectId
            });


        // =================================================
        // WORKER SALARY MAP
        // =================================================

        const workerMap = {};


        // =================================================
        // CALCULATE SALARY FROM ATTENDANCE
        // =================================================

        attendance.forEach(record => {

            if (!record.workerId) {
                return;
            }


            const workerId =
                record.workerId._id.toString();


            // ---------------------------------------------
            // CREATE WORKER ENTRY
            // ---------------------------------------------

            if (!workerMap[workerId]) {

                workerMap[workerId] = {

                    workerId,

                    name:
                        record.workerId.name,

                    role:
                        record.workerId.role,

                    dailyWage:
                        record.workerId.dailyWage,

                    presentDays: 0,

                    halfDays: 0,

                    absentDays: 0,

                    // Salary earned from attendance
                    earnedAmount: 0,

                    // New fields
                    grossSalary: 0,

                    totalAdvance: 0,

                    finalSalary: 0
                };
            }


            const worker =
                workerMap[workerId];


            // ---------------------------------------------
            // PRESENT
            // ---------------------------------------------

            if (
                record.status === "present"
            ) {

                worker.presentDays += 1;

                worker.earnedAmount +=
                    worker.dailyWage;
            }


            // ---------------------------------------------
            // HALF DAY
            // ---------------------------------------------

            else if (
                record.status === "half_day"
            ) {

                worker.halfDays += 1;

                worker.earnedAmount +=
                    worker.dailyWage * 0.5;
            }


            // ---------------------------------------------
            // ABSENT
            // ---------------------------------------------

            else if (
                record.status === "absent"
            ) {

                worker.absentDays += 1;
            }
        });


        // =================================================
        // CALCULATE ADVANCES PER WORKER
        // =================================================

        advances.forEach(advance => {

            const workerId =
                advance.workerId.toString();


            // ---------------------------------------------
            // Worker may not have attendance yet
            // ---------------------------------------------

            if (!workerMap[workerId]) {

                return;
            }


            workerMap[workerId].totalAdvance +=
                Number(advance.amount) || 0;
        });


        // =================================================
        // FINAL SALARY CALCULATION
        // =================================================

        const workers =
            Object.values(workerMap);


        workers.forEach(worker => {

            // Gross salary earned from attendance
            worker.grossSalary =
                worker.earnedAmount;


            // Final amount still payable
            worker.finalSalary =
                Math.max(
                    0,
                    worker.grossSalary -
                    worker.totalAdvance
                );
        });


        // =================================================
        // PROJECT TOTALS
        // =================================================

        const totalLaborCost =
            workers.reduce(
                (sum, worker) =>
                    sum + worker.grossSalary,
                0
            );


        const totalAdvance =
            workers.reduce(
                (sum, worker) =>
                    sum + worker.totalAdvance,
                0
            );


        const finalLaborCost =
            workers.reduce(
                (sum, worker) =>
                    sum + worker.finalSalary,
                0
            );


        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            projectId,

            // Total salary earned by workers
            // before advance deduction
            totalLaborCost,

            // Total amount already given as advance
            totalAdvance,

            // Amount still payable
            finalLaborCost,

            workers
        });


    } catch (error) {

        console.error(
            "Calculate labor cost error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to calculate labor cost",

            error:
                error.message
        });
    }
};

// =====================================================
// GET WORKER SALARY DETAILS
// =====================================================

const getWorkerSalaryDetails = async (req, res) => {

    try {

        const {
            projectId,
            workerId
        } = req.params;


        // =================================================
        // CHECK PROJECT ACCESS
        // =================================================

        if (
            !await requireOwnedProject(
                req,
                res,
                projectId
            )
        ) return;


        // =================================================
        // FIND WORKER
        // =================================================

        const worker =
            await Worker.findOne({
                _id: workerId,
                projectId
            });


        if (!worker) {

            return res.status(404).json({

                message:
                    "Worker not found"
            });
        }


        // =================================================
        // GET ATTENDANCE
        // =================================================

        const attendance =
            await Attendance.find({
                projectId,
                workerId
            }).sort({
                date: -1
            });


        // =================================================
        // GET ADVANCES
        // =================================================

        const advances =
            await Advance.find({
                projectId,
                workerId
            }).sort({
                date: -1
            });


        // =================================================
        // ATTENDANCE CALCULATION
        // =================================================

        let presentDays = 0;
        let halfDays = 0;
        let absentDays = 0;


        attendance.forEach(record => {

            if (
                record.status === "present"
            ) {

                presentDays++;
            }

            else if (
                record.status === "half_day"
            ) {

                halfDays++;
            }

            else if (
                record.status === "absent"
            ) {

                absentDays++;
            }
        });


        // =================================================
        // SALARY CALCULATION
        // =================================================

        const dailyWage =
            Number(worker.dailyWage) || 0;


        const presentSalary =
            presentDays * dailyWage;


        const halfDaySalary =
            halfDays * dailyWage * 0.5;


        const grossSalary =
            presentSalary +
            halfDaySalary;


        // =================================================
        // ADVANCE CALCULATION
        // =================================================

        const totalAdvance =
            advances.reduce(
                (sum, advance) =>
                    sum +
                    (Number(advance.amount) || 0),
                0
            );


        // =================================================
        // FINAL SALARY
        // =================================================

        const finalSalary =
            Math.max(
                0,
                grossSalary -
                totalAdvance
            );


        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            worker: {

                workerId:
                    worker._id,

                name:
                    worker.name,

                role:
                    worker.role,

                phone:
                    worker.phone,

                dailyWage:
                    worker.dailyWage,

                status:
                    worker.status
            },


            attendanceSummary: {

                presentDays,

                halfDays,

                absentDays,

                presentSalary,

                halfDaySalary,

                grossSalary
            },


            advanceSummary: {

                totalAdvance,

                finalSalary,

                advances
            },


            attendance

        });


    } catch (error) {

        console.error(
            "Get worker salary details error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch worker salary details",

            error:
                error.message
        });
    }
};

module.exports = {
    markAttendance,
    getProjectAttendance,
    updateAttendance,
    deleteAttendance,
    getProjectLaborCost,
    getWorkerSalaryDetails
};
