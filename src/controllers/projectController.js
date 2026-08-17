const Project = require("../models/Project");

const createProject = async (req, res) => {
    try {
        const {
            name,
            clientName,
            clientPhone,
            location,
            budget,
            startDate,
            expectedEndDate,
            description
        } = req.body;

        const project = await Project.create({
            name,
            clientName,
            clientPhone,
            location,
            budget,
            startDate,
            expectedEndDate,
            description,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create project",
            error: error.message
        });
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            createdBy: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
            count: projects.length,
            projects
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};

module.exports = {
    createProject,
    getProjects
};