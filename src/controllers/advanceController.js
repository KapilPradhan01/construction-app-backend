const Advance = require("../models/Advance");
const { requireOwnedProject } = require("../utils/projectAccess");

// =====================================================
// CREATE ADVANCE
// =====================================================

const createAdvance = async (req, res) => {

    try {

        const {
            projectId,
            workerId,
            date,
            amount,
            paymentMethod,
            description
        } = req.body;

        if (
            !projectId ||
            !workerId ||
            !date ||
            amount === undefined ||
            !paymentMethod
        ) {

            return res.status(400).json({
                message:
                    "projectId, workerId, date, amount and paymentMethod are required"
            });
        }

        if (
            !await requireOwnedProject(
                req,
                res,
                projectId
            )
        ) return;

        const advance = await Advance.create({

            projectId,

            workerId,

            date,

            amount,

            paymentMethod,

            description:
                description
                    ? description.trim()
                    : "",

            createdBy:
                req.user.id
        });

        const populatedAdvance =
            await Advance.findById(
                advance._id
            ).populate(
                "workerId"
            );

        res.status(201).json({

            message:
                "Advance created successfully",

            advance:
                populatedAdvance
        });

    } catch (error) {

        console.error(
            "Create advance error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to create advance",

            error:
                error.message
        });
    }
};


// =====================================================
// GET WORKER ADVANCES
// =====================================================

const getWorkerAdvances = async (req, res) => {

    try {

        const {
            projectId,
            workerId
        } = req.params;

        if (
            !await requireOwnedProject(
                req,
                res,
                projectId
            )
        ) return;

        const advances =
            await Advance.find({
                projectId,
                workerId
            })
            .sort({
                date: -1,
                createdAt: -1
            })
            .populate(
                "workerId"
            );

        const total =
            advances.reduce(
                (sum, advance) =>
                    sum + advance.amount,
                0
            );

        res.json({

            count:
                advances.length,

            total,

            advances
        });

    } catch (error) {

        console.error(
            "Get worker advances error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch advances",

            error:
                error.message
        });
    }
};


// =====================================================
// UPDATE ADVANCE
// =====================================================

const updateAdvance = async (req, res) => {

    try {

        const advance =
            await Advance.findById(
                req.params.id
            );

        if (!advance) {

            return res.status(404).json({

                message:
                    "Advance not found"
            });
        }

        if (
            !await requireOwnedProject(
                req,
                res,
                advance.projectId
            )
        ) return;

        const {
            date,
            amount,
            paymentMethod,
            description
        } = req.body;

        if (date !== undefined) {

            advance.date =
                date;
        }

        if (amount !== undefined) {

            const numericAmount =
                Number(amount);

            if (
                Number.isNaN(numericAmount) ||
                numericAmount < 0
            ) {

                return res.status(400).json({

                    message:
                        "Invalid advance amount"
                });
            }

            advance.amount =
                numericAmount;
        }

        if (paymentMethod !== undefined) {

            const allowedMethods = [
                "upi",
                "cash",
                "card",
                "bank_transfer",
                "cheque",
                "other"
            ];

            if (
                !allowedMethods.includes(
                    paymentMethod
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid payment method"
                });
            }

            advance.paymentMethod =
                paymentMethod;
        }

        if (description !== undefined) {

            advance.description =
                description;
        }

        await advance.save();

        const populatedAdvance =
            await Advance.findById(
                advance._id
            ).populate(
                "workerId"
            );

        res.json({

            message:
                "Advance updated successfully",

            advance:
                populatedAdvance
        });

    } catch (error) {

        console.error(
            "Update advance error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update advance",

            error:
                error.message
        });
    }
};


// =====================================================
// DELETE ADVANCE
// =====================================================

const deleteAdvance = async (req, res) => {

    try {

        const advance =
            await Advance.findById(
                req.params.id
            );

        if (!advance) {

            return res.status(404).json({

                message:
                    "Advance not found"
            });
        }

        if (
            !await requireOwnedProject(
                req,
                res,
                advance.projectId
            )
        ) return;

        await Advance.deleteOne({
            _id:
                advance._id
        });

        res.json({

            message:
                "Advance deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete advance error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to delete advance",

            error:
                error.message
        });
    }
};


module.exports = {

    createAdvance,

    getWorkerAdvances,

    updateAdvance,

    deleteAdvance
};