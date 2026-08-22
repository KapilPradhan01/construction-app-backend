const Task = require("../models/Task");
const Worker = require("../models/Worker");
const Notification = require("../models/Notification");
const { requireOwnedProject } = require("../utils/projectAccess");

const createTask = async (req, res) => {
    try {
        const { projectId, title, description, assignedTo, priority, status, dueDate } = req.body;
        if (!await requireOwnedProject(req, res, projectId)) return;
        let worker = null;
        if (assignedTo) {
            worker = await Worker.findOne({ _id: assignedTo, projectId, status: "active" });
            if (!worker) return res.status(400).json({ message: "Worker does not belong to this project or is inactive" });
        }
        const task = await Task.create({ projectId, title, description, assignedTo: assignedTo || null, priority: priority || "medium", status: status || "pending", dueDate: dueDate || null, createdBy: req.user.id });
        if (worker) await Notification.create({ projectId, title: "New Task Assigned", message: `Task "${title}" has been assigned to ${worker.name}.`, type: "task", createdBy: req.user.id });
        const populatedTask = await Task.findById(task._id).populate("assignedTo", "name role phone");
        res.status(201).json({ message: "Task created successfully", task: populatedTask });
    } catch (error) { res.status(500).json({ message: "Failed to create task", error: error.message }); }
};

const getProjectTasks = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const tasks = await Task.find({ projectId: req.params.projectId }).populate("assignedTo", "name role phone").sort({ createdAt: -1 });
        res.json({ count: tasks.length, tasks });
    } catch (error) { res.status(500).json({ message: "Failed to fetch tasks", error: error.message }); }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (!await requireOwnedProject(req, res, task.projectId)) return;
        const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;
        const oldStatus = task.status;
        let worker = null;
        if (req.body.assignedTo !== undefined && req.body.assignedTo !== null && req.body.assignedTo !== "") {
            worker = await Worker.findOne({ _id: req.body.assignedTo, projectId: task.projectId, status: "active" });
            if (!worker) return res.status(400).json({ message: "Worker does not belong to this project or is inactive" });
        }
        ["title", "description", "assignedTo", "priority", "status", "dueDate"].forEach(field => {
            if (req.body[field] !== undefined) task[field] = req.body[field];
        });
        if (req.body.assignedTo === null || req.body.assignedTo === "") task.assignedTo = null;
        await task.save();
        const newAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;
        if (newAssignedTo && newAssignedTo !== oldAssignedTo) {
            const assignedWorker = worker || await Worker.findById(task.assignedTo);
            if (assignedWorker) await Notification.create({ projectId: task.projectId, title: "Task Assigned", message: `Task "${task.title}" has been assigned to ${assignedWorker.name}.`, type: "task", createdBy: req.user.id });
        }
        if (req.body.status !== undefined && oldStatus !== task.status) {
            await Notification.create({ projectId: task.projectId, title: "Task Status Updated", message: `Task "${task.title}" is now ${task.status.replace("_", " ")}.`, type: "task", createdBy: req.user.id });
        }
        const updatedTask = await Task.findById(task._id).populate("assignedTo", "name role phone");
        res.json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) { res.status(500).json({ message: "Failed to update task", error: error.message }); }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (!await requireOwnedProject(req, res, task.projectId)) return;
        await Task.deleteOne({ _id: task._id });
        res.json({ message: "Task deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete task", error: error.message }); }
};

module.exports = { createTask, getProjectTasks, updateTask, deleteTask };