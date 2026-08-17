const Task = require("../models/Task");
const Worker = require("../models/Worker");
const Notification = require("../models/Notification");


const createTask = async (req, res) => {
    try {

        const {
            projectId,
            title,
            description,
            assignedTo,
            priority,
            status,
            dueDate
        } = req.body;


        // Validate assigned worker
        let worker = null;

        if (assignedTo) {

            worker = await Worker.findOne({
                _id: assignedTo,
                projectId: projectId,
                status: "active"
            });

            if (!worker) {
                return res.status(400).json({
                    message:
                        "Worker does not belong to this project or is inactive"
                });
            }
        }


        const task = await Task.create({

            projectId,

            title,

            description,

            assignedTo:
                assignedTo || null,

            priority:
                priority || "medium",

            status:
                status || "pending",

            dueDate:
                dueDate || null,

            createdBy:
                req.user.id
        });


        // Create notification when task is assigned
        if (worker) {

            await Notification.create({

                projectId,

                title: "New Task Assigned",

                message:
                    `Task "${title}" has been assigned to ${worker.name}.`,

                type: "task",

                createdBy:
                    req.user.id
            });
        }


        const populatedTask =
            await Task.findById(task._id)
                .populate(
                    "assignedTo",
                    "name role phone"
                );


        res.status(201).json({

            message:
                "Task created successfully",

            task:
                populatedTask
        });


    } catch (error) {

        console.error(
            "Create task error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to create task",

            error:
                error.message
        });
    }
};



// Get Project Tasks
const getProjectTasks = async (req, res) => {

    try {

        const tasks =
            await Task.find({
                projectId:
                    req.params.projectId
            })
            .populate(
                "assignedTo",
                "name role phone"
            )
            .sort({
                createdAt: -1
            });


        res.json({

            count:
                tasks.length,

            tasks:
                tasks
        });


    } catch (error) {

        res.status(500).json({

            message:
                "Failed to fetch tasks",

            error:
                error.message
        });
    }
};



const updateTask = async (req, res) => {

    try {

        const task =
            await Task.findById(req.params.id);


        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });
        }


        const oldAssignedTo =
            task.assignedTo
                ? task.assignedTo.toString()
                : null;

        const oldStatus =
            task.status;


        // Validate new worker
        let worker = null;

        if (
            req.body.assignedTo !== undefined &&
            req.body.assignedTo !== null &&
            req.body.assignedTo !== ""
        ) {

            worker =
                await Worker.findOne({
                    _id: req.body.assignedTo,
                    projectId: task.projectId,
                    status: "active"
                });


            if (!worker) {

                return res.status(400).json({
                    message:
                        "Worker does not belong to this project or is inactive"
                });
            }
        }


        // Update allowed fields
        const allowedFields = [
            "title",
            "description",
            "assignedTo",
            "priority",
            "status",
            "dueDate"
        ];


        allowedFields.forEach(field => {

            if (
                req.body[field] !== undefined
            ) {

                task[field] =
                    req.body[field];
            }
        });


        await task.save();


        // Notification for reassignment
        const newAssignedTo =
            task.assignedTo
                ? task.assignedTo.toString()
                : null;


        if (
            newAssignedTo &&
            newAssignedTo !== oldAssignedTo
        ) {

            const assignedWorker =
                worker ||
                await Worker.findById(
                    task.assignedTo
                );


            if (assignedWorker) {

                await Notification.create({

                    projectId:
                        task.projectId,

                    title:
                        "Task Assigned",

                    message:
                        `Task "${task.title}" has been assigned to ${assignedWorker.name}.`,

                    type:
                        "task",

                    createdBy:
                        req.user.id
                });
            }
        }


        // Notification for status change
        if (
            req.body.status !== undefined &&
            oldStatus !== task.status
        ) {

            const readableStatus =
                task.status
                    .replace("_", " ");

            await Notification.create({

                projectId:
                    task.projectId,

                title:
                    "Task Status Updated",

                message:
                    `Task "${task.title}" is now ${readableStatus}.`,

                type:
                    "task",

                createdBy:
                    req.user.id
            });
        }


        const updatedTask =
            await Task.findById(
                task._id
            )
            .populate(
                "assignedTo",
                "name role phone"
            );


        res.json({

            message:
                "Task updated successfully",

            task:
                updatedTask
        });


    } catch (error) {

        console.error(
            "Update task error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update task",

            error:
                error.message
        });
    }
};



module.exports = {
    createTask,
    getProjectTasks,
    updateTask
};