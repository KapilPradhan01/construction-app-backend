const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");

const markAttendance = async (req, res) => {
    try {

        const {
            projectId,
            workerId,
            date,
            status,
            checkIn,
            checkOut,
            remarks
        } = req.body;


        // Validate required fields
        if (!projectId || !workerId || !date) {

            return res.status(400).json({
                message:
                    "projectId, workerId and date are required"
            });
        }


        // Check that worker belongs to project
        const worker = await Worker.findOne({
            _id: workerId,
            projectId: projectId
        });


        if (!worker) {

            return res.status(400).json({
                message:
                    "Worker does not belong to this project"
            });
        }


        // Check if attendance already exists
        const existingAttendance =
            await Attendance.findOne({
                projectId,
                workerId,
                date
            });


        if (existingAttendance) {

            // Update existing attendance
            existingAttendance.status =
                status || existingAttendance.status;

            existingAttendance.checkIn =
                checkIn ?? existingAttendance.checkIn;

            existingAttendance.checkOut =
                checkOut ?? existingAttendance.checkOut;

            existingAttendance.remarks =
                remarks ?? existingAttendance.remarks;

            await existingAttendance.save();


            const updatedAttendance =
                await Attendance.findById(
                    existingAttendance._id
                ).populate(
                    "workerId",
                    "name role dailyWage"
                );


            return res.json({

                message:
                    "Attendance updated successfully",

                attendance:
                    updatedAttendance
            });
        }


        // Create new attendance
        const attendance =
            await Attendance.create({

                projectId,

                workerId,

                date,

                status:
                    status || "present",

                checkIn:
                    checkIn || "",

                checkOut:
                    checkOut || "",

                remarks:
                    remarks || "",

                createdBy:
                    req.user.id
            });


        const populatedAttendance =
            await Attendance.findById(
                attendance._id
            ).populate(
                "workerId",
                "name role dailyWage"
            );


        res.status(201).json({

            message:
                "Attendance marked successfully",

            attendance:
                populatedAttendance
        });


    } catch (error) {

        console.error(
            "Mark attendance error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to mark attendance",

            error:
                error.message
        });
    }
};


const getProjectAttendance = async (req, res) => {

    try {

        const attendance =
            await Attendance.find({

                projectId:
                    req.params.projectId

            })
            .populate(
                "workerId",
                "name role dailyWage"
            )
            .sort({
                date: -1,
                createdAt: -1
            });


        res.json({

            count:
                attendance.length,

            attendance
        });


    } catch (error) {

        console.error(
            "Get attendance error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch attendance",

            error:
                error.message
        });
    }
};

const getProjectLaborCost = async (req, res) => {
    try {

        const attendance = await Attendance.find({
            projectId: req.params.projectId
        }).populate(
            "workerId",
            "name role dailyWage"
        );


        const workerMap = {};


        attendance.forEach(record => {

            if (!record.workerId) {
                return;
            }


            const workerId =
                record.workerId._id.toString();


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

                    earnedAmount: 0
                };
            }


            const worker =
                workerMap[workerId];


            if (
                record.status === "present"
            ) {

                worker.presentDays += 1;

                worker.earnedAmount +=
                    worker.dailyWage;
            }


            else if (
                record.status === "half_day"
            ) {

                worker.halfDays += 1;

                worker.earnedAmount +=
                    worker.dailyWage * 0.5;
            }


            else if (
                record.status === "absent"
            ) {

                worker.absentDays += 1;
            }
        });


        const workers =
            Object.values(workerMap);


        const totalLaborCost =
            workers.reduce(
                (sum, worker) =>
                    sum + worker.earnedAmount,
                0
            );


        res.json({

            projectId:
                req.params.projectId,

            totalLaborCost,

            workers
        });


    } catch (error) {

        console.error(
            "Labor cost error:",
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


module.exports = {
    markAttendance,
    getProjectAttendance,
    getProjectLaborCost
};