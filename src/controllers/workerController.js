const Worker = require("../models/Worker");

const createWorker = async (req, res) => {
    try {
        const {
            projectId,
            name,
            phone,
            role,
            dailyWage,
            status
        } = req.body;

        const worker = await Worker.create({
            projectId,
            name,
            phone,
            role,
            dailyWage,
            status,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Worker created successfully",
            worker
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create worker",
            error: error.message
        });
    }
};

const getProjectWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({
            projectId: req.params.projectId
        }).sort({ createdAt: -1 });

        res.json({
            count: workers.length,
            workers
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch workers",
            error: error.message
        });
    }
};

module.exports = {
    createWorker,
    getProjectWorkers
};