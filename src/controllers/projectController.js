const Project = require("../models/Project");
const Worker = require("../models/Worker");
const Attendance = require("../models/Attendance");
const Expense = require("../models/Expense");
const Material = require("../models/Material");
const Payment = require("../models/Payment");
const DailyReport = require("../models/DailyReport");
const Task = require("../models/Task");
const Invoice = require("../models/Invoice");
const Document = require("../models/Document");
const Notification = require("../models/Notification");
const supabase = require("../config/supabase");

const createProject = async (req, res) => {
    try {
        const { name, clientName, clientPhone, location, budget, startDate, expectedEndDate, description } = req.body;
        const project = await Project.create({ name, clientName, clientPhone, location, budget, startDate, expectedEndDate, description, createdBy: req.user.id });
        res.status(201).json({ message: "Project created successfully", project });
    } catch (error) { res.status(500).json({ message: "Failed to create project", error: error.message }); }
};

const getProjects = async (req, res) => {

    try {

        const projects = await Project
            .find({ createdBy: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        const projectsWithFinancials = await Promise.all(

            projects.map(async (project) => {

                // =========================================
                // TOTAL EXPENSE
                // =========================================

                const expenseData = await Expense.aggregate([

                    {
                        $match: {
                            projectId: project._id
                        }
                    },

                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: "$amount"
                            }
                        }
                    }

                ]);

                const totalExpense =
                    expenseData.length > 0
                        ? expenseData[0].total
                        : 0;


                // =========================================
                // TOTAL PAYMENT RECEIVED
                // =========================================

                const paymentData = await Payment.aggregate([

                    {
                        $match: {
                            projectId: project._id
                        }
                    },

                    {
                        $group: {
                            _id: null,
                            totalReceived: {
                                $sum: "$amount"
                            }
                        }
                    }

                ]);

                const totalReceived =
                    paymentData.length > 0
                        ? paymentData[0].totalReceived
                        : 0;


                // =========================================
                // RETURN PROJECT
                // =========================================

                return {

                    ...project,

                    totalExpense,

                    totalReceived

                };

            })

        );


        res.json({

            count: projectsWithFinancials.length,

            projects: projectsWithFinancials

        });

    } catch (error) {

        res.status(500).json({

            message: "Failed to fetch projects",

            error: error.message

        });

    }

};

const updateProject = async (req, res) => {
    try {

        const updateData = {};

        const allowedFields = [
            "name",
            "clientName",
            "clientPhone",
            "location",
            "budget",
            "startDate",
            "expectedEndDate",
            "progress",
            "status",
            "description"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.user.id
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found or not authorized"
            });
        }

        res.json({
            message: "Project updated successfully",
            project
        });

    } catch (error) {

        console.error("Update project error:", error);

        res.status(500).json({
            message: "Failed to update project",
            error: error.message
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, createdBy: req.user.id });
        if (!project) return res.status(404).json({ message: "Project not found or not authorized" });
        const documents = await Document.find({ projectId: project._id });
        const storagePaths = documents.map(d => d.storagePath).filter(Boolean);
        if (storagePaths.length) {
            const { error } = await supabase.storage.from(process.env.SUPABASE_BUCKET).remove(storagePaths);
            if (error) console.error("Project document cleanup error:", error.message);
        }
        await Promise.all([
            Worker.deleteMany({ projectId: project._id }),
            Attendance.deleteMany({ projectId: project._id }),
            Expense.deleteMany({ projectId: project._id }),
            Material.deleteMany({ projectId: project._id }),
            Payment.deleteMany({ projectId: project._id }),
            DailyReport.deleteMany({ projectId: project._id }),
            Task.deleteMany({ projectId: project._id }),
            Invoice.deleteMany({ projectId: project._id }),
            Document.deleteMany({ projectId: project._id }),
            Notification.deleteMany({ projectId: project._id }),
            Project.deleteOne({ _id: project._id })
        ]);
        res.json({ message: "Project and all project data deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete project", error: error.message }); }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };